import React, { useState, useEffect } from 'react';
import { tripsService } from '../services/auth';

const TripOverviewMap = ({ tripId, dayIds, height = 600, interactive = true }) => {
  const [routeData, setRouteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleDays, setVisibleDays] = useState({});
  const [highlightedDay, setHighlightedDay] = useState(null);
  const [error, setError] = useState(null);

  // Day colors for visual distinction
  const dayColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  useEffect(() => {
    if (tripId && dayIds && dayIds.length > 0) {
      loadTripRoutes();
    }
  }, [tripId, dayIds]);

  const loadTripRoutes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (dayIds.length === 0) {
        setRouteData([]);
        return;
      }

      // Load route summaries for all days
      const bulkResponse = await tripsService.getBulkRouteSummaries(dayIds);
      
      console.log('🔍 TRIP OVERVIEW MAP DEBUG:');
      console.log('  bulkResponse:', bulkResponse);
      console.log('  bulkResponse.summaries:', bulkResponse.summaries);
      console.log('  Is summaries an array?', Array.isArray(bulkResponse.summaries));

      if (bulkResponse.success && bulkResponse.summaries && Array.isArray(bulkResponse.summaries)) {
        // Convert to route data format
        const routes = bulkResponse.summaries
          .filter(summary => summary.route_coordinates && summary.route_coordinates.length > 0)
          .map((summary, index) => ({
            id: summary.day_id,
            daySeq: index + 1,
            coordinates: summary.route_coordinates,
            color: dayColors[index % dayColors.length],
            totalKm: summary.route_total_km,
            totalMin: summary.route_total_min,
            start: summary.start,
            end: summary.end,
            stops: [
              ...(summary.start ? [summary.start] : []),
              ...(summary.end ? [summary.end] : [])
            ]
          }));

        setRouteData(routes);
        
        // Initialize all days as visible
        const initialVisibility = {};
        routes.forEach(route => {
          initialVisibility[route.id] = true;
        });
        setVisibleDays(initialVisibility);
      } else {
        setError(bulkResponse.error || 'Failed to load route data');
      }
    } catch (err) {
      setError('Failed to load trip routes');
      console.error('Trip routes loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDayVisibility = (dayId) => {
    setVisibleDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
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

  const getTripTotals = () => {
    const visibleRoutes = routeData.filter(route => visibleDays[route.id]);
    const totalKm = visibleRoutes.reduce((sum, route) => sum + (route.totalKm || 0), 0);
    const totalMin = visibleRoutes.reduce((sum, route) => sum + (route.totalMin || 0), 0);
    
    return {
      totalKm: formatDistance(totalKm),
      totalMin: formatDuration(totalMin),
      visibleDays: visibleRoutes.length,
      totalDays: routeData.length
    };
  };

  if (loading) {
    return (
      <div className="trip-overview-map">
        <div className="trip-map-loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading trip routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-overview-map">
        <div className="trip-map-error">
          <p>📍 {error}</p>
          <button onClick={loadTripRoutes} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const totals = getTripTotals();

  return (
    <div className="trip-overview-map">
      {/* Trip Summary */}
      <div className="trip-summary-header">
        <h3 className="trip-map-title">🗺️ Trip Overview</h3>
        <div className="trip-totals">
          <span className="total-item">
            📏 {totals.totalKm}
          </span>
          <span className="total-item">
            ⏱️ {totals.totalMin}
          </span>
          <span className="total-item">
            📊 {totals.visibleDays}/{totals.totalDays} Days
          </span>
        </div>
      </div>

      {/* Day Controls */}
      {routeData.length > 1 && (
        <div className="day-controls">
          <h4 className="controls-title">Day Visibility</h4>
          <div className="day-toggles">
            {routeData.map((route, index) => (
              <button
                key={route.id}
                onClick={() => toggleDayVisibility(route.id)}
                onMouseEnter={() => setHighlightedDay(route.id)}
                onMouseLeave={() => setHighlightedDay(null)}
                className={`day-toggle ${visibleDays[route.id] ? 'visible' : 'hidden'} ${
                  highlightedDay === route.id ? 'highlighted' : ''
                }`}
              >
                <div 
                  className="day-color-indicator"
                  style={{ backgroundColor: route.color }}
                />
                <span className="day-label">Day {route.daySeq}</span>
                <div className="day-stats">
                  <span>{formatDistance(route.totalKm)}</span>
                  <span>{formatDuration(route.totalMin)}</span>
                </div>
                <input
                  type="checkbox"
                  checked={visibleDays[route.id] ?? true}
                  onChange={() => toggleDayVisibility(route.id)}
                  className="day-checkbox"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="trip-map-container" style={{ height: `${height}px` }}>
        {routeData.length > 0 ? (
          <div className="map-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">🗺️</span>
              <h4>Trip Route Visualization</h4>
              <p>Interactive map will be available when mapping library is configured</p>
              <div className="route-summary">
                <p><strong>Available Routes:</strong></p>
                <ul>
                  {routeData.map((route, index) => (
                    <li key={route.id} style={{ color: route.color }}>
                      <strong>Day {route.daySeq}:</strong> {formatDistance(route.totalKm)}, {formatDuration(route.totalMin)}
                      {route.coordinates && ` (${route.coordinates.length} points)`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="map-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">📍</span>
              <p>No route data available for this trip</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      {routeData.length > 0 && (
        <div className="map-legend">
          <div className="legend-content">
            <span className="legend-title">
              {routeData.length} {routeData.length === 1 ? 'Day' : 'Days'} • 
              {routeData.filter(r => visibleDays[r.id]).length} Visible
            </span>
            <div className="legend-items">
              <span className="legend-item">🚀 Optimized Routes</span>
              <span className="legend-item">📍 Start/End Points</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="trip-map-actions">
        <button 
          onClick={loadTripRoutes} 
          className="refresh-trip-button"
          disabled={loading}
        >
          🔄 Refresh Routes
        </button>
        {routeData.length > 0 && (
          <button
            onClick={() => {
              const allVisible = Object.values(visibleDays).every(v => v);
              const newVisibility = {};
              routeData.forEach(route => {
                newVisibility[route.id] = !allVisible;
              });
              setVisibleDays(newVisibility);
            }}
            className="toggle-all-button"
          >
            {Object.values(visibleDays).every(v => v) ? '👁️‍🗨️ Hide All' : '👁️ Show All'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TripOverviewMap;
