import api from './api';
import { debugLogger } from '../config/debug';

// Authentication service functions
export const authService = {
  // Login user with email and password
  async login(email, password) {
    debugLogger.auth('Starting login process', { email });

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      debugLogger.auth('Login API response received', {
        status: response.status,
        hasToken: !!response.data.access_token
      });

      const { access_token } = response.data;

      if (access_token) {
        // Store token in localStorage
        localStorage.setItem('authToken', access_token);
        debugLogger.storage('SET', 'authToken', '***TOKEN***');
        debugLogger.auth('Login successful - token stored');

        return { success: true, token: access_token };
      } else {
        debugLogger.auth('Login failed - no access token in response');
        throw new Error('No access token received');
      }
    } catch (error) {
      debugLogger.error('AUTH', 'Login failed', {
        email,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      const errorMessage = error.response?.data?.error?.message ||
                          error.response?.data?.detail ||
                          error.message ||
                          'Login failed';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Get current user profile
  async getCurrentUser() {
    debugLogger.auth('Getting current user profile');

    try {
      const response = await api.get('/auth/me');
      debugLogger.auth('User profile retrieved successfully', {
        userId: response.data.id,
        email: response.data.email
      });

      return { success: true, user: response.data };
    } catch (error) {
      debugLogger.error('AUTH', 'Failed to get user profile', error);

      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to get user info',
      };
    }
  },

  // Logout user
  logout() {
    debugLogger.auth('Logging out user');
    debugLogger.storage('REMOVE', 'authToken');
    debugLogger.storage('REMOVE', 'userEmail');
    debugLogger.storage('REMOVE', 'userPassword');
    debugLogger.storage('REMOVE', 'rememberMe');

    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('rememberMe');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Store remember me credentials (simple storage - in production use encryption)
  storeRememberMe(email, password) {
    debugLogger.auth('Storing remember me credentials', { email });
    debugLogger.storage('SET', 'userEmail', email);
    debugLogger.storage('SET', 'userPassword', '***PASSWORD***');
    debugLogger.storage('SET', 'rememberMe', 'true');

    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);
    localStorage.setItem('rememberMe', 'true');
  },

  // Get remember me credentials
  getRememberMeCredentials() {
    const rememberMe = localStorage.getItem('rememberMe');
    debugLogger.auth('Checking remember me credentials', { rememberMe });

    if (rememberMe === 'true') {
      const credentials = {
        email: localStorage.getItem('userEmail'),
        password: localStorage.getItem('userPassword'),
      };
      debugLogger.auth('Remember me credentials found', {
        email: credentials.email,
        hasPassword: !!credentials.password
      });
      return credentials;
    }

    debugLogger.auth('No remember me credentials found');
    return null;
  },

  // Clear remember me credentials
  clearRememberMe() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('rememberMe');
  },
};

// Trips service functions
export const tripsService = {
  // Get user trips with proper parameters
  async getTrips(userId = null) {
    try {
      debugLogger.api('Getting trips', { userId });

      // If no userId provided, get current user info first
      if (!userId) {
        const userResult = await authService.getCurrentUser();
        if (!userResult.success) {
          debugLogger.error('Failed to get current user for trips request', userResult.error);
          return { success: false, error: 'Failed to get user information' };
        }
        userId = userResult.user.id;
      }

      // Build the request with proper parameters as specified in the API docs
      const params = {
        owner: userId,
        page: 1,
        size: 50,
        sort_by: 'updated_at:desc',
        format: 'short'
      };

      debugLogger.api('Making trips request with params', params);

      const response = await api.get('/trips/', { params });

      debugLogger.api('Trips response received', {
        status: response.status,
        dataType: typeof response.data,
        hasData: !!response.data.data,
        hasTrips: !!response.data.trips,
        totalItems: response.data.meta?.total_items || response.data.total || 0
      });

      // Handle both modern and legacy response formats
      const trips = response.data.data || response.data.trips || [];
      const total = response.data.meta?.total_items || response.data.total || 0;

      debugLogger.api('Trips received with short format (sorted by updated_at)', {
        totalTrips: trips.length,
        firstTrip: trips[0]?.title || 'None',
        firstTripSlug: trips[0]?.slug || 'No slug',
        firstTripDays: trips[0]?.total_days || 0,
        firstTripStops: trips[0]?.days?.reduce((sum, day) => sum + (day.stops || 0), 0) || 0,
        mostRecentlyUpdated: trips[0]?.updated_at || trips[0]?.created_at || 'No date'
      });

      return {
        success: true,
        trips,
        total,
        meta: response.data.meta || null
      };
    } catch (error) {
      console.error('Get trips error:', error);
      debugLogger.error('Get trips failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        params: error.config?.params
      });

      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.detail || error.message || 'Failed to fetch trips'
      };
    }
  },

  // Update trip status
  async updateTripStatus(tripId, newStatus) {
    try {
      debugLogger.api('Updating trip status', { tripId, newStatus });

      console.log('🌐 API REQUEST - Update Trip Status:');
      console.log(`  URL: PATCH /trips/${tripId}`);
      console.log(`  Trip ID: ${tripId}`);
      console.log(`  New Status: ${newStatus}`);
      console.log(`  Request Body:`, { status: newStatus });

      const response = await api.patch(`/trips/${tripId}`, {
        status: newStatus
      });

      console.log('🌐 API RESPONSE - Update Trip Status:');
      console.log(`  Status: ${response.status}`);
      console.log(`  Response Data:`, response.data);

      debugLogger.api('Trip status updated successfully', {
        tripId,
        newStatus,
        response: response.data
      });

      return {
        success: true,
        trip: response.data
      };
    } catch (error) {
      console.error('Update trip status error:', error);
      debugLogger.error('Update trip status failed', {
        tripId,
        newStatus,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.detail || error.message || 'Failed to update trip status'
      };
    }
  },

  // Create new trip
  async createTrip(tripData) {
    try {
      debugLogger.api('Creating new trip', { tripData });

      const response = await api.post('/trips/', {
        title: tripData.title,
        destination: tripData.destination,
        start_date: tripData.start_date || null,
        end_date: tripData.end_date || null,
        description: tripData.description || '',
        status: 'draft' // New trips start as draft
      });

      debugLogger.api('Trip created successfully', {
        tripData,
        response: response.data
      });

      return {
        success: true,
        trip: response.data
      };
    } catch (error) {
      console.error('Create trip error:', error);
      debugLogger.error('Create trip failed', {
        tripData,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.detail || error.message || 'Failed to create trip'
      };
    }
  },

  // Get detailed stops for a specific day
  async getStopsForDay(tripId, dayId) {
    try {
      debugLogger.api('Getting stops for day', { tripId, dayId });

      const params = {
        include_place: true
      };

      console.log('🌐 API REQUEST - Day Stops:');
      console.log(`  URL: /stops/${tripId}/days/${dayId}/stops`);
      console.log(`  Params:`, params);

      const response = await api.get(`/stops/${tripId}/days/${dayId}/stops`, { params });
      const stopsData = response.data;

      console.log('🌐 API RESPONSE - Day Stops:');
      console.log(`  Status: ${response.status}`);
      console.log(`  Stops Count: ${stopsData.stops?.length || 0}`);
      console.log(`  Raw Data:`, JSON.stringify(stopsData, null, 2));

      // Sort stops by sequence
      if (stopsData.stops) {
        stopsData.stops.sort((a, b) => (a.seq || 0) - (b.seq || 0));

        console.log('📊 STOPS ANALYSIS:');
        stopsData.stops.forEach((stop, index) => {
          console.log(`  Stop ${index + 1}:`);
          console.log(`    - Sequence: ${stop.seq}`);
          console.log(`    - Kind: ${stop.kind}`);
          console.log(`    - Stop Type: ${stop.stop_type}`);
          console.log(`    - Place Name: ${stop.place?.name || 'No name'}`);
          console.log(`    - Coordinates: ${stop.place?.lat}, ${stop.place?.lon}`);
        });
      }

      debugLogger.api('Day stops received successfully', {
        dayId,
        stopsCount: stopsData.stops?.length || 0,
        stopKinds: stopsData.stops?.map(s => s.kind) || []
      });

      return {
        success: true,
        data: stopsData
      };
    } catch (error) {
      console.error('Get day stops error:', error);
      debugLogger.error('Failed to get day stops', {
        tripId,
        dayId,
        error: error.message,
        status: error.response?.status
      });

      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.detail || error.message || 'Failed to fetch day stops'
      };
    }
  },

  // Get complete trip details with days, stops, places, and route info
  async getTripComplete(tripId) {
    try {
      debugLogger.api('Getting complete trip details', { tripId });

      // Step 1: Get Complete Trip Data
      const params = {
        include_place: true,
        include_route_info: true
      };

      debugLogger.api('Step 1: Making complete trip request with params', params);
      console.log('🌐 API REQUEST - Complete Trip:');
      console.log(`  URL: /trips/${tripId}/complete`);
      console.log(`  Params:`, params);

      const response = await api.get(`/trips/${tripId}/complete`, { params });
      const tripData = response.data;

      console.log('🌐 API RESPONSE - Complete Trip:');
      console.log(`  Status: ${response.status}`);
      console.log(`  Headers:`, response.headers);
      console.log(`  Raw Data:`, JSON.stringify(tripData, null, 2));

      debugLogger.api('Step 1: Complete trip details received', {
        tripTitle: tripData.trip?.title || 'No title',
        totalDays: tripData.days?.length || 0,
        totalStops: tripData.days?.reduce((sum, day) => sum + (day.stops?.length || 0), 0) || 0,
        hasRouteInfo: !!tripData.days?.some(day => day.route_info)
      });

      // Step 2: Get Route Summaries for All Days (if days exist)
      if (tripData.days && tripData.days.length > 0) {
        try {
          const dayIds = tripData.days.map(day => day.id).filter(id => id); // Filter out undefined IDs

          if (dayIds.length > 0) {
            debugLogger.api('Step 2: Getting route summaries for days', { dayIds });

            console.log('🌐 API REQUEST - Route Summaries:');
            console.log(`  URL: /routing/days/bulk-active-summaries`);
            console.log(`  Method: POST`);
            console.log(`  Body:`, { day_ids: dayIds });

            const routeSummaryResponse = await api.post('/routing/days/bulk-active-summaries', {
              day_ids: dayIds
            });

            console.log('🌐 API RESPONSE - Route Summaries:');
            console.log(`  Status: ${routeSummaryResponse.status}`);
            console.log(`  Raw Data:`, JSON.stringify(routeSummaryResponse.data, null, 2));

            debugLogger.api('Step 2: Route summaries received', {
              summariesCount: Object.keys(routeSummaryResponse.data || {}).length,
              dayIds: dayIds
            });

            // Merge route summaries into trip data
            if (routeSummaryResponse.data) {
              console.log('🔄 MERGING ROUTE SUMMARIES:');
              tripData.days.forEach((day, index) => {
                console.log(`  Day ${index + 1} (ID: ${day.id}):`);
                if (day.id && routeSummaryResponse.data[day.id]) {
                  day.route_summary = routeSummaryResponse.data[day.id];
                  console.log(`    ✅ Route summary added:`, day.route_summary);
                } else {
                  console.log(`    ❌ No route summary found for day ID: ${day.id}`);
                }
              });
            } else {
              console.log('❌ No route summary data received');
            }
          } else {
            debugLogger.api('Step 2: No valid day IDs found, skipping route summaries');
          }
        } catch (routeError) {
          debugLogger.error('Step 2: Failed to get route summaries', {
            error: routeError.message,
            status: routeError.response?.status
          });
          // Continue without route summaries - not critical for basic trip display
        }
      } else {
        debugLogger.api('Step 2: No days found, skipping route summaries');
      }

      // Step 3: Get Detailed Stops for Each Day
      if (tripData.days && tripData.days.length > 0) {
        console.log('🌐 STEP 3: Getting detailed stops for each day');

        for (const day of tripData.days) {
          if (day.id) {
            try {
              console.log(`🔄 Getting stops for day ${day.id}...`);
              const stopsResult = await this.getStopsForDay(tripData.trip.id, day.id);

              if (stopsResult.success && stopsResult.data.stops) {
                // Replace the existing stops with detailed stops data
                day.stops = stopsResult.data.stops;
                console.log(`✅ Updated day ${day.id} with ${day.stops.length} detailed stops`);
              } else {
                console.log(`❌ Failed to get stops for day ${day.id}:`, stopsResult.error);
              }
            } catch (stopsError) {
              console.error(`❌ Error getting stops for day ${day.id}:`, stopsError);
              // Continue with existing stops data if available
            }
          } else {
            console.log(`⚠️ Skipping day without ID`);
          }
        }

        debugLogger.api('Step 3: Detailed stops loading completed');
      } else {
        debugLogger.api('Step 3: No days found, skipping detailed stops');
      }

      return {
        success: true,
        data: tripData
      };
    } catch (error) {
      console.error('Get complete trip error:', error);

      // Provide specific error messages based on status code
      let errorMessage = 'Failed to fetch trip details';
      if (error.response?.status === 404) {
        errorMessage = 'Complete endpoint not available - will use fallback method';
        debugLogger.api('Complete endpoint not found (404) - this is expected if endpoint is not implemented yet');
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied to trip details';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required';
      }

      debugLogger.error('Get complete trip failed', {
        tripId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        params: error.config?.params,
        willFallback: error.response?.status === 404
      });

      return {
        success: false,
        error: errorMessage,
        statusCode: error.response?.status
      };
    }
  },

  // Get detailed route breakdown for a specific day (optional, per day)
  async getRouteBreakdown(tripId, dayId, routeData) {
    try {
      debugLogger.api('Step 3: Getting detailed route breakdown', { tripId, dayId });

      const response = await api.post('/routing/days/route-breakdown', {
        trip_id: tripId,
        day_id: dayId,
        start: routeData.start,
        stops: routeData.stops,
        end: routeData.end,
        profile: routeData.profile || 'car'
      });

      debugLogger.api('Step 3: Route breakdown received', {
        tripId,
        dayId,
        segmentsCount: response.data?.segments?.length || 0
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      debugLogger.error('Get route breakdown failed', {
        tripId,
        dayId,
        error: error.message,
        status: error.response?.status
      });

      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status
      };
    }
  }
};
