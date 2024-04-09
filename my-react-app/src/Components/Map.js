import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-pip/leaflet-pip.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Map = () => {
  const mapRef = React.useRef();
  const [searchControl, setSearchControl] = React.useState(null);
  const [showForm, setShowForm] = useState(false);
  const [drawnLayer, setDrawnLayer] = useState(null);
  const [bandobastDetails, setBandobastDetails] = useState({
    // Initialize with default values for the form fields
    // You can modify this object based on your requirements
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
<<<<<<< HEAD
    const map = L.map('map').setView([20.5937, 78.9629], 5); // Set the initial view to India
=======
    const map = L.map('map').setView([20.5937, 78.9629], 5); // Default view, zoomed out to India
    mapRef.current = map;
>>>>>>> 624b68cf6c3730436646788a1f4829fe5496c146

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: true,
        polygon: true,
        marker: true,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

<<<<<<< HEAD
    // Add search bar
    const searchControl = L.Control.geocoder({
      defaultMarkGeocode: false,
      collapsed: true
    });
    searchControl.addTo(map);

    // Event listener for search control
    map.on('geocoder:markgeocode', function (event) {
      const { center } = event.geocode;
      map.setView([center.lat, center.lng], 7); // Set the map view to the selected location with a zoom level of 7
    });


    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
=======
    const searchControl = new L.Control.Geocoder('YOUR_API_KEY_HERE', {
      defaultMarkGeocode: false,
    }).addTo(map);
    setSearchControl(searchControl);

    map.on('draw:created', function (event) {
      const { layer } = event;
>>>>>>> 624b68cf6c3730436646788a1f4829fe5496c146
      drawnItems.addLayer(layer);
      setDrawnLayer(layer);
      setShowForm(true);
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

  const handleSubmit = () => {
    // Here you can handle the submission of the form data
    console.log('Bandobast Details:', bandobastDetails);
    // You may also want to clear the drawn layer and close the form modal
    setDrawnLayer(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBandobastDetails(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const createSectorForm = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Create Sector Form</title>
    </head>
    <body>
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
    </body>
    </html>
  `;

  return (
    <div>
      <div id="map" style={{ height: '600px' }} />
      <div className="search-bar">
        <input type="text" placeholder="Search location..." onChange={(e) => handleSearch(e.target.value)} />
      </div>
      {showForm && (
        <div className="form-container" dangerouslySetInnerHTML={{ __html: createSectorForm }} />
      )}
    </div>
  );
};

export default Map;
