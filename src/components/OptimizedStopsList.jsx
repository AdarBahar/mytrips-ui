import React, { useState, useEffect, useMemo } from 'react';
import { tripsService } from '../services/auth';

// Configuration flag to disable optimization if API is not working
const ENABLE_ROUTE_OPTIMIZATION = true; // Set to true for debugging

const OptimizedStopsList = ({ tripId, dayId, stops, showOptimizedOrder = true, onOrderChange }) => {
  const [optimizedStops, setOptimizedStops] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useOptimizedOrder, setUseOptimizedOrder] = useState(showOptimizedOrder);
  const [error, setError] = useState(null);

  // Load optimized stop order when component mounts or when stops change
  useEffect(() => {
    if (useOptimizedOrder && stops && stops.length >= 3 && tripId && dayId) {
      loadOptimizedOrder();
    }
  }, [tripId, dayId, stops, useOptimizedOrder]);

  const loadOptimizedOrder = async () => {
    // Check if optimization is disabled
    if (!ENABLE_ROUTE_OPTIMIZATION) {
      console.log('🚫 Route optimization disabled - using manual order');
      setOptimizedStops(stops || []);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await tripsService.getOptimizedStopOrder(tripId, dayId, stops);
      
      if (result.success) {
        setOptimizedStops(result.optimizedStops);
        console.log('🔄 Optimized stop order loaded:', {
          original: stops.length,
          optimized: result.optimizedStops.length
        });
      } else {
        setError(result.error);
        console.error('❌ Failed to load optimized order:', result.error);
        console.error('❌ Full error details:', result);

        // Log the actual server response for debugging
        if (result.responseData) {
          console.error('🔍 Server response data:', result.responseData);
          console.error('🔍 Server response JSON:', JSON.stringify(result.responseData, null, 2));
        }

        // For now, fall back to manual order if optimization fails
        setOptimizedStops(stops);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Optimized order loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute display order based on toggle
  const displayStops = useMemo(() => {
    if (!useOptimizedOrder || !optimizedStops || optimizedStops.length === 0) {
      // Use manual order (sorted by sequence)
      return [...(stops || [])].sort((a, b) => {
        const seqA = a.seq || 0;
        const seqB = b.seq || 0;
        return seqA - seqB;
      });
    }
    
    // Use optimized order
    return optimizedStops;
  }, [stops, optimizedStops, useOptimizedOrder]);

  // Add UI sequence numbers
  const stopsWithUISequence = useMemo(() => {
    return displayStops.map((stop, index) => ({
      ...stop,
      uiSequence: index + 1
    }));
  }, [displayStops]);

  const handleToggleOrder = () => {
    const newValue = !useOptimizedOrder;
    setUseOptimizedOrder(newValue);
    
    // Notify parent component of order change
    if (onOrderChange) {
      onOrderChange(newValue ? optimizedStops : stops);
    }
  };

  const getStopIcon = (kind) => {
    switch (kind) {
      case 'start': return '🚀';
      case 'end': return '🏁';
      case 'via': return '📍';
      default: return '❓';
    }
  };

  const getStopLabel = (kind) => {
    switch (kind) {
      case 'start': return 'Start';
      case 'end': return 'End';
      case 'via': return 'Stop';
      default: return 'Unknown';
    }
  };

  const getStopKindClass = (kind) => {
    switch (kind) {
      case 'start': return 'stop-kind-start';
      case 'end': return 'stop-kind-end';
      case 'via': return 'stop-kind-via';
      default: return 'stop-kind-unknown';
    }
  };

  if (!stops || stops.length === 0) {
    return (
      <div className="optimized-stops-list">
        <div className="no-stops">
          <p>No stops planned for this day</p>
        </div>
      </div>
    );
  }

  return (
    <div className="optimized-stops-list">
      {/* Order Toggle */}
      <div className="stops-header">
        <h3 className="stops-title">Stops</h3>
        {stops.length >= 3 && (
          <div className="order-toggle">
            <span className={`toggle-label ${!useOptimizedOrder ? 'active' : ''}`}>
              Manual Order
            </span>
            <button
              onClick={handleToggleOrder}
              disabled={loading || !ENABLE_ROUTE_OPTIMIZATION}
              className={`toggle-switch ${useOptimizedOrder ? 'enabled' : 'disabled'} ${!ENABLE_ROUTE_OPTIMIZATION ? 'api-disabled' : ''}`}
              title={!ENABLE_ROUTE_OPTIMIZATION ? 'Route optimization temporarily disabled' : (useOptimizedOrder ? 'Switch to manual order' : 'Switch to optimized order')}
            >
              <span className="toggle-slider" />
            </button>
            <span className={`toggle-label ${useOptimizedOrder ? 'active' : ''}`}>
              Optimized Order {!ENABLE_ROUTE_OPTIMIZATION && '(Disabled)'}
            </span>
            {loading && <span className="loading-indicator">⏳</span>}
          </div>
        )}
      </div>

      {/* API Disabled Notice */}
      {!ENABLE_ROUTE_OPTIMIZATION && (
        <div className="api-disabled-notice">
          <p>🔧 Route optimization is temporarily disabled due to API issues.</p>
          <p>Showing manual stop order based on sequence.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>⚠️ Could not load optimized order: {error}</p>
          <p>Showing manual order instead.</p>
        </div>
      )}

      {/* Optimization Info */}
      {useOptimizedOrder && optimizedStops && !loading && (
        <div className="optimization-info">
          <span className="optimization-badge">🚀 Optimized Route</span>
          {optimizedStops.length !== stops.length && (
            <span className="optimization-warning">
              ⚠️ Some stops may have been reordered
            </span>
          )}
        </div>
      )}

      {/* Stops List */}
      <div className="stops-list">
        {stopsWithUISequence.map((stop, index) => {
          const originalIndex = stops.findIndex(s => s.id === stop.id);
          const wasReordered = useOptimizedOrder && originalIndex !== -1 && originalIndex !== index;
          
          return (
            <div key={stop.id || index} className="stop-card">
              <div className="stop-header">
                <span className={`stop-kind ${getStopKindClass(stop.kind)}`}>
                  {getStopIcon(stop.kind)}
                </span>
                <span className="stop-sequence">#{stop.uiSequence}</span>
                <span className={`stop-kind-label ${getStopKindClass(stop.kind)}`}>
                  {getStopLabel(stop.kind)}
                </span>
                {wasReordered && (
                  <span className="reorder-indicator" title={`Moved from position ${originalIndex + 1}`}>
                    🔄
                  </span>
                )}
              </div>

              {stop.place && (
                <div className="place-info">
                  <h4 className="place-name">{stop.place.name}</h4>
                  {stop.place.address && (
                    <p className="place-address">📍 {stop.place.address}</p>
                  )}
                  {(stop.place.lat || stop.place.coordinates) && (
                    <p className="place-coordinates">
                      🗺️ {stop.place.lat || stop.place.coordinates?.lat}, {stop.place.lon || stop.place.coordinates?.lng}
                    </p>
                  )}
                </div>
              )}

              {stop.notes && (
                <div className="stop-notes">
                  <p>📝 {stop.notes}</p>
                </div>
              )}

              {wasReordered && (
                <div className="reorder-info">
                  <small>Moved from position {originalIndex + 1} → {index + 1}</small>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OptimizedStopsList;
