// Sidebar.js

import React from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebaseConfig';
import './Sidebar.css'; // Import CSS file

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectors: [],
      selectedSector: null,
      activeSectors: [], // New state to track active sectors
    };
  }

  componentDidMount() {
    // Fetch sector names from Firebase
    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sectorNames = Object.values(data).map(item => ({
          name: item.title,
          active: false // Initialize all sectors as inactive
        }));
        this.setState({ sectors: sectorNames });
      }
    });
  }

  handleSectorClick = (sectorIndex) => {
    const sectors = [...this.state.sectors];
    sectors[sectorIndex].active = !sectors[sectorIndex].active;
    this.setState({ sectors });
  }

  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Sidebar</h2>
        </div>
        <div className="sector-list">
          {this.state.sectors.map((sector, index) => (
            <div key={index} className={`sector ${sector.active ? 'active' : ''}`} onClick={() => this.handleSectorClick(index)}>
              <span>{sector.name}</span>
              <label className="switch rectangular">
                <input type="checkbox" checked={sector.active} onChange={() => this.handleSectorClick(index)} />
                <span className="slider rectangular"></span>
              </label>
            </div>
          ))}
        </div>
        <div className="navbar-footer">
          {this.state.selectedSector && (
            <div className="selected-sector-info">
              <h3>{this.state.selectedSector}</h3>
              {/* You can display additional information about the selected sector here */}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Sidebar;
