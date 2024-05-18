import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const mapRef = useRef(null);
  const [activeSectors, setActiveSectors] = useState([]);
  const layersRef = useRef([]); // To store current layers

  useEffect(() => {
    // Initialize the map
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Fetch data from Firebase
    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const bandobastData = snapshot.val();
      if (bandobastData) {
        console.log("Fetched bandobastData:", bandobastData); // Log the data from Firebase
        const activeSectorsData = Object.values(bandobastData).filter(bandobast => bandobast.isActive);
        console.log("Filtered activeSectorsData:", activeSectorsData); // Log the filtered active sectors
        setActiveSectors(activeSectorsData);
      } else {
        console.log("No data found in bandobastDetails");
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

    // Add new layers
    activeSectors.forEach((sector, index) => {
      const { center, radius, title } = sector;
      if (center && radius) {
        const { lat, lng } = center;
        console.log(`Adding circle for sector ${index} with center:`, center, "and radius:", radius);

        const layer = L.circle([lat, lng], {
          radius: radius, // Use the radius from the data
          fillColor: 'blue',
          fillOpacity: 0.4,
          color: 'blue',
          weight: 2,
        }).addTo(mapRef.current).bindPopup(title);
        layersRef.current.push(layer); // Store the layer for future cleanup
      } else {
        console.error(`Invalid center or radius for sector ${index}:`, sector);
      }
    });
  }, [activeSectors]);

  return <div id="map" style={{ height: '600px' }} />;
};

export default Map;
