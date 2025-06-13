import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import './utils/theme';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={SplashScreen} />
        <Route path="/login" component={LoginScreen} />
        <Route path="/dashboard" component={DashboardScreen} />
      </Switch>
    </Router>
  );
};

export default App;