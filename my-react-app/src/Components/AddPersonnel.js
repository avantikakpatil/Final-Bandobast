import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import PersonnelForm from './PersonnelForm';
import './AddPersonnel.css';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const AddPersonnel = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [personnelList, setPersonnelList] = useState([]);

  useEffect(() => {
    const personnelRef = ref(db, 'personnel');
    onValue(personnelRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const personnelData = Object.values(data);
        setPersonnelList(personnelData);
      }
    });
  }, []);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const addPersonnel = (newPersonnel) => {
    setPersonnelList([...personnelList, newPersonnel]);
    setIsFormOpen(false);
  };

  return (
    <div>
      <Header />
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <table className="personnel-table">
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Name</th>
                <th>Position</th>
                <th>Email</th>
                <th>Device ID</th> {/* New column for Device ID */}
              </tr>
            </thead>
            <tbody>
              {personnelList.map((personnel, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{personnel.name}</td>
                  <td>{personnel.position}</td>
                  <td>{personnel.email}</td>
                  <td>{personnel.deviceId}</td> {/* Display Device ID */}
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-button" onClick={toggleForm}>Add Officer</button>
          {isFormOpen && (
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={() => setIsFormOpen(false)}>×</button>
                <PersonnelForm onClose={() => setIsFormOpen(false)} addPersonnel={addPersonnel} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPersonnel;
