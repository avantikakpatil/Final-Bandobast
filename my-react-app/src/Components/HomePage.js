import React from 'react';
import Navbar from './Navbar'; // Import Navbar component
import MainContent from './MainContent'; // Import MainContent component
import Header from './Header';
import Notification from './Notification';

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    };
  }

  addNotification = (message) => {
    this.setState(prevState => ({
      notifications: [...prevState.notifications, { id: Date.now(), message }]
    }));
  };

  render() {
    return (
      <div>
        <Header /> {/* Include Header component */}
        <div className="dashboard">
          <Navbar />
          <div className="content" style={{padding : 0}}>
            <MainContent />
            <Notification notifications={this.state.notifications} />
          </div>
        </div>
      </div>
    );
  }
}

export default HomePage;
