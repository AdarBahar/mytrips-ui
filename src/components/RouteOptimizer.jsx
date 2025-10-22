import React, { useState } from 'react';
import { useRouteOptimization, useOptimizationOptions } from '../hooks/useRouteOptimization';
import { transformOptimizationResult, calculateOptimizationSavings } from '../utils/optimizationTransforms';
import OptimizationTrigger from './OptimizationTrigger';
import OptimizationOptions from './OptimizationOptions';
import OptimizationProgress from './OptimizationProgress';
import OptimizationResults from './OptimizationResults';
import ErrorDisplay from './ErrorDisplay';

const RouteOptimizer = ({ day, onOptimizationAccepted, onOptimizationRejected }) => {
  const { optimizeRoute, isLoading, result, error, clearResult } = useRouteOptimization();
  const { options, updateOption, resetOptions } = useOptimizationOptions();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Check if optimization is possible
  const canOptimize = day.stops.length >= 3 && !isLoading;
  const hasViaStops = day.stops.some(stop => stop.kind === 'via');

  const handleOptimize = async () => {
    await optimizeRoute(day, options);
  };

  const handleAcceptOptimization = async () => {
    if (!result) return;

    try {
      // Transform optimization result back to stops
      const optimizedStops = transformOptimizationResult(result, day.stops);
      
      // Call parent handler to update the backend
      await onOptimizationAccepted(optimizedStops);
      
      // Clear results
      clearResult();
    } catch (err) {
      console.error('Failed to apply optimization:', err);
      // Could show error notification here
    }
  };

  const handleRejectOptimization = () => {
    clearResult();
    onOptimizationRejected();
  };

  const handleRetry = () => {
    clearResult();
    handleOptimize();
  };

  return (
    <div className="route-optimizer">
      {/* Optimization Trigger */}
      <div className="optimizer-header">
        <OptimizationTrigger
          onOptimize={handleOptimize}
          disabled={!canOptimize}
          isLoading={isLoading}
          stopCount={day.stops.length}
          hasViaStops={hasViaStops}
        />
        
        {canOptimize && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-advanced-btn"
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? '🔼' : '🔽'} Advanced Options
          </button>
        )}
      </div>

      {/* Advanced Options Panel */}
      {showAdvanced && canOptimize && (
        <OptimizationOptions
          options={options}
          onChange={updateOption}
          onReset={resetOptions}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <OptimizationProgress 
          stopCount={day.stops.length}
        />
      )}

      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={handleRetry}
          onDismiss={clearResult}
        />
      )}

      {/* Results Display */}
      {result && (
        <OptimizationResults
          original={day.stops}
          optimized={result}
          onAccept={handleAcceptOptimization}
          onReject={handleRejectOptimization}
        />
      )}
    </div>
  );
};

export default RouteOptimizer;
