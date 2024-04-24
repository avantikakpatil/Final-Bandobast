import React from 'react';
const Notification = () => {
  // Dummy data for notifications
  const notifications = [
    { id: 1, title: 'Notification 1', message: 'Lorem ipsum dolor sit amet' },
    { id: 2, title: 'Notification 2', message: 'Consectetur adipiscing elit' },
    { id: 3, title: 'Notification 3', message: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua' }
  ];

  return (
    <div className="notification-panel">
      <h3>Notifications</h3>
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
