import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; 
import Dashboard from './Components/Dashboard';
import AddPersonnel from './Components/AddPersonnel';
import { Login } from './Components/Login';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Login} /> 
          <Route path="/Dashboard" component={Dashboard} /> 
          <Route path="/add-personnel" component={AddPersonnel} /> 
        </Switch> 
      </div>
    </Router>
  );
}

export default App;
