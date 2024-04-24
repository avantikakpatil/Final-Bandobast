import React from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebaseConfig';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectors: [],
      selectedSector: null
    };
  }

  componentDidMount() {
    // Fetch sector names from Firebase
    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sectorNames = Object.values(data).map(item => item.title); // Extract sector titles
        this.setState({ sectors: sectorNames });
      }
    });
  }

  handleSectorClick = (sector) => {
    // Fetch personnel names associated with the selected sector from Firebase
    const bandobastRef = ref(db, 'bandobastDetails');
    onValue(bandobastRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data[sector]) {
        const personnelNames = data[sector].personnel || [];
        this.setState({ selectedSector: sector, personnel: personnelNames });
      }
    });
  }
  

  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Sidebar</h2>
        </div>
        <div className="sector-list">
          {this.state.sectors.map((sector, index) => (
            <div key={index} className="sector" onClick={() => this.handleSectorClick(sector)}>
              {sector}
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
