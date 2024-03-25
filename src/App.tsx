import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button } from 'antd';
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <HomePage />
        </Route>
        <Route path='/login'>
          <LoginPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
