import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

import customMarkerIcon from '../maps-flags_447031.png';
import personnelIcon from '../images/pin_1217301.png'; // Path to personnel icon

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

const MapMonitor = () => {
  const mapRef = useRef();
  const layersRef = useRef([]);
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

    // Add new layers for active sectors
    activeSectors.forEach((sector) => {
      const { title, geometry, circle, personnel } = sector;
      let layer;

      if (circle) {
        // Handle circles
        layer = L.circle(circle.center, { radius: circle.radius }).addTo(mapRef.current);
      } else if (geometry && geometry.type === "Feature" && geometry.geometry.type === "Polygon") {
        // Handle polygons
        layer = L.geoJSON(geometry).addTo(mapRef.current);
      }

      if (layer) {
        layer.bindPopup(title);
        layersRef.current.push(layer);
      }

      // Add personnel markers for active sectors
      if (personnel) {
        Object.values(personnel).forEach(person => {
          const { latitude, longitude } = person;
          const personnelMarker = L.marker([latitude, longitude], {
            icon: new L.Icon({
              iconUrl: personnelIcon,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            }),
          }).addTo(mapRef.current);

          personnelMarker.bindPopup(person.title);
          layersRef.current.push(personnelMarker);
        });
      }
    });
  }, [activeSectors]);

  return <div id="map" style={{ height: '600px' }} />;
};

export default MapMonitor;
