import axios from 'axios';
import { debugLogger } from '../config/debug';
import { navigateToPath, currentPathIncludes } from '../utils/navigation';

// API base URL
const API_BASE_URL = 'https://mytrips-api.bahar.co.il';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and debug logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    debugLogger.api('REQUEST', `${config.method?.toUpperCase()} ${config.url}`, {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    debugLogger.error('API', 'Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and debug logging
api.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses
    debugLogger.api('RESPONSE', `${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: {
        url: response.config.url,
        method: response.config.method,
      }
    });

    return response;
  },
  (error) => {
    // Debug logging for errors
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      }
    };

    debugLogger.api('ERROR', `${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, errorInfo);

    if (error.response?.status === 401) {
      debugLogger.auth('Token expired or invalid - handling logout');

      // Token expired or invalid - but don't redirect if we're already on login page
      const isOnLoginPage = currentPathIncludes('/login') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

      if (!isOnLoginPage) {
        debugLogger.storage('REMOVE', 'authToken');
        debugLogger.storage('REMOVE', 'userEmail');
        debugLogger.storage('REMOVE', 'userPassword');

        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');

        // Navigate to login page with correct base path
        navigateToPath('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
