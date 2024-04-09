import React, { useState } from 'react';
import Header from './Header'; // Import the Header component
import Navbar from './Navbar'; // Import the Navbar component
import PersonnelForm from './PersonnelForm'; // Import the PersonnelForm component
import PersonnelList from './PersonnelList'; // Import the PersonnelList component
import './AddPersonnel.css'; // Import your CSS file for styling if needed

const AddPersonnel = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const PersonnelList = () => {
    // Dummy list of personnel
    const personnelData = [
      { id: 1, name: 'John Doe', position: 'Officer', department: 'Security' },
      { id: 2, name: 'Jane Smith', position: 'Guard', department: 'Security' },
      { id: 3, name: 'Mike Johnson', position: 'Officer', department: 'Administration' },
      { id: 4, name: 'Emily Davis', position: 'Guard', department: 'Administration' },
      { id: 5, name: 'Chris Brown', position: 'Officer', department: 'Operations' },
    ];
  
    return (
      <div>
        <h2>Personnel List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {personnelData.map(person => (
              <tr key={person.id}>
                <td>{person.id}</td>
                <td>{person.name}</td>
                <td>{person.position}</td>
                <td>{person.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <div>
      <Header /> {/* Render the Header component */}
      <div className="dashboard">
        <Navbar /> {/* Render the Navbar component */}
        <div className="content">
          <button className="add-button" onClick={toggleForm}>Add Officer</button> {/* Button to toggle the form */}
          {isFormOpen && <PersonnelForm />} {/* Render the form component if isFormOpen is true */}
          <PersonnelList /> {/* Render the personnel list component */}
        </div>
      </div>
    </div>
  );
};

export default AddPersonnel;
