import React from 'react';
import { Navigate } from 'react-router-dom';
import { decodeToken, getToken } from '@/utils/auth.js';

const ProtectedAdminRoute = ({ children }) => {
  const token = getToken();
  const payload = decodeToken(token);

  if (!token || payload?.role !== 'Admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;

