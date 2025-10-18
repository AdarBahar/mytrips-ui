import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
