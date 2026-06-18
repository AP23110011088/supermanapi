import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SuperheroList from './components/SuperheroList';
import SuperheroForm from './components/SuperheroForm';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const authProps = { user, onLogout: logout };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register onLogin={login} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard {...authProps} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/superheroes"
            element={isAuthenticated ? <SuperheroList {...authProps} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/superheroes/new"
            element={isAuthenticated ? <SuperheroForm {...authProps} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/superheroes/:id/edit"
            element={isAuthenticated ? <SuperheroForm {...authProps} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
