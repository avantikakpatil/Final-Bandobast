import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-pip/leaflet-pip.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Map.css';

const Map = () => {
  const [geofenceCoordinates, setGeofenceCoordinates] = React.useState([]);
  const drawnItemsRef = React.useRef();
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    const map = L.map('map').setView([20.5937, 78.9629], 5); // Zoom map to India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    drawnItemsRef.current = new L.FeatureGroup();
    map.addLayer(drawnItemsRef.current);

    // Define custom marker icon
    const markerIcon = L.icon({
      iconUrl: 'marker-icon.png', // Provide the URL of your custom marker icon
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: true,
        marker: {
          icon: markerIcon, // Use custom marker icon
        },
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    });
    map.addControl(drawControl);

    // Add search bar
    L.Control.geocoder({
      position: 'topright',
      defaultMarkGeocode: false,
    }).addTo(map);

    map.on(L.Draw.Event.CREATED, function (event) {
      const { layer, layerType } = event;
      drawnItemsRef.current.addLayer(layer);

      let coordinates;
      if (layerType === 'rectangle' || layerType === 'polygon') {
        coordinates = layer.getLatLngs()[0].map(point => [point.lat, point.lng]);
      } else if (layerType === 'marker') {
        const latlng = layer.getLatLng();
        coordinates = [[latlng.lat, latlng.lng]];
      }

      setGeofenceCoordinates(coordinates);
      setModalOpen(true);
    });

    map.on('mousemove', function (e) {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      document.querySelector('.coordinates-display').innerHTML = `Coordinates: ${lat}, ${lng}`;
    });

    map.on('mouseout', function () {
      document.querySelector('.coordinates-display').innerHTML = '';
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const title = $('#name').val();
    const date = $('#date').val();
    const durationFrom = $('#durationFrom').val();
    const durationTo = $('#durationTo').val();

    const newRecord = {
      title,
      date,
      durationFrom,
      durationTo,
    };

    // Handle the new record, you can push it to an array or send it to a server

    setModalOpen(false);
  };

  return (
    <div>
      <div id="map" style={{ height: '600px' }} />
      <div className="coordinates-display" />

      <div id="form-container" className={`modal fade ${modalOpen ? 'show' : ''}`} tabIndex="-1" role="dialog" aria-labelledby="formModalLabel" aria-hidden={!modalOpen}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="formModalLabel">Create Bandobast</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setModalOpen(false)}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form id="firebaseForm" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Title of the Bandobast:</label>
                  <input type="text" className="form-control" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input type="date" className="form-control" id="date" name="date" required />
                </div>
                <div className="form-group">
                  <label htmlFor="durationFrom">Duration From:</label>
                  <input type="time" className="form-control" id="durationFrom" name="durationFrom" required />
                  <label htmlFor="durationTo">Duration To:</label>
                  <input type="time" className="form-control" id="durationTo" name="durationTo" required />
                </div>
                <button type="submit" className="btn btn-primary" id="form-container-submit">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
