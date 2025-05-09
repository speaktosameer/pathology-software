import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('adminToken');
  return isAuth ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
