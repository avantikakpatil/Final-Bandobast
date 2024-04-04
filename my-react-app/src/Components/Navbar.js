import React from 'react';
import logo from '../logo.svg'; 
class Navbar extends React.Component {
  render() {
    return (
      <div className="navbar">
        <div className="navbar-header">
          <img src={logo} alt="Logo" className="navbar-logo" /> {/* Use the logo */}
        </div>
        <ul className="navbar-menu">
          <li><img src={logo} alt="Home" className="navbar-icon" /><a href="#">Home</a></li>
          <li><img src={logo} alt="About" className="navbar-icon" /><a href="#">About</a></li>
          <li><img src={logo} alt="Services" className="navbar-icon" /><a href="#">Services</a></li>
          <li><img src={logo} alt="Contact" className="navbar-icon" /><a href="#">Contact</a></li>
        </ul>
      </div>
    );
  }
}
export default Navbar;
