import React, { useState } from 'react';
import './AddPersonnel.css';

const PersonnelForm = ({ onAddPersonnel }) => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !designation) return;
    
    // Create a new personnel object
    const newPersonnel = {
      id: Date.now(), // Generate a unique ID (in a real app, this might come from a database)
      name,
      designation
    };

    // Pass the new personnel object to the parent component
    onAddPersonnel(newPersonnel);

    // Clear the form fields
    setName('');
    setDesignation('');
    // Close the form after submission
    setIsFormOpen(false);
  };

  return (
    <div className={`modal ${isFormOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <button className="close-button" onClick={() => setIsFormOpen(false)}>X</button>
        <h2>Add Personnel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
          <button type="submit">Add Personnel</button>
        </form>
      </div>
    </div>
  );
};

export default PersonnelForm;
