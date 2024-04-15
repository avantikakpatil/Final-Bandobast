import React, { useState } from 'react';
import Header from './Header'; // Import the Header component
import Navbar from './Navbar'; // Import the Navbar component
import PersonnelForm from './PersonnelForm'; // Import the PersonnelForm component
import PersonnelList from './PersonnelList'; // Import the PersonnelList component
import './AddPersonnel.css'; // Import your CSS file for styling if needed

const AddPersonnel = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const addPersonnel = (newPersonnel) => {
    setPersonnelList([...personnelList, newPersonnel]);
    setIsFormOpen(false); // Close the form after adding personnel
  };

  return (
    <div>
      <Header /> {/* Render the Header component */}
      <div className="dashboard">
        <Navbar /> {/* Render the Navbar component */}
        <div className="content">
          <PersonnelList personnelList={personnelList} /> {/* Render the personnel list component */}
          <button className="add-button" onClick={toggleForm}>Add Officer</button> {/* Button to toggle the form */}
          {isFormOpen && (
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={() => setIsFormOpen(false)}>×</button> {/* Close button */}
                <PersonnelForm onClose={() => setIsFormOpen(false)} addPersonnel={addPersonnel} /> {/* Render the form component */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPersonnel;