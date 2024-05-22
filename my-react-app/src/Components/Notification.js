import React, { useEffect, useState } from 'react';
import './Notification.css';

class Notification extends React.Component {
  state = {
    notifications: []
  };

  componentDidMount() {
    this.setState({ notifications: this.props.notifications });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.notifications !== this.props.notifications) {
      this.setState({ notifications: this.props.notifications });
    }
  }

  addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message
    };
    this.setState((prevState) => ({
      notifications: [...prevState.notifications, newNotification]
    }));

    // Automatically remove the notification after 5 seconds
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 5000);
  };

  removeNotification = (id) => {
    this.setState((prevState) => ({
      notifications: prevState.notifications.filter(notification => notification.id !== id)
    }));
  };

  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Notifications</h3>
        </div>
        <ul>
          {this.state.notifications.map(notification => (
            <li
              key={notification.id}
              className={`notification-item ${notification.message.includes("is out of the sector area") ? "out-of-area" : ""}`}
            >
              <div className="notification-message">{notification.message}</div>
              <div className="notification-close" onClick={() => this.removeNotification(notification.id)}>✖</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Notification;
