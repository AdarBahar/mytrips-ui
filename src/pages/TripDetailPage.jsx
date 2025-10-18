import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripsService } from '../services/auth';
import LoadingAnimation from '../components/LoadingAnimation';
import StatusDropdown from '../components/StatusDropdown';
import { getStatusInfo } from '../utils/statusUtils';

const TripDetailPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  const loadTripDetails = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Loading trip details for slug:', tripId);

      // First, get trips list to find the actual trip ID
      const tripsResult = await tripsService.getTrips(user?.id);

      if (!tripsResult.success) {
        setError(tripsResult.error);
        return;
      }

      const foundTrip = tripsResult.trips.find(t => (t.slug || t.id) === tripId);
      if (!foundTrip) {
        setError('Trip not found');
        return;
      }

      console.log('Trip found in trips list:', foundTrip);
      console.log('Using trip ID for complete endpoint:', foundTrip.id);

      // Try the complete endpoint with the actual trip ID
      try {
        console.log('🔄 CALLING COMPLETE ENDPOINT with trip ID:', foundTrip.id);
        const completeResult = await tripsService.getTripComplete(foundTrip.id);

        if (completeResult.success) {
          console.log('✅ COMPLETE ENDPOINT SUCCESS - Raw response data:', completeResult.data);

          // Detailed analysis of the response structure
          const tripData = completeResult.data;
          console.log('📊 TRIP DATA ANALYSIS:');
          console.log('  - Trip title:', tripData.trip?.title);
          console.log('  - Trip destination:', tripData.trip?.destination);
          console.log('  - Total days:', tripData.days?.length || 0);

          if (tripData.days && tripData.days.length > 0) {
            tripData.days.forEach((day, dayIndex) => {
              console.log(`  📅 Day ${day.seq || dayIndex + 1}:`);
              console.log(`    - Day ID: ${day.id}`);
              console.log(`    - Date: ${day.calculated_date || 'No date'}`);
              console.log(`    - Stops count: ${day.stops?.length || 0}`);

              if (day.stops && day.stops.length > 0) {
                day.stops.forEach((stop, stopIndex) => {
                  console.log(`    📍 Stop ${stop.seq || stopIndex + 1}:`);
                  console.log(`      - Stop ID: ${stop.id}`);
                  console.log(`      - Kind: ${stop.kind} (${stop.kind === 'start' ? 'Start Point' : stop.kind === 'end' ? 'End Point' : stop.kind === 'via' ? 'Via Point' : 'Unknown'})`);
                  console.log(`      - Stop Type: ${stop.stop_type} (usually "other")`);
                  console.log(`      - Place name: ${stop.place?.name || 'No place name'}`);
                  console.log(`      - Place address: ${stop.place?.address || 'No address'}`);
                  console.log(`      - Coordinates: ${stop.place?.lat}, ${stop.place?.lon}`);
                  console.log(`      - Fixed: ${stop.fixed}`);
                  console.log(`      - Notes: ${stop.notes || 'No notes'}`);
                });
              }

              if (day.route_summary) {
                console.log(`    🗺️ Route Summary:`);
                console.log(`      - Distance: ${day.route_summary.total_distance}`);
                console.log(`      - Duration: ${day.route_summary.total_duration}`);
                console.log(`      - Stops: ${day.route_summary.total_stops}`);
              }

              if (day.route_info) {
                console.log(`    🗺️ Route Info (legacy):`);
                console.log(`      - Distance: ${day.route_info.distance}`);
                console.log(`      - Duration: ${day.route_info.duration}`);
              }
            });
          } else {
            console.log('  ⚠️ No days found in trip data');
          }

          setTripData(completeResult.data);
          return;
        }
      } catch (completeError) {
        console.log('❌ COMPLETE ENDPOINT FAILED:', completeError);
        console.log('Using fallback data');
      }

      // Fallback: Use the trip data we already have from trips list
      console.log('Using fallback trip data from trips list');
      setUsingFallback(true);
      setTripData({
        trip: foundTrip,
        days: foundTrip.days || [] // Use days data from trips list if available
      });

    } catch (error) {
      console.error('Load trip details error:', error);
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTrips = () => {
    navigate('/trips');
  };

  const handleStatusChange = async (tripId, newStatus) => {
    if (!tripData?.trip?.id) return;

    setStatusUpdating(true);
    try {
      console.log('🔄 Changing trip status:', {
        tripId: tripId,
        actualTripId: tripData.trip.id,
        currentStatus: tripData.trip.status,
        newStatus: newStatus
      });

      // Use the actual trip ID from tripData, not the slug from tripId parameter
      const result = await tripsService.updateTripStatus(tripData.trip.id, newStatus);

      if (result.success) {
        console.log('✅ Trip status updated successfully');

        // Update the local trip data
        setTripData(prevData => ({
          ...prevData,
          trip: {
            ...prevData.trip,
            status: newStatus
          }
        }));
      } else {
        console.error('❌ Failed to update trip status:', result.error);
        setError(`Failed to update status: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Status update error:', error);
      setError('Failed to update trip status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="trip-detail-page">
        <LoadingAnimation
          size={80}
          message="Loading trip details..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-detail-page">
        <div className="error-message">
          Error: {error}
          <button onClick={handleBackToTrips} className="back-button">
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  if (!tripData || !tripData.trip) {
    return (
      <div className="trip-detail-page">
        <div className="error-message">
          Trip not found
          <button onClick={handleBackToTrips} className="back-button">
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  const { trip, days = [] } = tripData;

  // Calculate statistics
  const totalStops = days.reduce((sum, day) => sum + (day.stops?.length || 0), 0);
  const totalDays = days.length;

  return (
    <div className="trip-detail-page">
      <header className="trip-detail-header">
        <div className="header-content">
          {/* Left Side: Back Button */}
          <div className="header-left">
            <button onClick={handleBackToTrips} className="back-button">
              ← Back to Trips
            </button>
          </div>

          {/* Center: Trip Info */}
          <div className="header-center">
            <h1 className="trip-title">{trip.title}</h1>
            {trip.destination && (
              <span className="trip-destination">📍 {trip.destination}</span>
            )}
          </div>

          {/* Right Side: Status and User */}
          <div className="header-right">
            <div className="status-section">
              <span className="status-text">
                Status: <span className={`status-value status-${trip.status}`}>
                  {getStatusInfo(trip.status).emoji} {getStatusInfo(trip.status).label}
                </span>
              </span>
              <StatusDropdown
                currentStatus={trip.status}
                tripId={trip.id}
                onStatusChange={handleStatusChange}
                disabled={statusUpdating}
              />
            </div>
            <div className="user-section">
              <span className="user-name">{user?.name || user?.email}</span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="trip-detail-main">
        <div className="trip-detail-content">

          {/* Fallback Notice */}
          {usingFallback && (
            <div className="fallback-notice">
              <div className="notice-content">
                <span className="notice-icon">ℹ️</span>
                <div className="notice-text">
                  <strong>Limited View:</strong> Detailed itinerary information is not available yet.
                  Showing basic trip information from the trips list.
                </div>
              </div>
            </div>
          )}

          {/* Trip Overview Section */}
          <div className="trip-overview-section">
            <h2>Trip Overview</h2>
            <div className="trip-stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📆</span>
                <span className="stat-value">{totalDays}</span>
                <span className="stat-label">Days</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📍</span>
                <span className="stat-value">{totalStops}</span>
                <span className="stat-label">Stops</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <span className={`stat-value status-${trip.status}`}>{trip.status}</span>
                <span className="stat-label">Status</span>
              </div>
            </div>

            <div className="trip-info-grid">
              {trip.start_date && (
                <div className="info-item">
                  <strong>📅 Start Date:</strong> {trip.start_date}
                </div>
              )}
              {trip.end_date && (
                <div className="info-item">
                  <strong>📅 End Date:</strong> {trip.end_date}
                </div>
              )}
              {trip.description && (
                <div className="info-item description">
                  <strong>📝 Description:</strong>
                  <p>{trip.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Days and Itinerary Section */}
          {days.length > 0 ? (
            <div className="itinerary-section">
              <h2>Itinerary</h2>
              <div className="days-list">
                {days.map((day, index) => (
                  <div key={day.id || index} className="day-card">
                    <div className="day-header">
                      <h3>Day {day.seq}</h3>
                      {day.calculated_date && (
                        <span className="day-date">{new Date(day.calculated_date).toLocaleDateString()}</span>
                      )}
                    </div>

                    {day.stops && day.stops.length > 0 ? (
                      <div className="stops-list">
                        {day.stops.map((stop, stopIndex) => (
                          <div key={stop.id || stopIndex} className="stop-card">
                            <div className="stop-header">
                              <span className={`stop-kind ${stop.kind}`}>
                                {stop.kind === 'start' ? '🚀' : stop.kind === 'end' ? '🏁' : stop.kind === 'via' ? '📍' : '❓'}
                              </span>
                              <span className="stop-sequence">#{stop.seq}</span>
                              <span className={`stop-kind-label ${stop.kind}`}>
                                {stop.kind === 'start' ? 'Start' : stop.kind === 'end' ? 'End' : stop.kind === 'via' ? 'Stop' : 'Unknown'}
                              </span>
                            </div>

                            {stop.place && (
                              <div className="place-info">
                                <h4 className="place-name">{stop.place.name}</h4>
                                {stop.place.address && (
                                  <p className="place-address">📍 {stop.place.address}</p>
                                )}
                                {stop.place.coordinates && (
                                  <p className="place-coordinates">
                                    🗺️ {stop.place.coordinates.lat}, {stop.place.coordinates.lng}
                                  </p>
                                )}
                              </div>
                            )}

                            {stop.notes && (
                              <div className="stop-notes">
                                <p>📝 {stop.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-stops">
                        <p>No stops planned for this day</p>
                      </div>
                    )}

                    {/* Route Summary from bulk-active-summaries */}
                    {day.route_summary && (
                      <div className="route-summary">
                        <h4>🗺️ Route Summary</h4>
                        <div className="route-summary-stats">
                          <span className="route-stat">
                            📏 {day.route_summary.total_distance || 'N/A'}
                          </span>
                          <span className="route-stat">
                            ⏱️ {day.route_summary.total_duration || 'N/A'}
                          </span>
                          {day.route_summary.total_stops && (
                            <span className="route-stat">
                              📍 {day.route_summary.total_stops} stops
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Legacy route_info fallback */}
                    {!day.route_summary && day.route_info && (
                      <div className="route-info">
                        <h4>🗺️ Route Information</h4>
                        <p>Distance: {day.route_info.distance || 'N/A'}</p>
                        <p>Duration: {day.route_info.duration || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-itinerary">
              <h2>Itinerary</h2>
              <p>No days have been planned for this trip yet.</p>
              <p>Start planning your trip by adding days and stops!</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default TripDetailPage;
