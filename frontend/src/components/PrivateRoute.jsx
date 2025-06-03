// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('auth') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    // Перенаправляем на страницу входа, запоминая текущий путь,
    // чтобы после входа можно было вернуться обратно.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // Если аутентифицирован, рендерим дочерний компонент
};

export default PrivateRoute;