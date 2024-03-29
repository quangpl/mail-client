import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button } from 'antd';
import { BrowserRouter, Switch, Route, Router } from 'react-router-dom';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory({ forceRefresh: true });

function App() {
  return (
    <Router history={history}>
      <Route exact path='/'>
        <HomePage />
      </Route>
      <Route path='/login'>
        <LoginPage />
      </Route>
    </Router>
  );
}

export default App;
