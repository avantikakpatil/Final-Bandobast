import React from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../config/firebaseConfig";
import "./Sidebar.css"; // Import CSS file

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectors: [],
      selectedSector: null,
      activeSectors: [], // New state to track active sectors
      additionalInfo: {}, // State to hold additional information about the selected sector
      sliderClicked: false, // State to track whether the slider has been clicked
    };
  }

  componentDidMount() {
    // Fetch sector names from Firebase
    const bandobastRef = ref(db, "bandobastDetails");
    onValue(bandobastRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sectorNames = Object.values(data).map((item) => ({
          name: item.title,
          personnel: item.personnel, // Include personnel information
          active: false, // Initialize all sectors as inactive
        }));
        this.setState({ sectors: sectorNames });
      }
    });
  }

  handleSectorClick = (sectorIndex, isSliderClicked) => {
    // Check if the click event originated from the slider rectangular
    if (isSliderClicked) {
      const sectors = [...this.state.sectors];
      sectors[sectorIndex].active = !sectors[sectorIndex].active;
      this.setState({ sectors });
    } else {
      // Fetch additional information for the selected sector
      const selectedSector = this.state.sectors[sectorIndex];
      this.setState({ selectedSector });

      const additionalInfoRef = ref(db, selectedSector.title);
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
    }
  };

  toggleAdditionalInfo = (event, index) => {
    event.stopPropagation(); // Stop event propagation to prevent toggling the active state
    this.setState((prevState) => ({
      additionalInfo: {
        ...prevState.additionalInfo,
        [index]: {
          ...prevState.additionalInfo[index],
          show: !prevState.additionalInfo[index]?.show,
        },
      },
    }));
  };

  handleSliderClick = (event, index) => {
    event.stopPropagation();
    alert("Do you really want to activate this sector?");
    // Set sliderClicked to true when slider is clicked
    this.setState({ sliderClicked: true });
    // Call handleSectorClick with isSliderClicked true
    this.handleSectorClick(index, true);
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
              onClick={() => this.handleSectorClick(index, false)}
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
                  onClick={(event) => this.handleSliderClick(event, index)}
                ></span>
              </label>
              <button onClick={(event) => this.toggleAdditionalInfo(event, index)}>
                {this.state.additionalInfo[index]?.show ? "Hide" : "Info"}
              </button>
              {this.state.additionalInfo[index]?.show &&
                this.state.additionalInfo[index]?.data && (
                  <div className="additional-info">
                    <h4>Personnel:</h4>
                    <ul>
                      {Object.values(
                        this.state.additionalInfo[index]?.data.personnel
                      ).map((person, index) => (
                        <li key={index}>
                          {person.name} - {person.position}
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
