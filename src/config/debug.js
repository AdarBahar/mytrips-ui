// Debug configuration
export const debugConfig = {
  // Enable/disable debug mode
  enabled: true, // Set to false in production
  
  // Debug levels
  levels: {
    API: true,      // Log API requests/responses
    AUTH: true,     // Log authentication flows
    ROUTING: true,  // Log route changes
    STORAGE: true,  // Log localStorage operations
  },
  
  // API request/response logging
  api: {
    logRequests: true,
    logResponses: true,
    logHeaders: true,
    logErrors: true,
  },
};

// Debug logger utility
export const debugLogger = {
  log: (category, message, data = null) => {
    if (!debugConfig.enabled || !debugConfig.levels[category]) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[DEBUG:${category}] ${timestamp}`;
    
    if (data) {
      console.group(`${prefix} ${message}`);
      console.log(data);
      console.groupEnd();
    } else {
      console.log(`${prefix} ${message}`);
    }
  },
  
  api: (type, url, data = null) => {
    if (!debugConfig.enabled || !debugConfig.levels.API) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[API:${type}] ${timestamp}`;
    
    console.group(`${prefix} ${url}`);
    if (data) {
      console.log(data);
    }
    console.groupEnd();
  },
  
  auth: (action, data = null) => {
    if (!debugConfig.enabled || !debugConfig.levels.AUTH) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[AUTH] ${timestamp}`;
    
    console.group(`${prefix} ${action}`);
    if (data) {
      console.log(data);
    }
    console.groupEnd();
  },
  
  storage: (action, key, value = null) => {
    if (!debugConfig.enabled || !debugConfig.levels.STORAGE) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[STORAGE] ${timestamp} ${action} - ${key}`, value || '');
  },
  
  error: (category, error, context = null) => {
    if (!debugConfig.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.group(`[ERROR:${category}] ${timestamp}`);
    console.error(error);
    if (context) {
      console.log('Context:', context);
    }
    console.groupEnd();
  }
};

// Debug panel toggle (for development)
export const toggleDebug = () => {
  debugConfig.enabled = !debugConfig.enabled;
  console.log(`Debug mode ${debugConfig.enabled ? 'ENABLED' : 'DISABLED'}`);
  
  // Store in localStorage for persistence
  localStorage.setItem('mytrips_debug', debugConfig.enabled.toString());
};

// Initialize debug state from localStorage
export const initializeDebug = () => {
  const storedDebug = localStorage.getItem('mytrips_debug');
  if (storedDebug !== null) {
    debugConfig.enabled = storedDebug === 'true';
  }
  
  // Make debug functions available globally for console access
  if (typeof window !== 'undefined') {
    window.mytripsDebug = {
      toggle: toggleDebug,
      config: debugConfig,
      logger: debugLogger,
    };
  }
  
  if (debugConfig.enabled) {
    console.log('🐛 MyTrips Debug Mode Enabled');
    console.log('Use window.mytripsDebug.toggle() to toggle debug mode');
    console.log('Current config:', debugConfig);
  }
};
