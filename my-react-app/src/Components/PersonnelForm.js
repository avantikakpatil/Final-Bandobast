import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { ref, get, set } from 'firebase/database';

const PersonnelForm = ({ onClose, addPersonnel }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    latitude: '',
    longitude: '',
    deviceId: '' // Added deviceId field
  });

  const [deviceOptions, setDeviceOptions] = useState([]);

  useEffect(() => {
    const fetchDeviceOptions = async () => {
      try {
        const deviceDetailsRef = ref(db, 'DeviceDetails');
        const deviceSnapshot = await get(deviceDetailsRef);
        const devices = deviceSnapshot.val();
        const options = Object.keys(devices).map(key => ({
          value: key,
          label: `Device ${key}`
        }));
        setDeviceOptions(options);
      } catch (error) {
        console.error('Error fetching device options:', error);
      }
    };

    fetchDeviceOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDeviceChange = async (e) => {
    const deviceId = e.target.value;
    setFormData({ ...formData, deviceId });

    try {
      const deviceDetailsRef = ref(db, `DeviceDetails/${deviceId}`);
      const deviceSnapshot = await get(deviceDetailsRef);
      const deviceDetails = deviceSnapshot.val();

      if (deviceDetails) {
        setFormData(prevData => ({
          ...prevData,
          latitude: deviceDetails.latitude,
          longitude: deviceDetails.longitude
        }));
      }
    } catch (error) {
      console.error('Error fetching device details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const personnelRef = ref(db, `personnel/${formData.deviceId}`);
      await set(personnelRef, formData); // Use set with deviceId as the key

      console.log('Data saved successfully!');
      addPersonnel(formData); // Optionally update the local state
    } catch (error) {
      console.error('Error saving personnel data:', error);
    }
    onClose();
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Position:</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Device ID:</label>
        <select
          name="deviceId"
          value={formData.deviceId}
          onChange={handleDeviceChange}
          required
        >
          <option value="">Select Device</option>
          {deviceOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Latitude:</label>
        <input
          type="text"
          name="latitude"
          value={formData.latitude}
          readOnly
        />
      </div>
      <div className="form-group">
        <label>Longitude:</label>
        <input
          type="text"
          name="longitude"
          value={formData.longitude}
          readOnly
        />
      </div>
      <button type="submit">Submit</button>
      <br />
      <br />
      <button type="button" onClick={onClose}>Close</button>
    </form>
  );
};

export default PersonnelForm;
