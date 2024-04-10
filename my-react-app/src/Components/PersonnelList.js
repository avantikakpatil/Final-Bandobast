import React, { useState } from 'react';

const PersonnelList = () => {
  const [personnelList, setPersonnelList] = useState([]);

  return (
    <div>
      <h2>Personnel List</h2>
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
