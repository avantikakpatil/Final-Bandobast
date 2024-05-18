import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

import customMarkerIcon from '../maps-flags_447031.png';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

const MapMonitor = () => {
  const mapRef = useRef();
  const layersRef = useRef([]);
  const [drawnLayers, setDrawnLayers] = useState([]);
  const [bandobastDetails, setBandobastDetails] = useState({
    title: '',
    personnel: [],
    date: '',
    startTime: '',
    endTime: '',
    coordinates: [],
    circle: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [personnelOptions, setPersonnelOptions] = useState([]);
  const [activeSectors, setActiveSectors] = useState([]);

  // Function to add popup to a sector (layer)
  function addPopupToSector(layer, sectorName) {
    layer.bindPopup(sectorName);
  }

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

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: true,
        polygon: true,
        polyline: true,
        circle: true,
        marker: {
          icon: new L.Icon({
            iconUrl: customMarkerIcon,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        },
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    map.on('draw:created', function (event) {
      const { layer, layerType } = event;

      switch (layerType) {
        case 'rectangle':
        case 'polygon':
        case 'polyline':
          drawnItems.addLayer(layer);
          setDrawnLayers((prevLayers) => [...prevLayers, layer]);
          const polygonGeometry = layer.toGeoJSON();
          setBandobastDetails((prevDetails) => ({ ...prevDetails, geometry: polygonGeometry }));
          setShowForm(true);
          break;
        case 'circle':
          drawnItems.addLayer(layer);
          setDrawnLayers((prevLayers) => [...prevLayers, layer]);
          const circleData = {
            center: layer.getLatLng(),
            radius: layer.getRadius(),
          };
          setBandobastDetails((prevDetails) => ({ ...prevDetails, circle: circleData }));
          setShowForm(true);
          break;
        default:
          break;
      }
    });

    // Retrieve active bandobast details from Firebase
    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const bandobastData = snapshot.val();
      if (bandobastData) {
        const filteredData = Object.values(bandobastData).filter(sector => sector.isActive);
        setActiveSectors(filteredData);
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
    activeSectors.forEach((sector) => {
      const { center, radius, title, geometry } = sector;
      let layer;

      if (sector.circle) {
        // Handle circles
        layer = L.circle(sector.circle.center, { radius: sector.circle.radius }).addTo(mapRef.current);
      } else if (geometry && geometry.type === "Feature" && geometry.geometry.type === "Polygon") {
        // Handle polygons
        layer = L.geoJSON(geometry).addTo(mapRef.current);
      }

      if (layer) {
        addPopupToSector(layer, title);
        layersRef.current.push(layer);
      }
    });
  }, [activeSectors]);

  return <div id="map" style={{ height: '600px' }} />;
};

export default MapMonitor;
