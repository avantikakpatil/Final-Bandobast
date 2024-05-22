import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue, push, set, get } from 'firebase/database';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

const customMarkerIcon = require('../maps-flags_447031.png'); // Ensure the path to your icon is correct

const Map = () => {
  const mapRef = useRef();
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const [bandobastDetails, setBandobastDetails] = useState({
    title: '',
    personnel: [],
    date: '',
    startTime: '',
    endTime: '',
    coordinates: [],
    circle: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [personnelOptions, setPersonnelOptions] = useState([]);
  const [selectedBandobast, setSelectedBandobast] = useState(null);
  const personnelMarkersRef = useRef({});

  useEffect(() => {
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const geocoder = L.Control.Geocoder.nominatim();
    L.Control.geocoder({
      geocoder: geocoder,
      position: 'topright',
      placeholder: 'Search for location...',
    }).addTo(map);

    map.addLayer(drawnItemsRef.current);

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
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    });
    map.addControl(drawControl);

    map.on('draw:created', (event) => {
      const { layer, layerType } = event;
      drawnItemsRef.current.addLayer(layer);

      let newLayerData;
      switch (layerType) {
        case 'rectangle':
        case 'polygon':
        case 'polyline':
          newLayerData = layer.toGeoJSON();
          break;
        case 'circle':
          newLayerData = {
            center: layer.getLatLng(),
            radius: layer.getRadius(),
          };
          break;
        case 'marker':
          newLayerData = layer.toGeoJSON();
          break;
        default:
          return;
      }

      setBandobastDetails((prevDetails) => ({
        ...prevDetails,
        [layerType]: newLayerData,
      }));
      setShowForm(true);
    });

    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const bandobastData = snapshot.val();
      if (bandobastData) {
        Object.keys(bandobastData).forEach(bandobastId => {
          const sector = bandobastData[bandobastId];
          const { coordinates, title, circle, personnel } = sector;
          if (circle) {
            const { center, radius } = circle;
            const circleLayer = L.circle(center, { radius }).addTo(map);
            circleLayer.bindPopup(title);
          } else if (coordinates && coordinates.length > 0) {
            coordinates.forEach(coord => {
              const sectorLayer = L.geoJSON({
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: coord,
                },
              }).addTo(map);
              sectorLayer.bindPopup(title);
            });
          }
          if (personnel) {
            setSelectedBandobast(bandobastId);
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
          label: personnelData[key].name,
        }));
        setPersonnelOptions(options);
      }
    });

    return () => {
      map.off();
      map.remove();
    };
  }, []);

  useEffect(() => {
    const personnelRef = ref(db, 'personnel');
    onValue(personnelRef, (snapshot) => {
      const personnelData = snapshot.val();
      if (personnelData) {
        updatePersonnelMarkers(personnelData);
      }
    });
  }, [selectedBandobast]);

  const updatePersonnelMarkers = (personnelData) => {
    const bandobastRef = ref(db, 'bandobastDetails');
    get(bandobastRef).then(snapshot => {
      const bandobastData = snapshot.val();

      if (bandobastData) {
        Object.keys(bandobastData).forEach(bandobastId => {
          const { personnel: selectedPersonnel } = bandobastData[bandobastId];

          Object.keys(selectedPersonnel).forEach(personnelId => {
            const person = personnelData[personnelId];
            if (person && !personnelMarkersRef.current[personnelId]) {
              const marker = L.marker([person.latitude, person.longitude], {
                icon: new L.Icon({
                  iconUrl: customMarkerIcon,
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                }),
              }).addTo(mapRef.current);
              marker.bindPopup(person.name);
          
              // Add circle around personnel marker with a 10-meter radius
              const circle = L.circle([person.latitude, person.longitude], {
                radius: 10,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
              }).addTo(mapRef.current);
          
              personnelMarkersRef.current[personnelId] = { marker, circle };
            }
          });
          
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coordinates = drawnItemsRef.current.getLayers().map(layer => layer.toGeoJSON().geometry.coordinates);

      const updatedBandobastDetails = {
        ...bandobastDetails,
        coordinates,
      };

      const personnelIds = bandobastDetails.personnel;
      const personnelPromises = personnelIds.map(personnelId => {
        const personnelRef = ref(db, `personnel/${personnelId}`);
        return get(personnelRef).then(snapshot => snapshot.val());
      });

      const personnelDetails = await Promise.all(personnelPromises);

      const updatedPersonnelData = {};
      personnelDetails.forEach(person => {
        updatedPersonnelData[person.deviceId] = {
          latitude: person.latitude,
          longitude: person.longitude,
        };
      });

      const updatedBandobastWithPersonnel = {
        ...updatedBandobastDetails,
        personnel: updatedPersonnelData,
      };

      const bandobastRef = ref(db, 'bandobastDetails');
      const newBandobastRef = push(bandobastRef);
      await set(newBandobastRef, updatedBandobastWithPersonnel);

      setShowForm(false);
      alert('Data saved successfully!');
      setBandobastDetails({
        title: '',
        personnel: [],
        date: '',
        startTime: '',
        endTime: '',
        circle: null,
      });
      drawnItemsRef.current.clearLayers();
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
    <div>
      <div id="map" style={{ height: '600px' }}></div>
      {showForm && (
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -20%)',
          backgroundColor: 'white', padding: '20px', border: '1px solid #ccc',
          borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', zIndex: 1000
        }}>
          <button style={{
            position: 'absolute', top: '5px', right: '5px', border: 'none',color:'black',
            background: 'none', cursor: 'pointer', fontSize: '1.2em'
          }} onClick={handleCloseForm}>×</button>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Bandobast</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
           

            <div className="form-group">
              <label>Title of the Bandobast:</label>
              <input type="text" name="title" value={bandobastDetails.title}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, title: e.target.value })}
                style={{
                  width: '500px', padding: '8px', marginBottom: '10px',
                  borderRadius: '5px', border: '1px solid #ccc'
                }} />
            </div>
            <div className="form-group">
              <label>Select the Ground Personnel:</label>
              <select name="personnel" multiple value={bandobastDetails.personnel} onChange={handleSelectPersonnel}
                style={{
                  width: '500px', height: '100px', padding: '8px', marginBottom: '10px',
                  borderRadius: '5px', border: '1px solid #ccc'
                }}>
                {personnelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input type="date" name="date" value={bandobastDetails.date}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, date: e.target.value })}
                style={{
                  width: '500px', padding: '8px', marginBottom: '10px',
                  borderRadius: '5px', border: '1px solid #ccc'
                }} />
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input type="time" name="startTime" value={bandobastDetails.startTime}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, startTime: e.target.value })}
                style={{
                  width: '500px', padding: '8px', marginBottom: '10px',
                  borderRadius: '5px', border: '1px solid #ccc'
                }} />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input type="time" name="endTime" value={bandobastDetails.endTime}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, endTime: e.target.value })}
                style={{
                  width: '500px', padding: '8px', marginBottom: '10px',
                  borderRadius: '5px', border: '1px solid #ccc'
                }} />
            </div>
            <button type="submit" style={{
              width: '100%', padding: '10px', borderRadius: '5px',
              border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer'
            }}>Save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;
