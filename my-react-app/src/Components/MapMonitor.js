import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue, push, set } from 'firebase/database';

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
  const [existingNotifications, setExistingNotifications] = useState(new Set());

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
    const notificationsRef = ref(db, 'notifications');
    onValue(notificationsRef, (snapshot) => {
      const notificationsData = snapshot.val();
      if (notificationsData) {
        const notificationsArray = Object.values(notificationsData);
        setNotifications(notificationsArray);
        setExistingNotifications(new Set(notificationsArray.map(notification => notification.message)));
      }
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
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
        // Ensure the polygon coordinates form a closed loop
        const closedPolygonCoordinates = [...polygon.geometry.coordinates[0], polygon.geometry.coordinates[0][0]];
        const polygonGeoJSON = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [closedPolygonCoordinates]
          }
        };
        layer = L.geoJSON(polygonGeoJSON).addTo(mapRef.current);
      } else if (rectangle) {
        // Ensure the rectangle coordinates form a closed loop
        const closedRectangleCoordinates = [...rectangle.geometry.coordinates, rectangle.geometry.coordinates[0]];
        const rectangleGeoJSON = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [closedRectangleCoordinates]
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
          const { latitude, longitude } = person;
          
          // Fetch personnel details from Firebase based on personId
          const personnelRef = ref(db, `personnel/${personId}`);
          onValue(personnelRef, (snapshot) => {
            const personnelData = snapshot.val();
            const name = personnelData ? personnelData.name : "Undefined";

            const personnelMarker = L.marker([latitude, longitude], { icon: personnelMarkerIcon }).addTo(mapRef.current);
            const radiusCircle = L.circle([latitude, longitude], {
              radius: 10,
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 0.5,
            }).addTo(mapRef.current);
  
            personnelMarker.bindPopup(name || title || 'Personnel'); // Use 'name' instead of 'undefined'
            layersRef.current.push(personnelMarker);
            layersRef.current.push(radiusCircle);
            personnelMarkersRef.current[personId] = personnelMarker;
  
            // Check if personnel is outside the sector area
            if (circle) {
              const distance = L.latLng(latitude, longitude).distanceTo(circle.center);
              console.log(`${name} distance from sector center: ${distance}, allowed radius: ${circle.radius}`); // Use 'name' instead of 'title'
              if (distance > circle.radius) {
                console.log(`${name} is out of the sector area for ${sector.title}.`);
                const message = `${name} is out of the sector area for ${sector.title}.`;
                if (!existingNotifications.has(message)) {
                  const notification = { id: notificationIdCounterRef.current++, message };
                  setNotifications(prevNotifications => [...prevNotifications, notification]);
                  setExistingNotifications(prev => new Set(prev).add(message));
                  
                  // Store notification in Firebase
                  const newNotificationRef = push(ref(db, 'notifications'));
                  set(newNotificationRef, notification);
                }
              }
            } else if (polygon || rectangle) {
              const polygonLayer = L.geoJSON(polygon || rectangle);
              const personnelLocation = L.latLng(latitude, longitude);
              console.log(`${name} location: ${personnelLocation.toString()}, sector bounds: ${polygonLayer.getBounds().toString()}`);
              if (!polygonLayer.getBounds().contains(personnelLocation)) {
                console.log(`${name} is out of the sector area for ${sector.title}.`);
                const message = `${name} is out of the sector area for ${sector.title}.`;
                if (!existingNotifications.has(message)) {
                  const notification = { id: notificationIdCounterRef.current++, message };
                  setNotifications(prevNotifications => [...prevNotifications, notification]);
                  setExistingNotifications(prev => new Set(prev).add(message));
                  
                  // Store notification in Firebase
                  const newNotificationRef = push(ref(db, 'notifications'));
                  set(newNotificationRef, notification);
                }
              }
            }
          });
        });
      }
    });
  }, [activeSectors, existingNotifications]);

  return (
    <div>
      <div id="map" style={{ height: '600px' }} />
      {/* Assuming you have a Notification component that you want to use */}
    </div>
  );
};

export default MapMonitor;
