import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripsService } from '../services/auth';
import StatusDropdown from '../components/StatusDropdown';
import CreateTripModal from '../components/CreateTripModal';
import LoadingAnimation from '../components/LoadingAnimation';
import { getStatusDescription, getAllStatusOptions } from '../utils/statusUtils';

const TripsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  // Filter trips when trips or statusFilter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredTrips(trips);
    } else if (statusFilter === 'active') {
      // Default view: show draft and active trips
      setFilteredTrips(trips.filter(trip => trip.status === 'draft' || trip.status === 'active'));
    } else {
      // Specific status filter
      setFilteredTrips(trips.filter(trip => trip.status === statusFilter));
    }
  }, [trips, statusFilter]);

  const loadTrips = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Loading trips for user:', user?.id);
      // Pass the user ID to getTrips for proper API request formatting
      const result = await tripsService.getTrips(user?.id);
      console.log('Load trips result:', result);

      if (result.success) {
        console.log('Trips loaded successfully:', result.trips?.length || 0, 'trips');
        setTrips(result.trips || []);
      } else {
        console.error('Failed to load trips:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Load trips error:', error);
      setError('Failed to load trips: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleCreateTrip = async (tripData) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors

      console.log('Creating trip with data:', tripData);
      const result = await tripsService.createTrip(tripData);
      console.log('Create trip result:', result);

      if (result.success) {
        console.log('Trip created successfully, refreshing list...');

        // Refresh trips list
        await loadTrips();

        // Reset filter to 'active' to ensure new trip is visible (new trips are 'draft')
        if (statusFilter !== 'all' && statusFilter !== 'active' && statusFilter !== 'draft') {
          console.log('Resetting filter to show new draft trip');
          setStatusFilter('active');
        }

        setShowCreateModal(false);
        console.log('Trip creation completed successfully');
      } else {
        console.error('Trip creation failed:', result.error);
        setError(result.error || 'Failed to create trip');
      }
    } catch (error) {
      console.error('Create trip error:', error);
      setError('Failed to create trip: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTripClick = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  const handleStatusChange = async (tripId, newStatus) => {
    try {
      const result = await tripsService.updateTripStatus(tripId, newStatus);

      if (result.success) {
        // Update the trip in the local state
        setTrips(prevTrips =>
          prevTrips.map(trip =>
            (trip.slug || trip.id) === tripId
              ? { ...trip, status: newStatus, updated_at: new Date().toISOString() }
              : trip
          )
        );
      } else {
        setError(`Failed to update trip status: ${result.error}`);
        // Clear error after 5 seconds
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      setError('Failed to update trip status');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="trips-page">
      <header className="trips-header">
        <div className="header-content">
          <h1>Welcome {user?.display_name || user?.email || 'User'}!</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="trips-content">
        <div className="trips-container">
          <div className="trips-page-header">
            <h2>Your Trips</h2>

            <div className="trips-controls">
              <div className="filter-section">
                <label htmlFor="status-filter" className="filter-label">Filter by status:</label>
                <select
                  id="status-filter"
                  className="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="active">
                    Current Trips ({trips.filter(trip => trip.status === 'draft' || trip.status === 'active').length})
                  </option>
                  <option value="all">All Trips ({trips.length})</option>
                  {getAllStatusOptions().map(status => {
                    const count = trips.filter(trip => trip.status === status.value).length;
                    return (
                      <option key={status.value} value={status.value}>
                        {status.emoji} {status.label} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="create-trip-button"
                disabled={loading}
              >
                <span className="button-icon">✈️</span>
                Create New Trip
              </button>

            <button
              onClick={loadTrips}
              className="refresh-button"
              disabled={loading}
              title="Refresh trips list"
            >
              <span className="button-icon">🔄</span>
              Refresh
            </button>
            </div>
          </div>
          
          {loading && (
            <LoadingAnimation
              size={60}
              message="Loading trips..."
              className="compact"
            />
          )}
          
          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}
          
          {!loading && !error && (
            <div className="trips-list">
              {filteredTrips.length === 0 ? (
                <div className="no-trips">
                  {trips.length === 0 ? (
                    <>
                      <h3>No trips yet</h3>
                      <p>Start planning your next adventure!</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="create-trip-button"
                        disabled={loading}
                      >
                        <span className="button-icon">✈️</span>
                        Create Your First Trip
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>No trips match your filter</h3>
                      <p>Try selecting a different status or view current trips.</p>
                      <button
                        onClick={() => setStatusFilter('active')}
                        className="filter-reset-button"
                      >
                        Show Current Trips
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="trips-grid">
                  {filteredTrips.map((trip) => (
                    <div key={trip.slug || trip.id} className="trip-card">
                      <div
                        className="trip-card-content"
                        onClick={() => handleTripClick(trip.slug || trip.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <h3 className="trip-title">{trip.title}</h3>
                        {trip.destination && (
                          <p className="trip-destination">📍 {trip.destination}</p>
                        )}
                        {trip.start_date && (
                          <p className="trip-date">📅 {trip.start_date}</p>
                        )}

                        {/* Trip Statistics */}
                        <div className="trip-stats">
                          <div className="trip-stat">
                            <span className="stat-icon">📆</span>
                            <span className="stat-label">Days:</span>
                            <span className="stat-value">{trip.total_days || 0}</span>
                          </div>
                          <div className="trip-stat">
                            <span className="stat-icon">📍</span>
                            <span className="stat-label">Stops:</span>
                            <span className="stat-value">
                              {trip.days?.reduce((total, day) => total + (day.stops || 0), 0) || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="trip-card-footer">
                        <div className="trip-status-section">
                          <div className="status-info">
                            <div className="status-row">
                              <span className="status-label">Status:</span>
                              <StatusDropdown
                                currentStatus={trip.status}
                                tripId={trip.slug || trip.id}
                                onStatusChange={handleStatusChange}
                                disabled={loading}
                              />
                            </div>
                            <div className="status-description">
                              {getStatusDescription(trip.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTrip}
        loading={loading}
      />
    </div>
  );
};

export default TripsPage;
