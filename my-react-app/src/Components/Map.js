import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-pip/leaflet-pip.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import $ from 'jquery';
import './Map.css'; // Import your CSS file for styling if needed

const Map = () => {
  
  // Define variables outside the component
  let geofenceCoordinates = [];
  const drawnItems = new L.FeatureGroup();

  // Define functions outside the component
  const addCoordinate = () => {
    const latitude = parseFloat($('#latitude').val());
    const longitude = parseFloat($('#longitude').val());

    if (!isNaN(latitude) && !isNaN(longitude)) {
      geofenceCoordinates.push([latitude, longitude]);
      drawnItems.clearLayers();
      L.polygon(geofenceCoordinates).addTo(drawnItems);
    } else {
      alert('Invalid coordinates. Please enter numeric values.');
    }
  };

  const clearCoordinates = () => {
    geofenceCoordinates = [];
    drawnItems.clearLayers();
  };

  const isPointInsideGeofence = (point) => {
    const lat = point.lat;
    const lng = point.lng;
    const polygon = geofenceCoordinates.map(coord => [coord[0], coord[1]]);
    const isInside = window.leafletPip.pointInLayer([lng, lat], L.geoJSON({
      type: 'Polygon',
      coordinates: [polygon],
    }));
    return isInside.length > 0;
  };

  const checkPoint = () => {
    const latitude = parseFloat($('#latitude').val());
    const longitude = parseFloat($('#longitude').val());

    if (!isNaN(latitude) && !isNaN(longitude)) {
      const point = { lat: latitude, lng: longitude };
      const result = isPointInsideGeofence(point);

      if (result) {
        $('#result').text('Point is inside the geofence.');
      } else {
        $('#result').text('Point is outside the geofence.');
      }
    } else {
      alert('Invalid coordinates. Please enter numeric values.');
    }
  };

  useEffect(() => {
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        rectangle: true,
        circle: true,
        marker: true,
        polyline: true
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      geofenceCoordinates = layer.getLatLngs()[0].map(point => [point.lat, point.lng]);
    });

    const coordinatesDisplay = L.DomUtil.create('div', 'coordinates-display');
    coordinatesDisplay.style.position = 'absolute';
    coordinatesDisplay.style.zIndex = 1000;
    map.getContainer().appendChild(coordinatesDisplay);

    map.on('mousemove', function (e) {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      coordinatesDisplay.innerHTML = `Coordinates: ${lat}, ${lng}`;
    });

    map.on('mouseout', function () {
      coordinatesDisplay.innerHTML = '';
    });

    // Cleanup function to remove the map when component unmounts
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <div id="map" style={{ height: '600px' }}></div>
      <div className="coordinates-display"></div>
      
      
    </div>
  );
};

export default Map;
