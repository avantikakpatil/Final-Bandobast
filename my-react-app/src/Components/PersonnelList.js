import React from 'react';

const PersonnelList = ({ personnelList }) => {
  return (
    <div className="personnel-list">
    <h2>Personnel List</h2>
    {personnelList.map((personnel, index) => (
      <div key={personnel.id} className="personnel-item">
        <p><strong>{index + 1}. Name:</strong> {personnel.name}</p>
        <p><strong>Position:</strong> {personnel.position}</p>
        <p><strong>Email:</strong> {personnel.email}</p>
      </div>
    ))}
  </div>

  );
};

export default PersonnelList;
