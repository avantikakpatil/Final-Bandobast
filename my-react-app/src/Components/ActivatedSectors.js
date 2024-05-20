import React from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "../config/firebaseConfig";
import "./Sidebar.css"; // Import CSS file

class ActivatedSectors extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectors: [],
      selectedSector: null,
      additionalInfo: {}, // State to hold additional information about the selected sector
      sliderClicked: [], // State to track the number of times the slider has been clicked for each sector
      personnelData: {}, // State to hold personnel data
      countdowns: {} // State to hold countdown times for each sector
    };
    this.timers = {}; // Hold setInterval references to clear them later
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
          date: value.date,
          startTime: value.startTime,
          endTime: value.endTime
        }));
        this.setState({ 
          sectors: sectorNames, 
          sliderClicked: Array(sectorNames.length).fill(0) 
        }, this.initializeCountdowns);
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

  initializeCountdowns = () => {
    this.state.sectors.forEach((sector, index) => {
      if (sector.active) {
        this.startCountdown(index);
      }
    });
  }

  startCountdown = (index) => {
    const update = () => {
      this.updateCountdown(index);
    };
    this.updateCountdown(index);
    this.timers[index] = setInterval(update, 1000);
  }

  stopCountdown = (index) => {
    clearInterval(this.timers[index]);
    this.timers[index] = null;
  }

  updateCountdown = (index) => {
    const sector = this.state.sectors[index];
    const [day, month, year] = sector.date.split("-");
    const startDate = new Date(`${year}-${month}-${day}T${sector.startTime}:00`).getTime();
    const endDate = new Date(`${year}-${month}-${day}T${sector.endTime}:00`).getTime();
    const now = new Date().getTime();

    let countdownText;
    let remainingTime;

    if (now < startDate) {
      remainingTime = startDate - now;
      countdownText = `Bandobast starts in ${this.formatCountdown(remainingTime)}`;
    } else if (now < endDate) {
      remainingTime = endDate - now;
      countdownText = `Bandobast ends in ${this.formatCountdown(remainingTime)}`;
    } else {
      countdownText = "Bandobast has ended";
      this.stopCountdown(index);
    }

    this.setState(prevState => ({
      countdowns: {
        ...prevState.countdowns,
        [index]: countdownText
      }
    }));
  }

  formatCountdown = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
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

      if (newActiveStatus) {
        this.startCountdown(index);
      } else {
        this.stopCountdown(index);
        this.setState(prevState => ({
          countdowns: {
            ...prevState.countdowns,
            [index]: null
          }
        }));
      }
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
            const countdowns = { ...prevState.countdowns };
            delete countdowns[index];
            return { sectors, sliderClicked, additionalInfo, countdowns };
          });
        })
        .catch((error) => {
          console.error("Error deleting sector:", error);
        });
    }
  };

  render() {
    // Filter active sectors
    const activeSectors = this.state.sectors.filter(sector => sector.active);
  
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Sectors</h2>
        </div>
        <div className="sector-list">
          {activeSectors.map((sector, index) => (
            <div
              key={index}
              className={`sector ${sector.active ? "active" : ""}`}
              onClick={() => this.handleSectorClick(index)}
            >
              <span>{sector.name}</span>
              <div className="countdown">{this.state.countdowns[index]}</div>
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
                    <h4>Personnel:</h4>
                    <ul>
                      {Object.values(
                        this.state.additionalInfo[index]?.data.personnel
                      ).map((personId, personIndex) => (
                        <li key={personIndex}>
                          {this.state.personnelData[personId]?.name}
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

export default ActivatedSectors;
