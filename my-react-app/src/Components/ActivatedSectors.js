// ActivatedSectors.js
import React from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "../config/firebaseConfig";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import customMarkerIcon from "../maps-flags_447031.png";
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
      countdowns: {},
    };
    this.timers = {};
    this.personnelMarkersRef = React.createRef();
    this.personnelMarkersRef.current = {};
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
          endTime: value.endTime,
          fixedPosition: value.fixedPosition,
          radius: value.radius,
        }));
        this.setState(
          { sectors: sectorNames, sliderClicked: Array(sectorNames.length).fill(0) },
          this.initializeCountdowns
        );
      }
    });

    const personnelRef = ref(db, "personnel");
    onValue(personnelRef, (snapshot) => {
      const personnelData = snapshot.val();
      if (personnelData) {
        this.setState({ personnelData }, this.updatePersonnelMarkers);
      }
    });
  }

  initializeCountdowns = () => {
    this.state.sectors.forEach((sector, index) => {
      if (sector.active) {
        this.startCountdown(index);
      }
    });
  };

  startCountdown = (index) => {
    const update = () => {
      this.updateCountdown(index);
    };
    this.updateCountdown(index);
    this.timers[index] = setInterval(update, 1000);
  };

  stopCountdown = (index) => {
    clearInterval(this.timers[index]);
    this.timers[index] = null;
  };

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

    this.setState((prevState) => ({
      countdowns: {
        ...prevState.countdowns,
        [index]: countdownText,
      },
    }));
  };

  formatCountdown = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

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

    if (window.confirm(`Do you really want to ${newActiveStatus ? "activate" : "deactivate"} this sector?`)) {
      this.setState((prevState) => ({
        sectors: prevState.sectors.map((sector, i) =>
          i === index ? { ...sector, active: newActiveStatus } : sector
        ),
      }));

      set(ref(db, `bandobastDetails/${sectorToUpdate.id}/isActive`), newActiveStatus);

      if (newActiveStatus) {
        this.startCountdown(index);
      } else {
        this.stopCountdown(index);
        this.setState((prevState) => ({
          countdowns: {
            ...prevState.countdowns,
            [index]: null,
          },
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

  calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  updatePersonnelMarkers = () => {
    const { personnelData, selectedSector } = this.state;
    if (!selectedSector) return;

    const { fixedPosition, radius } = selectedSector;

    Object.keys(personnelData).forEach((personnelId) => {
      const person = personnelData[personnelId];
      if (person && !this.personnelMarkersRef.current[personnelId]) {
        const marker = L.marker([person.latitude, person.longitude], {
          icon: new L.Icon({
            iconUrl: customMarkerIcon,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        }).addTo(this.props.mapRef);
        marker.bindPopup(person.name);

        const circle = L.circle([person.latitude, person.longitude], {
          radius: 10,
          color: "red",
          fillColor: "#f03",
          fillOpacity: 0.5,
        }).addTo(this.props.mapRef);

        this.personnelMarkersRef.current[personnelId] = { marker, circle };
      }

      if (fixedPosition && radius) {
        const distance = this.calculateDistance(
          fixedPosition.latitude,
          fixedPosition.longitude,
          person.latitude,
          person.longitude
        );
        if (distance > radius) {
          const message = `${person.name} is outside the designated area!`;
          console.warn(message);
          this.props.addNotification(message);
        }
      }
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.selectedSector !== this.state.selectedSector ||
      prevState.personnelData !== this.state.personnelData
    ) {
      this.updatePersonnelMarkers();
    }
  }

  render() {
    const activeSectors = this.state.sectors.filter((sector) => sector.active);

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
                <input type="checkbox" checked={sector.active} onChange={() => {}} />
                <span className="slider rectangular" onClick={() => this.handleSliderClick(index)}></span>
              </label>
              <div className="button-container">
                <button className="info-button" onClick={() => this.toggleAdditionalInfo(index)}>
                  {this.state.additionalInfo[index]?.show ? "Hide" : "Info"}
                </button>
                <button className="delete-button" onClick={() => this.handleDeleteSector(index)}>
                  Delete
                </button>
              </div>
              {this.state.additionalInfo[index]?.show &&
                this.state.additionalInfo[index]?.data && (
                  <div className="additional-info">
                    <h4>Personnel:</h4>
                    <ul>
                      {Object.values(this.state.additionalInfo[index]?.data.personnel).map(
                        (personId, personIndex) => (
                          <li key={personIndex}>{this.state.personnelData[personId]?.name}</li>
                        )
                      )}
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
