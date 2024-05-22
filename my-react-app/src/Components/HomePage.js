import React, { useEffect, useState } from 'react';
import Navbar from './Navbar'; // Import Navbar component
import MainContent from './MainContent'; // Import MainContent component
import Header from './Header';
import Notification from './Notification';
import { db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const HomePage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notificationsRef = ref(db, 'notifications');
    onValue(notificationsRef, (snapshot) => {
      const notificationsData = snapshot.val();
      if (notificationsData) {
        const notificationsArray = Object.values(notificationsData);
        setNotifications(notificationsArray);
      }
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
  }, []);

  return (
    <div>
      <Header /> {/* Include Header component */}
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <MainContent />
          <Notification notifications={notifications} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
