import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole, user }) => {
  const userData = user || localStorage.getItem('user');
  
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = typeof userData === 'string' ? JSON.parse(userData) : userData;
  
  if (requiredRole && userInfo.role !== requiredRole) {
    const redirectPath = userInfo.role === 'admin' ? '/admin' : '/feedback';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
