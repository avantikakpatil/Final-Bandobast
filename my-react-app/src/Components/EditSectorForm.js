import React, { useEffect, useState } from 'react';
import { db } from '../config/firebaseConfig';
import { ref, onValue, set } from 'firebase/database';

const EditSectorForm = ({ existingBandobastDetails }) => {
  const [bandobastDetails, setBandobastDetails] = useState(existingBandobastDetails || {
    title: '',
    personnel: [],
    date: '',
    startTime: '',
    endTime: '',
    coordinates: []
  });
  const [personnelOptions, setPersonnelOptions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const personnelRef = ref(db, 'personnel');
    onValue(personnelRef, (snapshot) => {
      const personnelData = snapshot.val();
      if (personnelData) {
        const options = Object.keys(personnelData).map((key) => ({
          value: key,
          label: personnelData[key].name,
        }));
        setPersonnelOptions(options);
      }
    });
  }, []);

  useEffect(() => {
    if (existingBandobastDetails) {
      setShowForm(true);
    }
  }, [existingBandobastDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save updated data to the database
      const bandobastRef = ref(db, 'bandobastDetails');
      const updatedBandobastRef = ref(bandobastRef, existingBandobastDetails.id); // Assuming you have an ID for each bandobast
      set(updatedBandobastRef, bandobastDetails);

      setShowForm(false);
      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data: ', error);
      alert('Error saving data: ' + error.message);
    }
  };

  const handleSelectPersonnel = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setBandobastDetails((prevState) => ({
      ...prevState,
      personnel: selectedOptions,
    }));
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {showForm && (
        <div
          style={{
            position: 'absolute',
            margin: '10px 30px 20px 40px',
            width: '37%',
            height: '600px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '10px 120px 10px 120px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
          }}
        >
          <button
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1.2em',
            }}
            onClick={handleCloseForm}
          >
            ×
          </button>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', marginTop: '2px' }}>Edit Bandobast</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: '1px' }}>
            <div className="form-group">
              <label>Title of the Bandobast:</label>
              <input
                type="text"
                name="title"
                value={bandobastDetails.title}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div className="form-group">
              <label>Select the Ground Personnel:</label>
              <select
                name="personnel"
                multiple
                value={bandobastDetails.personnel}
                onChange={handleSelectPersonnel}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              >
                {personnelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={bandobastDetails.date}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div className="form-group">
              <label>Duration From:</label>
              <input
                type="time"
                name="startTime"
                value={bandobastDetails.startTime}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, startTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div className="form-group">
              <label>Duration To:</label>
              <input
                type="time"
                name="endTime"
                value={bandobastDetails.endTime}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, endTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: '#fff',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Update Bandobast
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditSectorForm;
