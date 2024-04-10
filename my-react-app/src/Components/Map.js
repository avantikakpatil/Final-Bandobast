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
    description: '',
    startTime: '',
    endTime: '',
  });

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
      description: '',
      startTime: '',
      endTime: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBandobastDetails(prevState => ({
      ...prevState,
      [name]: value,
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
          <button style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', cursor: 'pointer' }} onClick={handleCloseForm}>X</button>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={bandobastDetails.title} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={bandobastDetails.description} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="datetime-local" name="startTime" value={bandobastDetails.startTime} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="datetime-local" name="endTime" value={bandobastDetails.endTime} onChange={handleInputChange} />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;
