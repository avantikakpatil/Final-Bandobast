import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; 
import Dashboard from './Components/Dashboard';
//import HomepagePage from './Components/HomePage';//
import AddPersonnel from './Components/AddPersonnel';
import { Login } from './Components/Login';
import ProfilePage from './Components/ProfilePage';
import Monitoring from './Components/Monitoring';
import HomePage from './Components/HomePage';
import BandobastReport from './Components/BandobastReport'; 

function App() {
  return (
    <Router> 
      <div className="App">
        <Switch>
          <Route path="/" exact component={Login} />
          <Route path="/add-personnel" component={AddPersonnel} /> 
          <Route path="/homepage" component={HomePage} /> 
          <Route path="/dashboard" component={Dashboard} /> 
          <Route path="/monitoring" component={Monitoring} /> 
          <Route path="/bandobast-report" component={BandobastReport} /> 
          <Route path="/home-page" component={HomePage} /> 
          <Route path="/profile-page" component={ProfilePage} />
        </Switch> 
      </div>
    </Router>
  );
}

export default App;
