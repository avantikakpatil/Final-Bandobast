import React from 'react';
import profileLogo from '../reshot-icon-profile-QX6KDSLJC5.svg'; 
import notificationLogo from '../reshot-icon-notification-LWSEPK97JU.svg'; 
import systemLogo from '../Bandobast system_transparent.png'; 
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <div className="header-title">
          <img src={systemLogo} alt="Bandobast System Logo" className="system-logo" /> 
          Bandobast System 
        </div>
        <div className="header-profile">
          {/* Profile logo and user name */}
          <img src={notificationLogo} alt="Notification" className="notification-icon" />
          <Link to="/profile-page">
          <img src={profileLogo} alt="Profile" className="profile-icon" />
          </Link>
          <span className="profile-name">Avantika Patil</span> 
        </div>
      </div>
    );
  }
}

export default Header;
