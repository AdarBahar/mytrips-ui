import axios from 'axios';
import { debugLogger } from '../config/debug';

// API configuration with proxy support
const getApiConfig = () => {
  // Check if we're running on the production domain
  if (typeof window !== 'undefined') {
    const currentDomain = window.location.hostname;
    
    // If we're on bahar.co.il, use the proxy
    if (currentDomain.includes('bahar.co.il')) {
      return {
        useProxy: true,
        baseURL: window.location.origin, // Same domain
        proxyPath: '/api-proxy.php' // Path to the proxy file
      };
    }
  }
  
  // Default to direct API calls (for development)
  return {
    useProxy: false,
    baseURL: 'https://mytrips-api.bahar.co.il',
    proxyPath: null
  };
};

const apiConfig = getApiConfig();

// Create axios instance with proxy support
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to handle proxy routing and auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If using proxy, modify the URL
    if (apiConfig.useProxy) {
      const originalUrl = config.url;
      config.url = `${apiConfig.proxyPath}?path=${encodeURIComponent(originalUrl)}`;
      
      debugLogger.api('PROXY REQUEST', `${config.method?.toUpperCase()} ${originalUrl} (via proxy)`, {
        originalUrl,
        proxyUrl: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    } else {
      debugLogger.api('DIRECT REQUEST', `${config.method?.toUpperCase()} ${config.url}`, {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }

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
    const requestType = apiConfig.useProxy ? 'PROXY RESPONSE' : 'DIRECT RESPONSE';
    debugLogger.api(requestType, `${response.status} ${response.config.method?.toUpperCase()}`, {
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
    const requestType = apiConfig.useProxy ? 'PROXY ERROR' : 'DIRECT ERROR';
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

    debugLogger.api(requestType, `${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()}`, errorInfo);

    if (error.response?.status === 401) {
      debugLogger.auth('Token expired or invalid - handling logout');

      // Token expired or invalid - but don't redirect if we're already on login page
      if (!window.location.pathname.includes('/login')) {
        debugLogger.storage('REMOVE', 'authToken');
        debugLogger.storage('REMOVE', 'userEmail');
        debugLogger.storage('REMOVE', 'userPassword');

        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
