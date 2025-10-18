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
          <div className="features">
            <div className="feature">
              <h3>🗺️ Trip Planning</h3>
              <p>Create detailed itineraries with days, stops, and activities</p>
            </div>
            <div className="feature">
              <h3>📍 Smart Routing</h3>
              <p>Optimize your routes with intelligent navigation</p>
            </div>
            <div className="feature">
              <h3>🏨 Comprehensive Stops</h3>
              <p>Add accommodations, restaurants, attractions, and more</p>
            </div>
          </div>
          
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
