import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

// Import the custom marker icon
import personnelIcon from '../images/location_4315546.png';

const MapMonitor = () => {
  const mapRef = useRef();
  const layersRef = useRef([]);
  const personnelMarkersRef = useRef({}); // Keep track of personnel markers
  const [activeSectors, setActiveSectors] = useState([]);

  useEffect(() => {
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Add geocoder control to the map
    const geocoder = L.Control.Geocoder.nominatim();
    L.Control.geocoder({
      geocoder: geocoder,
      position: 'topright',
      placeholder: 'Search for location...',
    }).addTo(map);

   // Retrieve active bandobast details from Firebase
const bandobastRef = ref(db, 'bandobastDetails');
onValue(bandobastRef, (snapshot) => {
  const bandobastData = snapshot.val();
  if (bandobastData) {
    const activeSectorsData = Object.values(bandobastData).filter(sector => sector.isActive);
    setActiveSectors(activeSectorsData);
  }
}, (error) => {
  console.error("Error fetching bandobast details:", error);
});


    // Cleanup on component unmount
    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      console.error("Map is not initialized");
      return;
    }

    // Clear existing layers
    layersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);
    });
    layersRef.current = [];

    // Custom icon for personnel markers
    const personnelMarkerIcon = L.icon({
      iconUrl: personnelIcon,
      iconSize: [32, 32], // Size of the icon
      iconAnchor: [16, 32], // Anchor point of the icon
    });

    // Add new layers for active sectors
   // Add new layers for active sectors
activeSectors.forEach((sector) => {
  const { title, polygon, circle, personnel } = sector;
  let layer;

  if (circle) {
    // Handle circles
    layer = L.circle(circle.center, { radius: circle.radius }).addTo(mapRef.current);
  } else if (polygon) {
    // Handle polygons
    layer = L.geoJSON(polygon).addTo(mapRef.current);
  }

  if (layer) {
    layer.bindPopup(title);
    layersRef.current.push(layer);
  }

  // Add personnel markers for active sectors
if (personnel) {
  Object.entries(personnel).forEach(([personId, person]) => {
    const { latitude, longitude, title } = person; // Access title property
    const personnelMarker = L.marker([latitude, longitude], { icon: personnelMarkerIcon }).addTo(mapRef.current);

    // Add 10 meter radius circle around personnel marker
    const radiusCircle = L.circle([latitude, longitude], {
      radius: 10,
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
    }).addTo(mapRef.current);

    personnelMarker.bindPopup(title || 'Personnel'); // Bind title to popup
    layersRef.current.push(personnelMarker);
    layersRef.current.push(radiusCircle);
    personnelMarkersRef.current[personId] = personnelMarker;
  });
}

});

  }, [activeSectors]);

  return <div id="map" style={{ height: '600px' }} />;
};

export default MapMonitor;
