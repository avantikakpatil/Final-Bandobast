import React, { useState } from 'react';
import PersonnelForm from './PersonnelForm';

const PersonnelList = () => {
  const [personnelList, setPersonnelList] = useState([]);

  const handleAddPersonnel = (newPersonnel) => {
    setPersonnelList([...personnelList, newPersonnel]);
  };

  return (
    <div>
      <h2>Personnel List</h2>
      <PersonnelForm onAddPersonnel={handleAddPersonnel} />
      <ul>
        {personnelList.map(personnel => (
          <li key={personnel.id}>
            {personnel.name} - {personnel.designation}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonnelList;
