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
    deviceId: '',
    isNewDevice: false,
    newDeviceId: '',
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
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeviceChange = async (e) => {
    const deviceId = e.target.value;
    setFormData(prevData => ({
      ...prevData,
      deviceId,
      latitude: '',
      longitude: ''
    }));

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

    const { name, position, email, latitude, longitude, deviceId, isNewDevice, newDeviceId } = formData;

    try {
      const finalDeviceId = isNewDevice ? newDeviceId : deviceId;

      // Update personnel data
      const personnelRef = ref(db, `personnel/${finalDeviceId}`);
      await set(personnelRef, {
        name,
        position,
        email,
        latitude,
        longitude,
        deviceId: finalDeviceId
      });

      // Optionally update device details if it's a new device
      if (isNewDevice) {
        const deviceDetailsRef = ref(db, `DeviceDetails/${newDeviceId}`);
        await set(deviceDetailsRef, {
          latitude,
          longitude
        });
      }

      console.log('Data saved successfully!');
      addPersonnel({ ...formData, deviceId: finalDeviceId });
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
        <label>Choose existing or enter new Device ID:</label>
        <select
          name="deviceId"
          value={formData.deviceId}
          onChange={handleDeviceChange}
          disabled={formData.isNewDevice}
          required={!formData.isNewDevice}
        >
          <option value="">Select Device</option>
          {deviceOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <br />
        <input
          type="checkbox"
          name="isNewDevice"
          checked={formData.isNewDevice}
          onChange={handleChange}
        />
        <label>Enter new Device ID:</label>
        {formData.isNewDevice && (
          <input
            type="text"
            name="newDeviceId"
            value={formData.newDeviceId}
            onChange={handleChange}
            required
          />
        )}
      </div>
      {formData.isNewDevice && (
        <div>
          <div className="form-group">
            <label>Latitude:</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required={formData.isNewDevice}
            />
          </div>
          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required={formData.isNewDevice}
            />
          </div>
        </div>
      )}
      <button type="submit">Submit</button>
      <br />
      <br />
      <button type="button" onClick={onClose}>Close</button>
    </form>
  );
};

export default PersonnelForm;
