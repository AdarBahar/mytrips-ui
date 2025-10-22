// Route Optimization Types
export interface OptimizationOptions {
  objective?: 'time' | 'distance';
  vehicleProfile?: 'car' | 'bike' | 'foot';
  avoid?: ('tolls' | 'ferries' | 'highways')[];
  prompt?: string;
}

export interface OptimizationLocation {
  id: string;
  type: 'START' | 'STOP' | 'END';
  name: string;
  lat: number;
  lng: number; // API uses "lng"
  fixed_seq: boolean;
  seq?: number; // Required if fixed_seq=true for STOP
}

export interface OptimizationRequest {
  prompt?: string;
  meta: {
    version: '1.0';
    objective: 'time' | 'distance';
    vehicle_profile: 'car' | 'bike' | 'foot';
    units: 'metric' | 'imperial';
    avoid?: ('tolls' | 'ferries' | 'highways')[];
  };
  data: {
    locations: OptimizationLocation[];
  };
}

export interface OptimizedLocation {
  id: string;
  type: 'START' | 'STOP' | 'END';
  name: string;
  lat: number;
  lng: number;
  seq: number;
  distance_from_prev_km?: number;
  duration_from_prev_min?: number;
}

export interface OptimizationResponse {
  version: string;
  objective: string;
  units: string;
  ordered: OptimizedLocation[];
  summary: {
    stop_count: number;
    total_distance_km: number;
    total_duration_min: number;
  };
  geometry: {
    format: 'geojson';
    route: {
      type: 'LineString';
      coordinates: [number, number][]; // [lng, lat]
    };
    bounds: {
      min_lat: number;
      min_lng: number;
      max_lat: number;
      max_lng: number;
    };
  };
  diagnostics: {
    warnings: string[];
    assumptions: string[];
    computation_notes: string[];
  };
}

export interface OptimizationError {
  version: string;
  errors: Array<{
    code: string;
    message: string;
  }>;
}

export interface ErrorDisplay {
  validationErrors: string[];
  routingErrors: string[];
  systemErrors: string[];
  suggestions: string[];
}

// Existing types from the app
export interface Stop {
  id: string;
  place_id: string;
  seq: number;
  kind: 'start' | 'via' | 'end';
  fixed: boolean;
  place: {
    id: string;
    name: string;
    address?: string;
    lat: number;
    lon: number; // Backend uses "lon"
  };
}

export interface DayWithStops {
  id: string;
  trip_id: string;
  seq: number;
  stops: Stop[];
}

export interface UseRouteOptimizationResult {
  optimizeRoute: (day: DayWithStops, options?: OptimizationOptions) => Promise<void>;
  isLoading: boolean;
  result: OptimizationResponse | null;
  error: ErrorDisplay | null;
  clearResult: () => void;
}
