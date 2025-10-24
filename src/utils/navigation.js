/**
 * Navigation utilities for handling base paths in different environments
 */

/**
 * Get the base path for the application
 * Returns '/MyTrips' in production, empty string in development
 */
export const getBasePath = () => {
  return import.meta.env.PROD ? "/MyTrips" : "";
};

/**
 * Get the full URL path for a given route
 * @param {string} path - The route path (e.g., '/login', '/trips')
 * @returns {string} - The full path including base path
 */
export const getFullPath = (path) => {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
};

/**
 * Navigate to a path using window.location.href with correct base path
 * @param {string} path - The route path (e.g., '/login', '/trips')
 */
export const navigateToPath = (path) => {
  const fullPath = getFullPath(path);
  window.location.href = fullPath;
};

/**
 * Check if current path matches a given route (accounting for base path)
 * @param {string} path - The route path to check (e.g., '/login')
 * @returns {boolean} - True if current path matches
 */
export const isCurrentPath = (path) => {
  const fullPath = getFullPath(path);
  return window.location.pathname === fullPath;
};

/**
 * Check if current path includes a given route (accounting for base path)
 * @param {string} path - The route path to check (e.g., '/login')
 * @returns {boolean} - True if current path includes the route
 */
export const currentPathIncludes = (path) => {
  const fullPath = getFullPath(path);
  return window.location.pathname.includes(fullPath) || window.location.pathname.includes(path);
};
