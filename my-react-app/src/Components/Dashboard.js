import React from 'react';
import Sidebar from './Sidebar'; // Import Sidebar component
import Navbar from './Navbar'; // Import Navbar component
import MainContent from './MainContent'; // Import MainContent component
import Header from './Header';
class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <Header /> {/* Include Header component */}
        <div className="dashboard">
          <Navbar />
          <div className="content">
            <Sidebar />
            <MainContent />
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
