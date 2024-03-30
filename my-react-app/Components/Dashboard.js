import React from 'react';
import Sidebar from './Components/Sidebar';
import MainContent from './Components/MainContent';

class Dashboard extends React.Component {
  render() {
    return (
      <div className="dashboard">
        <Sidebar />
        <MainContent />
      </div>
    );
  }
}

export default Dashboard;
