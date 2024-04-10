import React, { useState } from 'react';

const PersonnelForm = ({ onClose, onAddPersonnel }) => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !designation) return;
    onAddPersonnel({ id: Date.now(), name, designation });
    setName('');
    setDesignation('');
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h3>Add Personnel</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="designation">Designation:</label>
            <input type="text" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default PersonnelForm;
