import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../common/Loader';

interface PrivateRouteProps {
  children: React.ReactElement;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
