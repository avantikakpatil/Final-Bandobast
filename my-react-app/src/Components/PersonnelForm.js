import React, { useState } from 'react';
import { db } from '../config/firebaseConfig';
import { ref, push } from 'firebase/database'; 

const PersonnelForm = ({ onClose, addPersonnel }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    latitude: '', 
    longitude: '',
    deviceId: '' // Added deviceId field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    addPersonnel(formData); 

    try {
      const personnelRef = ref(db, 'personnel'); 
      await push(personnelRef, formData); 

      console.log('Data saved successfully!');
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
        <label>Latitude:</label>
        <input
          type="text" 
          name="latitude" 
          value={formData.latitude}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Longitude:</label>
        <input
          type="text" 
          name="longitude" 
          value={formData.longitude}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group"> {/* Device ID Field */}
        <label>Device ID:</label>
        <input
          type="text" 
          name="deviceId" 
          value={formData.deviceId}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Submit</button>
      <br/>
      <br/>
      <button type="button" onClick={onClose}>Close</button>
    </form>
  );
};

export default PersonnelForm;
