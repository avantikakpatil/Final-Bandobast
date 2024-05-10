import React, { useState } from 'react';
import './Notification.css';

const Notification = () => {
  // Dummy data for notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: '5 personnels are out of area.' },
    { id: 2, message: 'Bandobast ended' },
    { id: 3, message: 'Alert' }
  ]);

  const handleCloseNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Notifications</h3>
      </div>
      <ul>
        {notifications.map(notification => (
          <li
            key={notification.id}
            className={`notification-item ${
              notification.message === "Alert"
                ? "alert"
                : notification.message === "5 personnels are out of area."
                ? "out-of-area"
                : "bandobast-ended"
            }`}
          >
            <div className="notification-message">{notification.message}</div>
            <div className="notification-close" onClick={() => handleCloseNotification(notification.id)}>✖</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
