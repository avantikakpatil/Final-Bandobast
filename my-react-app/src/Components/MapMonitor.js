import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue, push, set } from 'firebase/database';
import Notification from './Notification';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

import personnelIcon from '../images/location_4315546.png';

const MapMonitor = () => {
  const mapRef = useRef();
  const layersRef = useRef([]);
  const personnelMarkersRef = useRef({});
  const notificationIdCounterRef = useRef(0);
  const [activeSectors, setActiveSectors] = useState([]);
  const [notifications, setNotifications] = useState([]);

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

    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const bandobastData = snapshot.val();
      if (bandobastData) {
        const activeSectorsData = Object.values(bandobastData).filter(sector => sector.isActive);
        console.log('Active Sectors:', activeSectorsData);
        setActiveSectors(activeSectorsData);
      }
    }, (error) => {
      console.error("Error fetching bandobast details:", error);
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      console.error("Map is not initialized");
      return;
    }

    layersRef.current.forEach(layer => {
      mapRef.current.removeLayer(layer);
    });
    layersRef.current = [];

    const personnelMarkerIcon = L.icon({
      iconUrl: personnelIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    activeSectors.forEach((sector) => {
      const { title, polygon, circle, rectangle, personnel } = sector;
      let layer;

      if (circle) {
        layer = L.circle(circle.center, { radius: circle.radius }).addTo(mapRef.current);
      } else if (polygon) {
        layer = L.geoJSON(polygon).addTo(mapRef.current);
      } else if (rectangle) {
        // Ensure the coordinates form a closed loop
        const closedCoordinates = [...rectangle.geometry.coordinates[0], rectangle.geometry.coordinates[0][0]];
        const rectangleGeoJSON = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [closedCoordinates]
          }
        };
        layer = L.geoJSON(rectangleGeoJSON).addTo(mapRef.current);
      }

      if (layer) {
        layer.bindPopup(title);
        layersRef.current.push(layer);
      }

      if (personnel) {
        Object.entries(personnel).forEach(([personId, person]) => {
          const { latitude, longitude, title } = person;
          const personnelMarker = L.marker([latitude, longitude], { icon: personnelMarkerIcon }).addTo(mapRef.current);
          const radiusCircle = L.circle([latitude, longitude], {
            radius: 10,
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
          }).addTo(mapRef.current);

          personnelMarker.bindPopup(title || 'Personnel');
          layersRef.current.push(personnelMarker);
          layersRef.current.push(radiusCircle);
          personnelMarkersRef.current[personId] = personnelMarker;

          // Check if personnel is outside the sector area
          if (circle) {
            const distance = L.latLng(latitude, longitude).distanceTo(circle.center);
            console.log(`${title} distance from sector center: ${distance}, allowed radius: ${circle.radius}`);
            if (distance > circle.radius) {
              console.log(`${title} is out of the sector area for ${sector.title}.`);
              const notification = { id: notificationIdCounterRef.current++, message: `${title} is out of the sector area for ${sector.title}.` };
              setNotifications(prevNotifications => [...prevNotifications, notification]);

              // Store notification in Firebase
              const newNotificationRef = push(ref(db, 'notifications'));
              set(newNotificationRef, notification);
            }
          } else if (polygon || rectangle) {
            const polygonLayer = L.geoJSON(polygon || rectangle);
            const personnelLocation = L.latLng(latitude, longitude);
            console.log(`${title} location: ${personnelLocation.toString()}, sector bounds: ${polygonLayer.getBounds().toString()}`);
            if (!polygonLayer.getBounds().contains(personnelLocation)) {
              console.log(`${title} is out of the sector area for ${sector.title}.`);
              const notification = { id: notificationIdCounterRef.current++, message: `${title} is out of the sector area for ${sector.title}.` };
              setNotifications(prevNotifications => [...prevNotifications, notification]);

              // Store notification in Firebase
              const newNotificationRef = push(ref(db, 'notifications'));
              set(newNotificationRef, notification);
            }
          }
        });
      }
    });
  }, [activeSectors]);

  const handleCloseNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div>
      <div id="map" style={{ height: '600px' }} />
      <Notification notifications={notifications} onCloseNotification={handleCloseNotification} />
    </div>
  );
};

export default MapMonitor;
