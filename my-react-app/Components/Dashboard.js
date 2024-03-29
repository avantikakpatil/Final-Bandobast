import React from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

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
