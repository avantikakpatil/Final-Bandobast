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

<<<<<<< HEAD
  render() {
    return (
      <div>
        <Header /> {/* Include Header component */}
        <div className="dashboard">
          <Navbar />
          <div className="content" style={{padding : 0}}>
            <MainContent />
            <Notification notifications={this.state.notifications} />
          </div>
=======
  return (
    <div>
      <Header /> {/* Include Header component */}
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <MainContent />
          <Notification notifications={notifications} />
>>>>>>> 80d0c704eb0508a83c0ea7bdb148fcdd31823d89
        </div>
      </div>
    </div>
  );
};

export default HomePage;
