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
      additionalInfo: null, // State to hold additional information about the selected sector
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
          personnel: item.personnel, // Include personnel information
          active: false // Initialize all sectors as inactive
        }));
        this.setState({ sectors: sectorNames });
      }
    });
  }

  handleSectorClick = (sectorIndex) => {
    const sectors = [...this.state.sectors];
    const selectedSector = sectors[sectorIndex];
    this.setState({ selectedSector });

    // Fetch additional information for the selected sector
    // You can modify this based on how your data is structured
    const additionalInfoRef = ref(db, selectedSector.title);
    onValue(additionalInfoRef, (snapshot) => {
      const additionalInfo = snapshot.val();
      if (additionalInfo) {
        this.setState({ additionalInfo });
      }
    });

    // Toggle active state
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
                <input type="checkbox" checked={sector.active} onChange={() => {}} />
                <span className="slider rectangular" onClick={(event) => event.stopPropagation()}></span>
              </label>
            </div>
          ))}
        </div>
        <div className="navbar-footer">
          {this.state.selectedSector && (
            <div className="selected-sector-info">
              <h3>{this.state.selectedSector.name}</h3>
              {this.state.additionalInfo && (
                <div>
                  <h4>Additional Information:</h4>
                  <p>Title: {this.state.additionalInfo.title}</p>
                  <p>Personnel:</p>
                  <ul>
                    {Object.values(this.state.additionalInfo.personnel).map((person, index) => (
                      <li key={index}>{person.name} - {person.position}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Sidebar;
