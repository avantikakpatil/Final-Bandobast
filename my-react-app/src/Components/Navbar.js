import React from 'react';
import logo from '../reshot-icon-home-location-MTD2XAC3BJ.svg'; 
import logo1 from '../reshot-icon-map-location-7XRBN5JZSY.svg';
import logo2 from '../reshot-icon-monitor-rounded-D8B5JZUWPC.svg';
import logo3 from '../reshot-icon-report-ES7LZ2B9DN.svg';
import logo4 from '../reshot-icon-add-H2DVXKGZEJ.svg';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

class Navbar extends React.Component {
  render() {
    return (
      <div className="navbar">
        <ul className="navbar-menu">
          <li>
            <Link to="/homepage">
              <img src={logo} alt="Home" title="Home" className="navbar-icon" />
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <img src={logo1} alt="Sector" title="Sector" className="navbar-icon" />
            </Link>
          </li>
          <li>
            <Link to="/monitoring">
              <img src={logo2} alt="Monitor" title="Monitor" className="navbar-icon" />
            </Link>
          </li>
          <li>
            <Link to="/add-personnel">
              <img src={logo4} alt="Add Personnel" title="Add Personnel" className="navbar-icon" />
            </Link>
          </li>
          <li>
            <Link to="/bandobast-report">
              <img src={logo3} alt="Report" title="Report" className="navbar-icon" />
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Navbar;
