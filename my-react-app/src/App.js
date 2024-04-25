import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; 
import Dashboard from './Components/Dashboard';
import AddPersonnel from './Components/AddPersonnel';
import { Login } from './Components/Login';
import ProfilePage from './Components/ProfilePage'

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          
          <Route path="/" exact component={Dashboard} /> 
          <Route path="/add-personnel" component={AddPersonnel} /> 
          <Route path="/dashboard" component={Dashboard} /> 
          <Route path="/profile-page" component={ProfilePage} />
        </Switch> 
      </div>
    </Router>
  );
}

export default App;
