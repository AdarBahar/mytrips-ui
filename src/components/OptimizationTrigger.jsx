import React from 'react';

const OptimizationTrigger = ({ 
  onOptimize, 
  disabled, 
  isLoading, 
  stopCount, 
  hasViaStops 
}) => {
  const getTooltipText = () => {
    if (stopCount < 3) {
      return 'At least 3 stops are required for route optimization';
    }
    if (!hasViaStops) {
      return 'Add via stops between start and end to enable optimization';
    }
    if (isLoading) {
      return 'Optimization in progress...';
    }
    return 'Reorder stops for minimum travel time using advanced routing algorithms';
  };

  const getButtonText = () => {
    if (isLoading) {
      return (
        <>
          <span className="loading-spinner">⏳</span>
          Optimizing Route...
        </>
      );
    }
    return (
      <>
        <span className="route-icon">🛣️</span>
        Optimize Route
      </>
    );
  };

  return (
    <div className="optimization-trigger">
      <button
        type="button"
        onClick={onOptimize}
        disabled={disabled}
        className={`optimize-btn ${disabled ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
        title={getTooltipText()}
        aria-label={getTooltipText()}
      >
        {getButtonText()}
      </button>
      
      {stopCount < 3 && (
        <div className="optimization-hint">
          <span className="hint-icon">💡</span>
          <span className="hint-text">
            Add {3 - stopCount} more stop{3 - stopCount !== 1 ? 's' : ''} to enable route optimization
          </span>
        </div>
      )}
      
      {stopCount >= 3 && !hasViaStops && (
        <div className="optimization-hint">
          <span className="hint-icon">💡</span>
          <span className="hint-text">
            Add via stops between start and end to optimize the route
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizationTrigger;
