import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import './ProfilePage.css'; 
import { db, auth } from '../config/firebaseConfig';
import { ref, get, update } from 'firebase/database';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    id: '',
    mobile: '',
    email: ''
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = ref(db, 'userDetails', user.uid);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setFormData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              id: user.uid,
              mobile: userData.mobile || '',
              email: userData.email || ''
            });
          }
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = ref(db, 'userDetails', formData.id); 
      await update(userRef, formData); 
      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <Header userName={`${formData.firstName} ${formData.lastName}`} />
      <div className="dashboard">
        <Navbar />
        <div >
          <h2 className='header'>User Profile</h2>
          <form className="user-profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>User ID:</label>
              <input type="text" name="id" value={formData.id} readOnly />
            </div>
            <div className="form-group">
              <label>Mobile:</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-button">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
