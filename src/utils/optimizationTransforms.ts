import {
  DayWithStops,
  Stop,
  OptimizationRequest,
  OptimizationLocation,
  OptimizationOptions,
  OptimizationResponse,
  OptimizedLocation,
  OptimizationError,
  ErrorDisplay
} from '../types/optimization';

/**
 * Transform day with stops to optimization request format
 */
export function transformDayToOptimizationRequest(
  day: DayWithStops,
  options: OptimizationOptions = {}
): OptimizationRequest {
  // Sort stops by sequence number
  const sortedStops = [...day.stops].sort((a, b) => a.seq - b.seq);

  // Transform stops to optimization locations
  const locations: OptimizationLocation[] = sortedStops.map((stop) => {
    // Map stop kind to optimization type
    let type: 'START' | 'STOP' | 'END';
    switch (stop.kind) {
      case 'start':
        type = 'START';
        break;
      case 'end':
        type = 'END';
        break;
      case 'via':
      default:
        type = 'STOP';
        break;
    }

    // Convert coordinates (lon → lng)
    const location: OptimizationLocation = {
      id: stop.id,
      type,
      name: stop.place.name,
      lat: stop.place.lat,
      lng: stop.place.lon, // Convert lon to lng
      fixed_seq: stop.fixed || stop.kind === 'start' || stop.kind === 'end',
    };

    // Add sequence number for fixed stops
    if (location.fixed_seq) {
      location.seq = stop.seq;
    }

    return location;
  });

  // Try a simpler format similar to route-breakdown endpoint
  // Separate start, via stops, and end
  const startStop = sortedStops.find(stop => stop.kind === 'start');
  const endStop = sortedStops.find(stop => stop.kind === 'end');
  const viaStops = sortedStops.filter(stop => stop.kind === 'via');

  if (!startStop || !endStop) {
    throw new Error('Start and end stops are required for optimization');
  }

  // Build request similar to route-breakdown format
  const request = {
    trip_id: day.trip_id,
    day_id: day.id,
    start: {
      lat: startStop.place.lat,
      lng: startStop.place.lon, // Use lng for API
      name: startStop.place.name,
    },
    stops: viaStops.map(stop => ({
      lat: stop.place.lat,
      lng: stop.place.lon, // Use lng for API
      name: stop.place.name,
    })),
    end: {
      lat: endStop.place.lat,
      lng: endStop.place.lon, // Use lng for API
      name: endStop.place.name,
    },
    objective: options.objective || 'time',
    vehicle_profile: options.vehicleProfile || 'car',
    units: 'metric',
  };

  // Add optional fields only if provided
  if (options.avoid && options.avoid.length > 0) {
    request.avoid = options.avoid;
  }

  if (options.prompt && options.prompt.trim()) {
    request.prompt = options.prompt.trim();
  }

  return request;
}

/**
 * Transform optimization result back to stops array
 */
export function transformOptimizationResult(
  result: OptimizationResponse,
  originalStops: Stop[]
): Stop[] {
  // Create a map of original stops by ID for quick lookup
  const stopMap = new Map<string, Stop>();
  originalStops.forEach(stop => stopMap.set(stop.id, stop));

  // Transform optimized locations back to stops
  const optimizedStops: Stop[] = result.ordered.map((location, index) => {
    const originalStop = stopMap.get(location.id);
    if (!originalStop) {
      throw new Error(`Original stop not found for ID: ${location.id}`);
    }

    // Create new stop with updated sequence
    return {
      ...originalStop,
      seq: index + 1, // Update sequence based on optimization order
    };
  });

  return optimizedStops;
}

/**
 * Process optimization error into user-friendly format
 */
export function processOptimizationError(error: any): ErrorDisplay {
  const errorDisplay: ErrorDisplay = {
    validationErrors: [],
    routingErrors: [],
    systemErrors: [],
    suggestions: [],
  };

  if (error.response?.data?.errors) {
    // API error response
    const apiError = error.response.data as OptimizationError;
    
    apiError.errors.forEach(err => {
      switch (err.code) {
        case 'MULTIPLE_START':
          errorDisplay.validationErrors.push('Multiple start locations found. Only one start location is allowed.');
          errorDisplay.suggestions.push('Check that only one stop is marked as "start" type.');
          break;
        case 'MISSING_END':
          errorDisplay.validationErrors.push('No end location provided.');
          errorDisplay.suggestions.push('Ensure at least one stop is marked as "end" type.');
          break;
        case 'FIXED_CONFLICT':
          errorDisplay.validationErrors.push('Conflicting fixed sequences detected.');
          errorDisplay.suggestions.push('Review fixed stop sequences for conflicts.');
          break;
        case 'DISCONNECTED_GRAPH':
          errorDisplay.routingErrors.push('Some locations cannot be reached by road.');
          errorDisplay.suggestions.push('Check that all locations are accessible by the selected vehicle type.');
          break;
        case 'INSUFFICIENT_LOCATIONS':
          errorDisplay.validationErrors.push('At least 3 locations are required for optimization.');
          errorDisplay.suggestions.push('Add more stops to enable route optimization.');
          break;
        default:
          errorDisplay.systemErrors.push(err.message || 'Unknown optimization error');
      }
    });
  } else if (error.response?.status === 422) {
    // Unprocessable entity
    errorDisplay.routingErrors.push('Unable to calculate routes between some locations.');
    errorDisplay.suggestions.push('Verify that all locations are valid and accessible.');
  } else if (error.response?.status === 400) {
    // Bad request
    errorDisplay.validationErrors.push('Invalid optimization request format.');
    errorDisplay.suggestions.push('Please try again or contact support if the issue persists.');
  } else if (error.response?.status >= 500) {
    // Server error
    errorDisplay.systemErrors.push('Optimization service is temporarily unavailable.');
    errorDisplay.suggestions.push('Please try again in a few moments.');
  } else if (error.code === 'NETWORK_ERROR' || !error.response) {
    // Network error
    errorDisplay.systemErrors.push('Unable to connect to optimization service.');
    errorDisplay.suggestions.push('Check your internet connection and try again.');
  } else {
    // Generic error
    errorDisplay.systemErrors.push(error.message || 'An unexpected error occurred during optimization.');
    errorDisplay.suggestions.push('Please try again or contact support if the issue persists.');
  }

  return errorDisplay;
}

/**
 * Validate day data before optimization
 */
export function validateDayForOptimization(day: DayWithStops): string[] {
  const errors: string[] = [];

  // Check minimum stops
  if (day.stops.length < 3) {
    errors.push('At least 3 stops are required for route optimization.');
  }

  // Check for start stop
  const startStops = day.stops.filter(stop => stop.kind === 'start');
  if (startStops.length === 0) {
    errors.push('A start location is required.');
  } else if (startStops.length > 1) {
    errors.push('Only one start location is allowed.');
  }

  // Check for end stop
  const endStops = day.stops.filter(stop => stop.kind === 'end');
  if (endStops.length === 0) {
    errors.push('An end location is required.');
  } else if (endStops.length > 1) {
    errors.push('Only one end location is allowed.');
  }

  // Check for valid coordinates
  day.stops.forEach((stop, index) => {
    if (!stop.place.lat || !stop.place.lon) {
      errors.push(`Stop ${index + 1} (${stop.place.name}) is missing coordinates.`);
    }
    if (Math.abs(stop.place.lat) > 90) {
      errors.push(`Stop ${index + 1} (${stop.place.name}) has invalid latitude.`);
    }
    if (Math.abs(stop.place.lon) > 180) {
      errors.push(`Stop ${index + 1} (${stop.place.name}) has invalid longitude.`);
    }
  });

  return errors;
}

/**
 * Calculate optimization savings
 */
export function calculateOptimizationSavings(
  originalDistance: number,
  originalDuration: number,
  optimizedDistance: number,
  optimizedDuration: number
) {
  return {
    distanceSaved: Math.max(0, originalDistance - optimizedDistance),
    timeSaved: Math.max(0, originalDuration - optimizedDuration),
    distanceSavedPercent: originalDistance > 0 ? ((originalDistance - optimizedDistance) / originalDistance) * 100 : 0,
    timeSavedPercent: originalDuration > 0 ? ((originalDuration - optimizedDuration) / originalDuration) * 100 : 0,
  };
}
