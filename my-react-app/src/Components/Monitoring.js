import React from 'react';
import Sidebar from './Sidebar'; // Import Sidebar component
import Navbar from './Navbar'; // Import Navbar component
import ContentMonitor from './ContentMonitor'; // Import MainContent component
import Header from './Header';
class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <Header /> {/* Include Header component */}
        <div className="dashboard">
          <Navbar />
          <div className="content">
          <ContentMonitor />
            <Sidebar />
          </div>
        </div>
      </div>
    );
  }
}
//
export default Dashboard;
