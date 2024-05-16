import React from 'react';
import Sidebar from './Sidebar'; 
import Navbar from './Navbar'; 
import MainContent from './MainContent';
import Header from './Header';
class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <Header /> 
        <div className="dashboard">
          <Navbar />
          <div className="content">
          <MainContent />
            <Sidebar />
          </div>
        </div>
      </div>
    );
  }
}
//
export default Dashboard;
