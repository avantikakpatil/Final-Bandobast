import React, { useState, useEffect } from 'react';
import Header from './Header'; // Import the Header component
import Navbar from './Navbar'; // Import the Navbar component
import PersonnelForm from './PersonnelForm'; // Import the PersonnelForm component
import PersonnelList from './PersonnelList'; // Import the PersonnelList component
import './AddPersonnel.css'; // Import your CSS file for styling if needed
import { db } from '../config/firebaseConfig'; // Import your Firebase configuration
import { ref, onValue } from 'firebase/database';

const AddPersonnel = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);

  useEffect(() => {
    const personnelRef = ref(db, 'personnel'); // Assuming 'personnel' is your Firebase database node
    onValue(personnelRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const personnelData = Object.values(data); // Convert the object of personnel to an array
        setPersonnelList(personnelData);
      }
    });
  }, []); // Empty dependency array ensures the effect runs only once, equivalent to componentDidMount

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
