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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const personnelRef = ref(db, 'personnel');
    const unsubscribe = onValue(personnelRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const personnelData = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setPersonnelList(personnelData);
      } else {
        setPersonnelList([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching personnel data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
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
      <Header /> {/* Render the Header component */}
      <div className="dashboard">
        <Navbar /> {/* Render the Navbar component */}
        <div className="content">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <table className="personnel-table">
                <thead>
                  <tr>
                    <th>Sr. No</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Device ID</th>        
                  </tr>
                </thead>
                <tbody>
                  {personnelList.map((personnel, index) => (
                    <tr key={personnel.id}>
                      <td>{index + 1}</td>
                      <td>{personnel.name}</td>
                      <td>{personnel.position}</td>
                      <td>{personnel.email}</td>
                      <td>{personnel.deviceId}</td>                      
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="add-button" onClick={toggleForm}>Add Officer</button> {/* Button to toggle the form */}
              {isFormOpen && (
                <div className="popup">
                  <div className="popup-content">
                    <button className="close-button" onClick={() => setIsFormOpen(false)}>×</button> {/* Close button */}
                    <PersonnelForm onClose={() => setIsFormOpen(false)} addPersonnel={addPersonnel} /> {/* Render the form component */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPersonnel;
