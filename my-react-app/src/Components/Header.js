import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import profileLogo from '../reshot-icon-profile-QX6KDSLJC5.svg'; 
import notificationLogo from '../reshot-icon-notification-LWSEPK97JU.svg'; 
import systemLogo from '../Bandobast system_transparent.png';
import { db, auth } from '../config/firebaseConfig';
import { ref, get } from 'firebase/database';

const Header = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = ref(db, 'userDetails', user.uid);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserName(`${userData.firstName} ${userData.lastName}`);
          }
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }, []);

  return (
    <div className="header">
      <div className="header-title">
        <img src={systemLogo} alt="Bandobast System Logo" className="system-logo" /> 
        Bandobast System 
      </div>
      <div className="header-profile">
        <img src={notificationLogo} alt="Notification" className="notification-icon" />
        <Link to="/profile-page">
          <img src={profileLogo} alt="Profile" className="profile-icon" />
        </Link>
        <span className="profile-name">{userName}</span>
      </div>
    </div>
  );
};

export default Header;
