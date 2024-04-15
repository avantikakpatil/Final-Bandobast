import React, { useState } from 'react';
import { db } from '../config/firebaseConfig';
import { ref, push } from 'firebase/database'; 

const PersonnelForm = ({ onClose, addPersonnel }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
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
    onClose(); // Closes the form
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
      <button type="submit">Submit</button>
      <button type="button" onClick={onClose}>Close</button>
    </form>
  );
};

export default PersonnelForm;
