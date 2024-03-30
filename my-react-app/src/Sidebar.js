import React from 'react';
import './Components/Sidebar.css';

 // Import your sidebar styling

class Sidebar extends React.Component {
  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <ul className="sidebar-menu">
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <div className="sidebar-footer">
          <p>© 2024 Your Company</p>
        </div>
      </div>
    );
  }
}

export default Sidebar;
