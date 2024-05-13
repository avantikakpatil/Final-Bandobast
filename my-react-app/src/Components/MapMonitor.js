import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { db } from '../config/firebaseConfig';
import { ref, onValue, push } from 'firebase/database';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

const Map = () => {
  const mapRef = React.useRef();
  const [searchControl, setSearchControl] = useState(null);
  const [bandobastDetails, setBandobastDetails] = useState({
    title: '',
    personnel: [],
    date: '',
    startTime: '',
    endTime: '',
    coordinates: []
  });
  const [loader, setLoader] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [personnelOptions, setPersonnelOptions] = useState([]);

  useEffect(() => {
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const searchControl = new L.Control.Geocoder('YOUR_API_KEY_HERE', {
      defaultMarkGeocode: false,
    }).addTo(map);
    setSearchControl(searchControl);

    const personnelRef = ref(db, 'personnel');
    onValue(personnelRef, (snapshot) => {
      const personnelData = snapshot.val();
      if (personnelData) {
        const options = Object.keys(personnelData).map(key => ({
          value: key,
          label: personnelData[key].name
        }));
        setPersonnelOptions(options);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      // Fetch personnel names from Firebase
      const personnelNames = await Promise.all(
        bandobastDetails.personnel.map(async (personnelId) => {
          const personnelRef = ref(db, `personnel/${personnelId}`);
          let personnelData;
          await onValue(personnelRef, (snapshot) => {
            personnelData = snapshot.val();
          });
          return personnelData.name; // Return only the name
        })
      );

      // Get coordinates from drawn layers
      const coordinates = bandobastDetails.coordinates.map(geometry => geometry.coordinates);

      // Update bandobastDetails with personnel names and coordinates
      const updatedBandobastDetails = {
        ...bandobastDetails,
        personnelNames: personnelNames, // Add personnel names
        coordinates: coordinates
      };

      // Save updated data to the database
      await push(ref(db, 'bandobastDetails'), updatedBandobastDetails);

      // Reset the form data and loader state
      setShowForm(false);
      setLoader(false);
      alert('Data saved successfully!');
      setBandobastDetails({
        title: '',
        personnel: [],
        date: '',
        startTime: '',
        endTime: '',
        coordinates: []
      });
    } catch (error) {
      console.error('Error saving data: ', error);
      alert('Error saving data: ' + error.message);
      setLoader(false);
    }
  };

  const handleSelectPersonnel = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setBandobastDetails(prevState => ({
      ...prevState,
      personnel: selectedOptions,
    }));
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div id="map" style={{ height: '600px', position: 'relative' }} />
      {showForm && (
        <div style={{ position: 'absolute', margin: '10px 30px 20px 40px', width: '37%',height:'600px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '10px 120px 10px 120px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', zIndex: 1000 }}>
        <button style={{ position: 'absolute', top: '5px', right: '5px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2em' }} onClick={() => setShowForm(false)}>×</button>
          <h2 style={{ textAlign: 'center', marginBottom: '20px',marginTop:'2px' }}>Create Bandobast</h2>
          <form onSubmit={handleSubmit} style={{marginTop:'1px'}}>
            <div className="form-group">
              <label>Title of the Bandobast:</label>
              <input type="text" name="title" value={bandobastDetails.title} onChange={(e) => setBandobastDetails({ ...bandobastDetails, title: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Select the Ground Personnel:</label>
              <select name="personnel" multiple value={bandobastDetails.personnel} onChange={handleSelectPersonnel} style={{ width: '100%', height: '100px', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                {personnelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input type="date" name="date" value={bandobastDetails.date} onChange={(e) => setBandobastDetails({ ...bandobastDetails, date: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Duration From:</label>
              <input type="time" name="startTime" value={bandobastDetails.startTime} onChange={(e) => setBandobastDetails({ ...bandobastDetails, startTime: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="form-group">
              <label>Duration To:</label>
              <input type="time" name="endTime" value={bandobastDetails.endTime} onChange={(e) => setBandobastDetails({ ...bandobastDetails, endTime: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', borderRadius: '5px', border: 'none', cursor: 'pointer' }} disabled={loader}>Create Bandobast</button>
            <div style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 1001 }}>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5em', color: 'black' }} onClick={() => setShowForm(false)}>×</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;