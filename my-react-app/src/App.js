import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; 
import Dashboard from './Components/Dashboard';
import AddPersonnel from './Components/AddPersonnel';
import { Login } from './Components/Login';
import ProfilePage from './Components/ProfilePage';
import Monitoring from './Components/Monitoring';
import HomePage from './Components/HomePage';
import Notification from './Components/Notification';
import ActivatedSectors from './Components/ActivatedSectors';
import BandobastReport from './Components/BandobastReport';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.notificationRef = React.createRef();
  }

  addNotification = (message) => {
    this.notificationRef.current.addNotification(message);
  };

  render() {
    return (
      <Router>
        <div className="App">
          <Notification ref={this.notificationRef} />
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/add-personnel" component={AddPersonnel} /> 
            <Route path="/homepage" component={HomePage} /> 
            <Route path="/dashboard" component={Dashboard} /> 
            <Route path="/monitoring" component={Monitoring} /> 
            <Route path="/bandobast-report" component={BandobastReport} /> 
            <Route path="/home-page" component={HomePage} /> 
            <Route path="/profile-page" component={ProfilePage} />
            <Route path="/activated-sectors" render={(props) => <ActivatedSectors {...props} addNotification={this.addNotification} />} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
