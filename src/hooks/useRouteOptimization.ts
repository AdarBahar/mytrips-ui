import { useState, useCallback } from 'react';
import { debugLogger } from '../config/debug';
import {
  DayWithStops,
  OptimizationOptions,
  OptimizationResponse,
  ErrorDisplay,
  UseRouteOptimizationResult,
} from '../types/optimization';
import {
  transformDayToOptimizationRequest,
  processOptimizationError,
  validateDayForOptimization,
} from '../utils/optimizationTransforms';

/**
 * Hook for route optimization functionality
 */
export function useRouteOptimization(): UseRouteOptimizationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [error, setError] = useState<ErrorDisplay | null>(null);

  const optimizeRoute = useCallback(async (
    day: DayWithStops,
    options: OptimizationOptions = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      debugLogger.api('OPTIMIZATION', 'Starting route optimization', {
        dayId: day.id,
        stopCount: day.stops.length,
        options,
      });

      // Validate input data
      const validationErrors = validateDayForOptimization(day);
      if (validationErrors.length > 0) {
        const validationError: ErrorDisplay = {
          validationErrors,
          routingErrors: [],
          systemErrors: [],
          suggestions: ['Please fix the validation errors and try again.'],
        };
        setError(validationError);
        return;
      }

      // Transform day data to optimization request
      const optimizationRequest = transformDayToOptimizationRequest(day, options);

      debugLogger.api('OPTIMIZATION', 'Sending optimization request', {
        request: optimizationRequest,
      });

      // Add detailed console logging for debugging
      console.log('🎯 ROUTE OPTIMIZATION REQUEST:');
      console.log('  URL: POST /routing/optimize');
      console.log('  Request Body:', JSON.stringify(optimizationRequest, null, 2));
      console.log('  Request Size:', JSON.stringify(optimizationRequest).length, 'bytes');

      // Get auth token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required for route optimization');
      }

      // Make API request
      const response = await fetch('https://mytrips-api.bahar.co.il/routing/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(optimizationRequest),
      });

      debugLogger.api('OPTIMIZATION', `Response received: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
      });

      console.log('🎯 ROUTE OPTIMIZATION RESPONSE:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Handle error responses
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        console.log('🎯 ROUTE OPTIMIZATION ERROR:');
        console.log('  Status:', response.status);
        console.log('  Status Text:', response.statusText);
        console.log('  Error Data:', JSON.stringify(errorData, null, 2));

        debugLogger.api('OPTIMIZATION', 'Optimization failed', {
          status: response.status,
          error: errorData,
        });

        throw {
          response: {
            status: response.status,
            data: errorData,
          },
        };
      }

      // Parse successful response
      const optimizationResult: OptimizationResponse = await response.json();

      debugLogger.api('OPTIMIZATION', 'Optimization successful', {
        result: optimizationResult,
        savings: {
          distance: optimizationResult.summary.total_distance_km,
          duration: optimizationResult.summary.total_duration_min,
          stopCount: optimizationResult.summary.stop_count,
        },
      });

      setResult(optimizationResult);

    } catch (err) {
      debugLogger.error('OPTIMIZATION', 'Route optimization error', err);
      
      const errorDisplay = processOptimizationError(err);
      setError(errorDisplay);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    optimizeRoute,
    isLoading,
    result,
    error,
    clearResult,
  };
}

/**
 * Hook for optimization options management
 */
export function useOptimizationOptions() {
  const [options, setOptions] = useState<OptimizationOptions>({
    objective: 'time',
    vehicleProfile: 'car',
    avoid: [],
  });

  const updateOption = useCallback(<K extends keyof OptimizationOptions>(
    key: K,
    value: OptimizationOptions[K]
  ) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetOptions = useCallback(() => {
    setOptions({
      objective: 'time',
      vehicleProfile: 'car',
      avoid: [],
    });
  }, []);

  return {
    options,
    updateOption,
    resetOptions,
    setOptions,
  };
}
