import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <h1>Welcome to MyTrips</h1>
          <p>Plan your perfect road trip with our comprehensive trip planning tool</p>
        </header>
        
        <div className="home-content">
          <div className="home-actions">
            {isAuthenticated ? (
              <Link to="/trips" className="primary-button">
                View My Trips
              </Link>
            ) : (
              <Link to="/login" className="primary-button">
                Login to Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
