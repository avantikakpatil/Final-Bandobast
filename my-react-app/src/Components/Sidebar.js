import React from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "../config/firebaseConfig";
import "./Sidebar.css"; // Import CSS file

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectors: [],
      selectedSector: null,
      additionalInfo: {}, // State to hold additional information about the selected sector
      sliderClicked: [], // State to track the number of times the slider has been clicked for each sector
      personnelData: {}, // State to hold personnel data fetched from Firebase
    };
  }

  componentDidMount() {
    // Fetch sector names from Firebase
    const bandobastRef = ref(db, "bandobastDetails");
    onValue(bandobastRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sectorNames = Object.entries(data).map(([key, value]) => ({
          id: key,
          name: value.title,
          personnel: value.personnel, // Include personnel information
          active: value.isActive || false, // Include active status, default to false if not available
        }));
        this.setState({ sectors: sectorNames, sliderClicked: Array(sectorNames.length).fill(0) });
      }
    });

    // Fetch personnel data from Firebase
    const personnelRef = ref(db, 'personnel');
    onValue(personnelRef, (snapshot) => {
      const personnelData = snapshot.val();
      if (personnelData) {
        this.setState({ personnelData });
      }
    });
  }

  handleSectorClick = (sectorIndex) => {
    // Fetch additional information for the selected sector
    const selectedSector = this.state.sectors[sectorIndex];
    this.setState({ selectedSector });

    const additionalInfoRef = ref(db, `bandobastDetails/${selectedSector.id}`);
    onValue(additionalInfoRef, (snapshot) => {
      const additionalInfo = snapshot.val();
      if (additionalInfo) {
        this.setState((prevState) => ({
          additionalInfo: {
            ...prevState.additionalInfo,
            [sectorIndex]: {
              show: prevState.additionalInfo[sectorIndex]?.show || false,
              data: additionalInfo,
            },
          },
        }));
      }
    });
  };

  toggleAdditionalInfo = (index) => {
    const selectedSector = this.state.sectors[index];
    const additionalInfoRef = ref(db, `bandobastDetails/${selectedSector.id}`);
    
    onValue(additionalInfoRef, (snapshot) => {
      const additionalInfo = snapshot.val();
      if (additionalInfo) {
        this.setState((prevState) => ({
          additionalInfo: {
            ...prevState.additionalInfo,
            [index]: {
              show: !prevState.additionalInfo[index]?.show,
              data: additionalInfo,
            },
          },
        }));
      }
    });
  };

  handleSliderClick = (index) => {
    const sectorToUpdate = this.state.sectors[index];
    const newActiveStatus = !sectorToUpdate.active;

    if (window.confirm(`Do you really want to ${newActiveStatus ? 'activate' : 'deactivate'} this sector?`)) {
      // Update the local state
      this.setState(prevState => ({
        sectors: prevState.sectors.map((sector, i) => i === index ? {...sector, active: newActiveStatus} : sector)
      }));

      // Update the Firebase database
      set(ref(db, `bandobastDetails/${sectorToUpdate.id}/isActive`), newActiveStatus);
    }
  };

  handleDeleteSector = (index) => {
    const sectorToDelete = this.state.sectors[index];
    if (window.confirm(`Do you really want to delete the sector "${sectorToDelete.name}"?`)) {
      const sectorRef = ref(db, `bandobastDetails/${sectorToDelete.id}`);
      remove(sectorRef)
        .then(() => {
          // Remove the sector from the local state
          this.setState((prevState) => {
            const sectors = [...prevState.sectors];
            sectors.splice(index, 1);
            const sliderClicked = [...prevState.sliderClicked];
            sliderClicked.splice(index, 1);
            const additionalInfo = { ...prevState.additionalInfo };
            delete additionalInfo[index];
            return { sectors, sliderClicked, additionalInfo };
          });
        })
        .catch((error) => {
          console.error("Error deleting sector:", error);
        });
    }
  };
  

  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Sectors</h2>
        </div>
        <div className="sector-list">
          {this.state.sectors.map((sector, index) => (
            <div
              key={index}
              className={`sector ${sector.active ? "active" : ""}`}
              onClick={() => this.handleSectorClick(index)}
            >
              <span>{sector.name}</span>
              
              <label className="switch rectangular">
                <input
                  type="checkbox"
                  checked={sector.active}
                  onChange={() => {}}
                />
                <span
                  className="slider rectangular"
                  onClick={() => this.handleSliderClick(index)}
                ></span>
              </label>
              <div className="button-container">
                <button
                  className="info-button"
                  onClick={() => this.toggleAdditionalInfo(index)}
                >
                  {this.state.additionalInfo[index]?.show ? "Hide" : "Info"}
                </button>
                <button
                  className="delete-button"
                  onClick={() => this.handleDeleteSector(index)}
                >
                  Delete
                </button>
              </div>
              {this.state.additionalInfo[index]?.show &&
                this.state.additionalInfo[index]?.data && (
                  <div className="additional-info">
                    <h4>Additional Info:</h4>
                    {/* Display additional info here */}
                    <ul>
                      {this.state.additionalInfo[index]?.data.personnel.map(personnelId => (
                        <li key={personnelId}>
                          {this.state.personnelData[personnelId]?.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Sidebar;
