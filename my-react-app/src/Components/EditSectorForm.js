import React, { useEffect, useState } from 'react';
import { db } from '../config/firebaseConfig';
import { ref, onValue, set } from 'firebase/database';

const EditSectorForm = ({ existingBandobastDetails, onClose }) => {
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
      const bandobastRef = ref(db, `bandobastDetails/${existingBandobastDetails.id}`);
      await set(bandobastRef, bandobastDetails);

      onClose(bandobastDetails);
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
    if (existingBandobastDetails) {
      setShowForm(false);
      onClose(bandobastDetails); // Pass the updated sector details to onClose callback
    } else {
      setShowForm(false);
    }
  };
  

  return (
    <div>
      {showForm && (
        <div style={{ marginTop: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Bandobast</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title of the Bandobast:</label>
              <input
                type="text"
                name="title"
                value={bandobastDetails.title}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, title: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Select the Ground Personnel:</label>
              <select
                name="personnel"
                multiple
                value={bandobastDetails.personnel}
                onChange={handleSelectPersonnel}
                className="form-control"
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
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Duration From:</label>
              <input
                type="time"
                name="startTime"
                value={bandobastDetails.startTime}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, startTime: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Duration To:</label>
              <input
                type="time"
                name="endTime"
                value={bandobastDetails.endTime}
                onChange={(e) => setBandobastDetails({ ...bandobastDetails, endTime: e.target.value })}
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Update Bandobast
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditSectorForm;
