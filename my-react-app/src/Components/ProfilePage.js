import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import './ProfilePage.css'; 
import { db, auth } from '../config/firebaseConfig';
import { ref, update } from 'firebase/database';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    id: '',
    mobile: '',
    email: '',
    password: '',
  });

  const [userId, setUserId] = useState('');
  const [userPassword, setUserPassword] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      setUserPassword(user.password); 
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = ref(db, 'userDetails', userId);
      await update(userRef, formData); 
      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="dashboard">
        <Navbar />
        <div>
          <h2 className='header_profile'>User Profile</h2>
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
              <label>Mobile:</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input type="password" name="password" value={userPassword} readOnly />
            </div>
            <button type="submit" className="submit-button">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
