import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Feedback from './components/Feedback';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('App.js - Initial userData from localStorage:', userData);
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('App.js - Parsed user:', parsedUser);
      setUser(parsedUser);
    }

    // Listen for login events
    const handleLogin = () => {
      const userData = localStorage.getItem('user');
      console.log('App.js - Login event triggered, userData:', userData);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('App.js - Setting user after login:', parsedUser);
        setUser(parsedUser);
      }
    };

    window.addEventListener('userLogin', handleLogin);
    
    return () => {
      window.removeEventListener('userLogin', handleLogin);
    };
  }, []);

  const getDefaultRoute = () => {
    console.log('App.js - getDefaultRoute called, user:', user);
    if (!user) return '/login';
    const route = user.role === 'admin' ? '/admin' : '/feedback';
    console.log('App.js - Determined route:', route);
    return route;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin" user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute requiredRole="user" user={user}>
                <Feedback />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={getDefaultRoute()} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
