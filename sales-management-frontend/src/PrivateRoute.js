// src/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = Cookies.get('access_token');

  return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;