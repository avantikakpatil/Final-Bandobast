import React from 'react';
import logo from '../reshot-icon-home-location-MTD2XAC3BJ.svg'; 
import logo1 from '../reshot-icon-map-location-7XRBN5JZSY.svg';
import logo2 from '../reshot-icon-monitor-rounded-D8B5JZUWPC.svg';
import logo3 from '../reshot-icon-report-ES7LZ2B9DN.svg';
class Navbar extends React.Component {
  render() {
    return (
      <div className="navbar">
        
        <ul className="navbar-menu">
          <li><img src={logo} alt="Home" className="navbar-icon" /><a href="#"><h6>Home</h6></a></li>
          <li><img src={logo1} alt="About" className="navbar-icon" /><a href="#"><h6>sector</h6></a></li>
          <li><img src={logo2} alt="Services" className="navbar-icon" /><a href="#"><h6>Monitor</h6></a></li>
          <li><img src={logo3} alt="Contact" className="navbar-icon" /><a href="#"><h6>Report</h6></a></li>
        </ul>
      </div>
    );
  }
}
export default Navbar;
