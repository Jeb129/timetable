// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access'); // или другая логика авторизации

  return isAuthenticated ? children : <Navigate to="/" />;

};

export default PrivateRoute;
