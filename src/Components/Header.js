import React from 'react';
import profileLogo from '../reshot-icon-profile-QX6KDSLJC5.svg'; // Import the profile logo
import notificationLogo from '../reshot-icon-notification-LWSEPK97JU.svg'; // Import the notification logo
import systemLogo from '../Bandobast system_transparent.png'; // Import the Bandobast System logo

class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <div className="header-title">
          <img src={systemLogo} alt="Bandobast System Logo" className="system-logo" /> {/* Bandobast System logo */}
          Bandobast System {/* Title placed on the left */}
        </div>
        <div className="header-profile">
          {/* Profile logo and user name */}
          <img src={notificationLogo} alt="Notification" className="notification-icon" />
          <img src={profileLogo} alt="Profile" className="profile-icon" />
          <span className="profile-name">Avantika Patil</span> {/* Replace "John Doe" with the user's name */}
        </div>
      </div>
    );
  }
}

export default Header;
