import React, { useState, useEffect } from 'react';
import { tripsService } from '../services/auth';

const DailyRouteMap = ({ tripId, dayId, height = 400, showOptimizedRoute = true }) => {
  const [routeData, setRouteData] = useState(null);
  const [stopsData, setStopsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tripId && dayId) {
      loadRouteData();
    }
  }, [tripId, dayId, showOptimizedRoute]);

  const loadRouteData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get route summary for basic route coordinates
      const summaryResult = await tripsService.getSingleDayRouteSummary(dayId);

      // Get detailed stops data for the day
      const stopsResult = await tripsService.getStopsForDay(tripId, dayId);

      if (summaryResult.success && summaryResult.summary) {
        setRouteData({
          summary: summaryResult.summary,
          coordinates: summaryResult.summary.route_coordinates,
          totalKm: summaryResult.summary.route_total_km,
          totalMin: summaryResult.summary.route_total_min,
          start: summaryResult.summary.start,
          end: summaryResult.summary.end
        });
      } else {
        setError('No route data available for this day');
      }

      // Set stops data for leg visualization
      if (stopsResult.success && stopsResult.data && stopsResult.data.stops) {
        setStopsData(stopsResult.data.stops);
      }
    } catch (err) {
      setError('Failed to load route data');
      console.error('Route loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (km) => {
    if (!km) return 'N/A';
    return `${Math.ceil(km)} km`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const totalMinutes = Math.ceil(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  // Generate route legs from stops data
  const generateRouteLegs = () => {
    if (!stopsData || stopsData.length < 2) return [];

    // Sort stops by sequence to get correct order
    const sortedStops = [...stopsData].sort((a, b) => a.seq - b.seq);

    const legs = [];
    for (let i = 0; i < sortedStops.length - 1; i++) {
      const fromStop = sortedStops[i];
      const toStop = sortedStops[i + 1];

      // Get coordinates from place data
      const fromCoords = fromStop.place?.coordinates || fromStop.place;
      const toCoords = toStop.place?.coordinates || toStop.place;

      if (fromCoords && toCoords) {
        legs.push({
          from: {
            name: fromStop.place?.name || `Stop ${fromStop.seq}`,
            lat: fromCoords.lat,
            lon: fromCoords.lon || fromCoords.lng,
            kind: fromStop.kind,
            seq: fromStop.seq
          },
          to: {
            name: toStop.place?.name || `Stop ${toStop.seq}`,
            lat: toCoords.lat,
            lon: toCoords.lon || toCoords.lng,
            kind: toStop.kind,
            seq: toStop.seq
          },
          legNumber: i + 1
        });
      }
    }

    return legs;
  };

  const generateMapUrl = (coordinates, start, end) => {
    // Check if Google Maps API key is available
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // If no API key is configured, return null to show placeholder
    if (!apiKey) {
      return null;
    }

    const legs = generateRouteLegs();

    // If we have stops data, create a multi-waypoint directions URL
    if (legs.length > 0) {
      const origin = `${legs[0].from.lat},${legs[0].from.lon}`;
      const destination = `${legs[legs.length - 1].to.lat},${legs[legs.length - 1].to.lon}`;

      // Add intermediate waypoints
      const waypoints = legs.slice(0, -1).map(leg => `${leg.to.lat},${leg.to.lon}`).join('|');

      let url = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}&mode=driving`;

      if (waypoints) {
        url += `&waypoints=${waypoints}`;
      }

      return url;
    }

    // Fallback to coordinate-based map or simple start-end
    if (coordinates && coordinates.length > 0) {
      const center = coordinates[Math.floor(coordinates.length / 2)];
      return `https://www.google.com/maps?q=${center[1]},${center[0]}&z=12&output=embed`;
    }

    if (start && end) {
      return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${start.lat},${start.lon}&destination=${end.lat},${end.lon}&mode=driving`;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="daily-route-map">
        <div className="route-map-loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading route...</p>
        </div>
      </div>
    );
  }

  if (error || !routeData) {
    return (
      <div className="daily-route-map">
        <div className="route-map-error">
          <p>📍 {error || 'No route data available'}</p>
          <button onClick={loadRouteData} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const mapUrl = generateMapUrl(routeData.coordinates, routeData.start, routeData.end);
  const routeLegs = generateRouteLegs();

  return (
    <div className="daily-route-map">
      {/* Route Summary */}
      <div className="route-summary-header">
        <h3 className="route-title">📍 Daily Route</h3>
        {showOptimizedRoute && (
          <span className="optimization-badge">🚀 Optimized</span>
        )}
      </div>

      {/* Route Legs Summary */}
      {routeLegs.length > 0 && (
        <div className="route-legs-summary">
          <h4 className="legs-title">🛣️ Route Legs ({routeLegs.length})</h4>
          <div className="legs-list">
            {routeLegs.map((leg, index) => (
              <div key={index} className="route-leg">
                <div className="leg-number">{leg.legNumber}</div>
                <div className="leg-details">
                  <div className="leg-from">
                    <span className="stop-icon">
                      {leg.from.kind === 'start' ? '🏁' : leg.from.kind === 'end' ? '🏁' : '📍'}
                    </span>
                    <span className="stop-name">{leg.from.name}</span>
                  </div>
                  <div className="leg-arrow">→</div>
                  <div className="leg-to">
                    <span className="stop-icon">
                      {leg.to.kind === 'start' ? '🏁' : leg.to.kind === 'end' ? '🏁' : '📍'}
                    </span>
                    <span className="stop-name">{leg.to.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="route-summary-stats">
        <div className="route-stat">
          <span className="stat-icon">📏</span>
          <span className="stat-value">{formatDistance(routeData.totalKm)}</span>
          <span className="stat-label">Distance</span>
        </div>
        <div className="route-stat">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{formatDuration(routeData.totalMin)}</span>
          <span className="stat-label">Duration</span>
        </div>
        {routeData.coordinates && (
          <div className="route-stat">
            <span className="stat-icon">🗺️</span>
            <span className="stat-value">{routeData.coordinates.length}</span>
            <span className="stat-label">Route Points</span>
          </div>
        )}
      </div>

      {/* Route Endpoints */}
      {(routeData.start || routeData.end) && (
        <div className="route-endpoints">
          {routeData.start && (
            <div className="endpoint">
              <span className="endpoint-icon">🚀</span>
              <div className="endpoint-info">
                <span className="endpoint-label">Start</span>
                <span className="endpoint-name">{routeData.start.name}</span>
              </div>
            </div>
          )}
          {routeData.end && (
            <div className="endpoint">
              <span className="endpoint-icon">🏁</span>
              <div className="endpoint-info">
                <span className="endpoint-label">End</span>
                <span className="endpoint-name">{routeData.end.name}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map Display */}
      <div className="route-map-container" style={{ height: `${height}px` }}>
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '0.5rem' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Daily Route Map"
          />
        ) : (
          <div className="map-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">🗺️</span>
              <h4>Route Legs Visualization</h4>
              <p>Google Maps integration requires API key configuration</p>
              {routeData.coordinates && (
                <p className="coordinates-info">
                  Route has {routeData.coordinates.length} coordinate points
                </p>
              )}
              {routeLegs.length > 0 && (
                <div className="route-info">
                  <p><strong>Route Summary:</strong></p>
                  <p>📏 {formatDistance(routeData.totalKm)} • ⏱️ {formatDuration(routeData.totalMin)}</p>
                  <p>🛣️ {routeLegs.length} legs from {routeLegs[0]?.from.name} to {routeLegs[routeLegs.length - 1]?.to.name}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Route Actions */}
      <div className="route-actions">
        <button 
          onClick={loadRouteData} 
          className="refresh-route-button"
          disabled={loading}
        >
          🔄 Refresh Route
        </button>
        {routeData.start && routeData.end && (
          <a
            href={`https://www.google.com/maps/dir/${routeData.start.lat},${routeData.start.lon}/${routeData.end.lat},${routeData.end.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="open-maps-button"
          >
            🌐 Open in Google Maps
          </a>
        )}
      </div>
    </div>
  );
};

export default DailyRouteMap;
