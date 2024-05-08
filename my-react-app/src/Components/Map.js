import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue, push } from 'firebase/database';
import saveFormDataToDatabase from '../config/saveFormDataToDatabase';

import customPersonnelIcon from '../maps-flags_447031.png';
import customMarkerIcon from '../maps-flags_447031.png';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-pip/leaflet-pip.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

const Map = () => {
  const mapRef = React.useRef();
  const [searchControl, setSearchControl] = useState(null);
  const [drawnLayers, setDrawnLayers] = useState([]);
  const [personnelMarkers, setPersonnelMarkers] = useState([]);
 
  const [bandobastDetails, setBandobastDetails] = useState({
    title: '',
    personnel: [],
    date: '',
    startTime: '',
    endTime: '',
    coordinates: [] // Include coordinates state
  });
  const [loader, setLoader] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [personnelOptions, setPersonnelOptions] = useState([]);

  useEffect(() => {
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

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

    const searchControl = new L.Control.Geocoder('YOUR_API_KEY_HERE', {
      defaultMarkGeocode: false,
    }).addTo(map);
    setSearchControl(searchControl);

    map.on('draw:created', function (event) {
      const { layer, layerType } = event;

      switch (layerType) {
        case 'rectangle':
        case 'polygon':
        case 'polyline':
        case 'circle':
          drawnItems.addLayer(layer);
          setDrawnLayers([...drawnLayers, layer]);
          const geometry = layer.toGeoJSON();
          setBandobastDetails({ ...bandobastDetails, geometry });
          setShowForm(true);

          // Push coordinates to the database
          const coordinatesRef = ref(db, 'bandobastDetails');
          push(coordinatesRef, geometry.coordinates);

          break;
        case 'marker':
        case 'circlemarker':
          drawnItems.addLayer(layer);
          setDrawnLayers([...drawnLayers, layer]);
          break;
        default:
          break;
      }
    });

    
    
    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const bandobastData = snapshot.val();
      if (bandobastData) {
        // Extract and display sectors from database
        Object.values(bandobastData).forEach(sector => {
          const { coordinates } = sector;
          if (coordinates && coordinates.length > 0) {
            coordinates.forEach(coord => {
              L.geoJSON(coord).addTo(map);
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

  const handleSearch = (query) => {
    if (searchControl) {
      searchControl.geosearch(query);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
  
    try {
      // Fetch location of selected personnel
      const personnelLocations = await Promise.all(
        bandobastDetails.personnel.map(async (personnelId) => {
          const personnelRef = ref(db, `personnel/${personnelId}`);
          let personnelData;
          await onValue(personnelRef, (snapshot) => {
            personnelData = snapshot.val();
          });
          return {
            id: personnelId,
            location: {
              latitude: personnelData.latitude,
              longitude: personnelData.longitude
            }
          };
        })
      );
  
      // Get coordinates from drawn layers
      const coordinates = drawnLayers.map(layer => layer.toGeoJSON().geometry.coordinates);
  
      // Update bandobastDetails with personnel locations and coordinates
      const updatedBandobastDetails = {
        ...bandobastDetails,
        personnel: personnelLocations,
        coordinates: coordinates
      };
  
      // Save updated data to the database
      await saveFormDataToDatabase(updatedBandobastDetails);

      const personnelIcon = L.icon({
        iconUrl: customPersonnelIcon,
        iconSize: [22, 22],
        iconAnchor: [16, 32],
      });
  
      // Display personnel markers on the map
      const newPersonnelMarkers = personnelLocations.map(({ id, location }) => {
        const marker = L.marker([location.latitude, location.longitude], { icon: personnelIcon }).addTo(mapRef.current).bindPopup(`Personnel ${id}`);
        return marker;
      });
      setPersonnelMarkers(newPersonnelMarkers);
  
      // Reset the form data and loader state
      setShowForm(false);
      setLoader(false);
      alert('Data saved successfully!');
      setBandobastDetails({
        title: '',
        personnel: [],
        date: '',
        startTime: '',
        endTime: ''
      });
    } catch (error) {
      console.error('Error saving data: ', error);
      alert('Error saving data: ' + error.message);
      setLoader(false);
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
              <label>Duration From:</label>
              <input type="time" name="startTime" value={bandobastDetails.startTime} onChange={(e) => setBandobastDetails({ ...bandobastDetails, startTime: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Duration To:</label>
              <input type="time" name="endTime" value={bandobastDetails.endTime} onChange={(e) => setBandobastDetails({ ...bandobastDetails, endTime: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', borderRadius: '5px', border: 'none', cursor: 'pointer' }} disabled={loader}>Create Bandobast</button>
            <div style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 1001 }}>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5em', color: 'black' }} onClick={() => setShowForm(false)}>×</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;
