import React, { useState } from 'react';
import { transformOptimizationResult, calculateOptimizationSavings } from '../utils/optimizationTransforms';

const OptimizationResults = ({ original, optimized, onAccept, onReject }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Transform optimization result to stops for comparison
  const optimizedStops = transformOptimizationResult(optimized, original);

  // Calculate current route metrics (simplified - would need actual routing data)
  const originalDistance = original.length * 25; // Rough estimate
  const originalDuration = original.length * 30; // Rough estimate

  const savings = calculateOptimizationSavings(
    originalDistance,
    originalDuration,
    optimized.summary.total_distance_km,
    optimized.summary.total_duration_min
  );

  const formatDistance = (km) => `${Math.round(km)} km`;
  const formatDuration = (min) => {
    const hours = Math.floor(min / 60);
    const minutes = Math.round(min % 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  const getStopIcon = (kind) => {
    switch (kind) {
      case 'start': return '🏁';
      case 'end': return '🏁';
      case 'via': return '📍';
      default: return '📍';
    }
  };

  const getChangeIndicator = (originalIndex, newIndex) => {
    if (originalIndex === newIndex) return null;
    return originalIndex < newIndex ? '⬇️' : '⬆️';
  };

  return (
    <div className="optimization-results">
      <div className="results-header">
        <h4>✨ Route Optimization Complete</h4>
        <div className="results-summary">
          <div className="summary-metric">
            <span className="metric-icon">📏</span>
            <span className="metric-value">{formatDistance(optimized.summary.total_distance_km)}</span>
            <span className="metric-label">Total Distance</span>
          </div>
          <div className="summary-metric">
            <span className="metric-icon">⏱️</span>
            <span className="metric-value">{formatDuration(optimized.summary.total_duration_min)}</span>
            <span className="metric-label">Total Time</span>
          </div>
          <div className="summary-metric">
            <span className="metric-icon">🎯</span>
            <span className="metric-value">{optimized.summary.stop_count}</span>
            <span className="metric-label">Stops</span>
          </div>
        </div>
      </div>

      {/* Savings Display */}
      {(savings.timeSaved > 0 || savings.distanceSaved > 0) && (
        <div className="savings-display">
          <div className="savings-header">
            <span className="savings-icon">💰</span>
            <span className="savings-title">Estimated Savings</span>
          </div>
          <div className="savings-metrics">
            {savings.timeSaved > 0 && (
              <div className="savings-item">
                <span className="savings-value">-{formatDuration(savings.timeSaved)}</span>
                <span className="savings-label">Time Saved</span>
                <span className="savings-percent">({savings.timeSavedPercent.toFixed(1)}%)</span>
              </div>
            )}
            {savings.distanceSaved > 0 && (
              <div className="savings-item">
                <span className="savings-value">-{formatDistance(savings.distanceSaved)}</span>
                <span className="savings-label">Distance Saved</span>
                <span className="savings-percent">({savings.distanceSavedPercent.toFixed(1)}%)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Comparison */}
      <div className="route-comparison">
        <div className="comparison-header">
          <h5>📋 Route Comparison</h5>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="toggle-details-btn"
          >
            {showDetails ? '🔼 Less Details' : '🔽 More Details'}
          </button>
        </div>

        <div className="comparison-columns">
          {/* Original Route */}
          <div className="route-column">
            <div className="column-header">
              <span className="column-title">Current Order</span>
              <span className="column-subtitle">{original.length} stops</span>
            </div>
            <div className="stops-list">
              {original.map((stop, index) => (
                <div key={stop.id} className="stop-item original">
                  <div className="stop-number">{index + 1}</div>
                  <div className="stop-icon">{getStopIcon(stop.kind)}</div>
                  <div className="stop-info">
                    <div className="stop-name">{stop.place.name}</div>
                    {showDetails && stop.place.address && (
                      <div className="stop-address">{stop.place.address}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimized Route */}
          <div className="route-column">
            <div className="column-header">
              <span className="column-title">Optimized Order</span>
              <span className="column-subtitle">{optimizedStops.length} stops</span>
            </div>
            <div className="stops-list">
              {optimizedStops.map((stop, newIndex) => {
                const originalIndex = original.findIndex(orig => orig.id === stop.id);
                const changeIndicator = getChangeIndicator(originalIndex, newIndex);
                
                return (
                  <div key={stop.id} className={`stop-item optimized ${changeIndicator ? 'changed' : 'unchanged'}`}>
                    <div className="stop-number">{newIndex + 1}</div>
                    <div className="stop-icon">{getStopIcon(stop.kind)}</div>
                    <div className="stop-info">
                      <div className="stop-name">{stop.place.name}</div>
                      {showDetails && stop.place.address && (
                        <div className="stop-address">{stop.place.address}</div>
                      )}
                    </div>
                    {changeIndicator && (
                      <div className="change-indicator" title={`Moved from position ${originalIndex + 1}`}>
                        {changeIndicator}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      {showDetails && optimized.diagnostics && (
        <div className="optimization-diagnostics">
          <h5>🔍 Optimization Details</h5>
          
          {optimized.diagnostics.warnings?.length > 0 && (
            <div className="diagnostic-section">
              <h6>⚠️ Warnings</h6>
              <ul>
                {optimized.diagnostics.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {optimized.diagnostics.assumptions?.length > 0 && (
            <div className="diagnostic-section">
              <h6>💭 Assumptions</h6>
              <ul>
                {optimized.diagnostics.assumptions.map((assumption, index) => (
                  <li key={index}>{assumption}</li>
                ))}
              </ul>
            </div>
          )}

          {optimized.diagnostics.computation_notes?.length > 0 && (
            <div className="diagnostic-section">
              <h6>📝 Computation Notes</h6>
              <ul>
                {optimized.diagnostics.computation_notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="results-actions">
        <button
          type="button"
          onClick={onAccept}
          className="accept-btn"
        >
          ✅ Accept Optimization
        </button>
        <button
          type="button"
          onClick={onReject}
          className="reject-btn"
        >
          ❌ Keep Original Order
        </button>
      </div>
    </div>
  );
};

export default OptimizationResults;
