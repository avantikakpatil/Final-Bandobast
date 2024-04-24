import React from 'react';
import Navbar from './Navbar'; // Import Navbar component
import MainContent from './MainContent'; // Import MainContent component
import Header from './Header';
import Notification from './Notification';

class HomePage extends React.Component {
  render() {
    return (
      <div>
        <Header /> {/* Include Header component */}
        <div className="dashboard">
          <Navbar />
          <div className="content">
            <MainContent />
            <Notification />
          </div>
        </div>
      </div>
    );
  }
}

export default HomePage;
