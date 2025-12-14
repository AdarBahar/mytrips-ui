/**
 * Configuration for location name options in the Add Location modal
 * 
 * This file contains predefined location name options that users can select
 * when adding a location to their trip. The options are organized by category
 * and can be easily extended by adding new entries to the array.
 */

export const LOCATION_NAME_OPTIONS = [
  {
    value: 'hotel',
    label: '🏨 Hotel',
    category: 'accommodation'
  },
  {
    value: 'restaurant',
    label: '🍽️ Restaurant',
    category: 'food'
  },
  {
    value: 'must_see',
    label: '⭐ Must See',
    category: 'attraction'
  },
  {
    value: 'cafe',
    label: '☕ Cafe',
    category: 'food'
  },
  {
    value: 'museum',
    label: '🏛️ Museum',
    category: 'attraction'
  },
  {
    value: 'park',
    label: '🌳 Park',
    category: 'nature'
  },
  {
    value: 'shopping',
    label: '🛍️ Shopping',
    category: 'shopping'
  },
  {
    value: 'viewpoint',
    label: '📸 Viewpoint',
    category: 'scenic'
  },
  {
    value: 'bar',
    label: '🍺 Bar',
    category: 'nightlife'
  },
  {
    value: 'activity',
    label: '⚡ Activity',
    category: 'activity'
  }
];

/**
 * Get location name options by category
 * @param {string} category - The category to filter by
 * @returns {Array} Filtered location name options
 */
export const getLocationNamesByCategory = (category) => {
  return LOCATION_NAME_OPTIONS.filter(option => option.category === category);
};

/**
 * Get all available categories
 * @returns {Array} Array of unique categories
 */
export const getLocationNameCategories = () => {
  return [...new Set(LOCATION_NAME_OPTIONS.map(option => option.category))];
};

/**
 * Find location name option by value
 * @param {string} value - The value to search for
 * @returns {Object|null} The matching option or null if not found
 */
export const findLocationNameOption = (value) => {
  return LOCATION_NAME_OPTIONS.find(option => option.value === value) || null;
};
