import React from 'react';
const Notification = () => {
  // Dummy data for notifications
  const notifications = [
    { id: 1, title: 'Notification 1', message: '5 personnels are out of area.' },
    { id: 2, title: 'Notification 2', message: 'Bandobast ended' },
    { id: 3, title: 'Notification 3', message: 'Alert' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
      <h3>Notifications</h3>
        </div>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>
            <strong>{notification.title}</strong>: {notification.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;