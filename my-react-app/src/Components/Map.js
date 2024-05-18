import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue, push, set } from 'firebase/database';

import customMarkerIcon from '../maps-flags_447031.png';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

const Map = () => {
  const mapRef = React.useRef();
  const [drawnLayers, setDrawnLayers] = useState([]);
  const [bandobastDetails, setBandobastDetails] = useState({
    title: '',
    personnel: [],
    date: '',
    startTime: '',
    endTime: '',
    coordinates: [],
    circle: null // Add circle data
  });
  const [showForm, setShowForm] = useState(false);
  const [personnelOptions, setPersonnelOptions] = useState([]);

  useEffect(() => {
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Add geocoder control to the map
    const geocoder = L.Control.Geocoder.nominatim();
    L.Control.geocoder({
      geocoder: geocoder,
      position: 'topright',
      placeholder: 'Search for location...'
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: true,
        polygon: true,
        polyline: true,
        circle: true,
        marker: {
          icon: new L.Icon({
            iconUrl: customMarkerIcon,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        },
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    map.on('draw:created', function (event) {
      const { layer, layerType } = event;
      
      switch (layerType) {
        case 'rectangle':
        case 'polygon':
        case 'polyline':
          drawnItems.addLayer(layer);
          setDrawnLayers([...drawnLayers, layer]);
          const polygonGeometry = layer.toGeoJSON(); // Rename to polygonGeometry
          setBandobastDetails({ ...bandobastDetails, geometry: polygonGeometry });
          setShowForm(true);
          break;
        case 'circle':
          drawnItems.addLayer(layer);
          setDrawnLayers([...drawnLayers, layer]);
          const circleData = {
            center: layer.getLatLng(),
            radius: layer.getRadius(),
          };
          setBandobastDetails({ ...bandobastDetails, circle: circleData });
          setShowForm(true);
          break; 
      }
    });

    function addPopupToSector(layer, sectorName) {
      layer.bindPopup(sectorName);
    }

    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const bandobastData = snapshot.val();
      if (bandobastData) {
        Object.values(bandobastData).forEach(sector => {
          const { coordinates, title, circle } = sector;
          if (circle) {
            const { center, radius } = circle;
            const circleLayer = L.circle(center, { radius }).addTo(mapRef.current);
            addPopupToSector(circleLayer, title);
          } else if (coordinates && coordinates.length > 0) {
            coordinates.forEach(coord => {
              const sectorLayer = L.geoJSON({
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: coord,
                },
              }).addTo(mapRef.current);
              addPopupToSector(sectorLayer, title);
            });
          }
        });
      }
    });

    const personnelRef = ref(db, 'personnel');
    onValue(personnelRef, (snapshot) => {
      const personnelData = snapshot.val();
      if (personnelData) {
        const options = Object.keys(personnelData).map(key => ({
          value: key,
          label: personnelData[key].name
        }));
        setPersonnelOptions(options);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    drawnLayers.forEach(layer => {
      const name = layer.options.name; // Assuming the name of the sector is stored in the options
      if (name) {
        const tooltip = L.tooltip({ permanent: true, direction: 'center', className: 'custom-tooltip' }).setContent(name);
        layer.bindTooltip(tooltip).openTooltip();
      }
    });
  }, [drawnLayers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coordinates = drawnLayers.map(layer => layer.toGeoJSON().geometry.coordinates);

      // Update bandobastDetails with coordinates
      const updatedBandobastDetails = {
        ...bandobastDetails,
        coordinates: coordinates
      };

      // Save updated data to the database
      const bandobastRef = ref(db, 'bandobastDetails');
      const newBandobastRef = push(bandobastRef);
      set(newBandobastRef, updatedBandobastDetails);

      setShowForm(false);
      alert('Data saved successfully!');
      setBandobastDetails({
        title: '',
        personnel: [],
        date: '',
        startTime: '',
        endTime: '',
        circle: null // Reset circle data
      });
    } catch (error) {
      console.error('Error saving data: ', error);
      alert('Error saving data: ' + error.message);
    }
  };

  const handleSelectPersonnel = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setBandobastDetails(prevState => ({
      ...prevState,
      personnel: selectedOptions,
    }));
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div id="map" style={{ height: '600px', position: 'relative' }} />
      {showForm && (
        <div style={{ position: 'absolute', margin: '10px 30px 20px 40px', width: '37%',height:'600px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '10px 120px 10px 120px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', zIndex: 1000 }}>
        <button style={{ position: 'absolute', top: '5px', right: '5px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2em' }} onClick={() => setShowForm(false)}>×</button>
          <h2 style={{ textAlign: 'center', marginBottom: '20px',marginTop:'2px' }}>Create Bandobast</h2>
          <form onSubmit={handleSubmit} style={{marginTop:'1px'}}>
            <div className="form-group">
              <label>Title of the Bandobast:</label>
              <input type="text" name="title" value={bandobastDetails.title} onChange={(e) => setBandobastDetails({ ...bandobastDetails, title: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Select the Ground Personnel:</label>
              <select name="personnel" multiple value={bandobastDetails.personnel} onChange={handleSelectPersonnel} style={{ width: '100%', height: '100px', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                {personnelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input type="date" name="date" value={bandobastDetails.date} onChange={(e) => setBandobastDetails({ ...bandobastDetails, date: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input type="time" name="startTime" value={bandobastDetails.startTime} onChange={(e) => setBandobastDetails({ ...bandobastDetails, startTime: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input type="time" name="endTime" value={bandobastDetails.endTime} onChange={(e) => setBandobastDetails({ ...bandobastDetails, endTime: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>Save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;
