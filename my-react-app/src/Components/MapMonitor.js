import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

import 'leaflet/dist/leaflet.css';

const Map = () => {
  const mapRef = React.useRef();
  const [activeSectors, setActiveSectors] = useState([]);

  useEffect(() => {
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const bandobastData = snapshot.val();
      if (bandobastData) {
        const activeSectorsData = Object.values(bandobastData).filter(bandobast => bandobast.isActive);
        setActiveSectors(activeSectorsData);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    activeSectors.forEach(sector => {
      const { coordinates } = sector;
      if (coordinates && coordinates.length > 0) {
        coordinates.forEach(coord => {
          L.geoJSON(coord, {
            style: {
              fillColor: 'blue',
              fillOpacity: 0.4,
              color: 'blue',
              weight: 2,
            },
          }).addTo(mapRef.current);
        });
      }
    });
  }, [activeSectors]);

  return <div id="map" style={{ height: '600px' }} />;
};

export default Map;
