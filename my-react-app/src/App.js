import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; // Change here
import Dashboard from './Components/Dashboard';
import AddPersonnel from './Components/AddPersonnel';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch> {/* Change here */}
          <Route path="/" exact component={Dashboard} /> {/* Change here */}
          <Route path="/add-personnel" component={AddPersonnel} /> {/* Change here */}
        </Switch> {/* Change here */}
      </div>
    </Router>
  );
}

export default App;
