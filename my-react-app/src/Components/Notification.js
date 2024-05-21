// In the Notification component

import React from 'react';
import './Notification.css';

const Notification = ({ notifications = [] }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Notifications</h3>
      </div>
      <ul>
        {notifications.map(notification => (
          <li
            key={notification.id}
            className={`notification-item ${notification.message.includes("is out of the sector area") ? "out-of-area" : ""}`}
          >
            <div className="notification-message">{notification.message}</div>
            <div className="notification-close">✖</div>
          </li>
        ))}
      </ul>
    </div>
  );
};



export default Notification;
