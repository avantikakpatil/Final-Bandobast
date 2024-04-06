import React from 'react';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectors: [
        { name: 'Sector A', coordinates: 'X: 10, Y: 20' },
        { name: 'Sector B', coordinates: 'X: 30, Y: 40' },
        { name: 'Sector C', coordinates: 'X: 50, Y: 60' }
        // Add more sectors as needed
      ],
      selectedSector: null
    };
  }

  handleSectorClick = (sector) => {
    this.setState({ selectedSector: sector });
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
              {sector.name}
            </div>
          ))}
        </div>
        <div className="navbar-footer">
          {this.state.selectedSector && (
            <div className="selected-sector-info">
              <h3>{this.state.selectedSector.name}</h3>
              <p>{this.state.selectedSector.coordinates}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Sidebar;
