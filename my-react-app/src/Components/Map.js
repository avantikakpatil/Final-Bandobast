import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-pip/leaflet-pip.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

const Map = () => {
  const mapRef = React.useRef();
  const [searchControl, setSearchControl] = React.useState(null);
  const [drawnLayers, setDrawnLayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [bandobastDetails, setBandobastDetails] = useState({
    title: '',
    personnel: [],
    date: '',
    startTime: '',
    endTime: '',
  });
  const [newPersonnel, setNewPersonnel] = useState('');
  const personnelOptions = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Michael Brown' },
  ];

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
        marker: true,
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

      // Check the type of the drawn layer and handle accordingly
      switch (layerType) {
        case 'rectangle':
        case 'polygon':
        case 'polyline':
        case 'circle':
          drawnItems.addLayer(layer);
          setDrawnLayers([...drawnLayers, layer]);
          setShowForm(true);
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

    return () => {
      map.remove();
    };
  }, []);

  const handleSearch = (query) => {
    if (searchControl) {
      searchControl.geosearch(query);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Bandobast Details:', bandobastDetails);
    setShowForm(false);
    setBandobastDetails({
      title: '',
      personnel: [],
      date: '',
      startTime: '',
      endTime: '',
    });
    setNewPersonnel('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBandobastDetails(prevState => ({
      ...prevState,
      [name]: value,
    }));
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
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', zIndex: 1000 }}>
          <button style={{ position: 'absolute', top: '5px', right: '5px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2em' }} onClick={handleCloseForm}>×</button>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Bandobast</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title of the Bandobast:</label>
              <input type="text" name="title" value={bandobastDetails.title} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
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
              <input type="date" name="date" value={bandobastDetails.date} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Duration From:</label>
              <input type="time" name="startTime" value={bandobastDetails.startTime} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Duration To:</label>
              <input type="time" name="endTime" value={bandobastDetails.endTime} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>Create Bandobast</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;
