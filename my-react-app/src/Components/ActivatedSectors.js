import React from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "../config/firebaseConfig";
import "./Sidebar.css";

class ActivatedSectors extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectors: [],
      selectedSector: null,
      additionalInfo: {},
      sliderClicked: [],
      personnelData: {},
      countdowns: {}
    };
    this.timers = {};
  }

  componentDidMount() {
    const bandobastRef = ref(db, "bandobastDetails");
    onValue(bandobastRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sectorNames = Object.entries(data).map(([key, value]) => ({
          id: key,
          name: value.title,
          personnel: value.personnel,
          active: value.isActive || false,
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
      this.setState(prevState => ({
        sectors: prevState.sectors.map((sector, i) => i === index ? {...sector, active: newActiveStatus} : sector)
      }));

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

  checkPersonnelPositions = () => {
    const { sectors, personnelData } = this.state;
    sectors.forEach(sector => {
      if (sector.active && sector.personnel) {
        const [day, month, year] = sector.date.split("-");
        const endDate = new Date(`${year}-${month}-${day}T${sector.endTime}:00`).getTime();
        const now = new Date().getTime();

        if (now < endDate) {
          Object.keys(sector.personnel).forEach(personnelId => {
            const person = personnelData[personnelId];
            if (person) {
              const distance = this.calculateDistance(sector, person);
              if (distance > 10) {
                this.props.addNotification(`${person.name} is out of the sector area`);
              }
            }
          });
        }
      }
    });
  }

  calculateDistance = (sector, person) => {
    const [sectorLat, sectorLng] = [sector.latitude, sector.longitude];
    const R = 6371e3;
    const φ1 = sectorLat * Math.PI/180;
    const φ2 = person.latitude * Math.PI/180;
    const Δφ = (person.latitude - sectorLat) * Math.PI/180;
    const Δλ = (person.longitude - sectorLng) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  render() {
    return (
      <div className="sidebar">
        <h2>Activated Sectors</h2>
        {this.state.sectors.length === 0 ? (
          <p>No activated sectors available</p>
        ) : (
          <ul className="sector-list">
            {this.state.sectors.map((sector, index) => (
              <li key={index} className="sector-item">
                <div className="sector-header">
                  <div
                    className={`sector-name ${this.state.sliderClicked[index] ? "clicked" : ""}`}
                    onClick={() => this.handleSectorClick(index)}
                  >
                    {sector.name}
                  </div>
                  <div className="sector-actions">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={sector.active}
                        onChange={() => this.handleSliderClick(index)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <button
                      className="delete-btn"
                      onClick={() => this.handleDeleteSector(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {this.state.additionalInfo[index]?.show && (
                  <div className="additional-info">
                    <p>Date: {sector.date}</p>
                    <p>Time: {sector.startTime} - {sector.endTime}</p>
                    <p>Personnel Assigned:</p>
                    <ul>
                      {Object.entries(this.state.additionalInfo[index]?.data.personnel || {}).map(([id, person]) => (
                        <li key={id}>{person.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {this.state.countdowns[index] && (
                  <div className="countdown">{this.state.countdowns[index]}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default ActivatedSectors;