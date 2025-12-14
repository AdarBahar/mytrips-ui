import React, { useState, useEffect, useRef, useCallback } from 'react';
import { tripsService } from '../services/auth';

const AddressSearchInput = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Search for an address or place...",
  disabled = false,
  className = "",
  userLocation = null // { lat, lng }
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [error, setError] = useState('');
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Generate new session token
  const generateSessionToken = useCallback(() => {
    return `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Initialize session token on focus
  const handleFocus = useCallback(() => {
    if (!sessionToken) {
      setSessionToken(generateSessionToken());
    }
    setShowDropdown(true);
  }, [sessionToken, generateSessionToken]);

  // Reset session token on blur
  const handleBlur = useCallback((e) => {
    // Don't close dropdown if clicking on a suggestion
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      setShowDropdown(false);
      setSessionToken(null);
    }, 150);
  }, []);

  // Debounced search function
  const searchPlaces = useCallback(async (searchQuery, token) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const options = {
        sessionToken: token,
        limit: 8
      };

      // Add user location for proximity bias
      if (userLocation && userLocation.lat && userLocation.lng) {
        options.lat = userLocation.lat;
        options.lng = userLocation.lng;
        options.radius = 5000;
      }

      const result = await tripsService.searchPlaces(searchQuery, options);

      if (result.success) {
        setSuggestions(result.data.suggestions || []);
      } else {
        setError(result.error || 'Failed to search places');
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Address search error:', err);
      setError('An error occurred while searching');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange?.(newQuery);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      if (sessionToken) {
        searchPlaces(newQuery, sessionToken);
      }
    }, 200);
  }, [onChange, searchPlaces, sessionToken]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion.name);
    setShowDropdown(false);
    setSuggestions([]);
    
    // Call the onPlaceSelect callback with the selected place data
    onPlaceSelect?.({
      id: suggestion.id,
      name: suggestion.name,
      formatted_address: suggestion.formatted_address,
      lat: suggestion.center?.lat,
      lng: suggestion.center?.lng,
      types: suggestion.types
    });
  }, [onPlaceSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Update query when value prop changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value || '');
    }
  }, [value]);

  return (
    <div className={`address-search-input ${className}`} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Dropdown with suggestions */}
      {showDropdown && (suggestions.length > 0 || error) && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {error && (
            <div className="px-3 py-2 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div 
                className="font-medium text-gray-900"
                dangerouslySetInnerHTML={{ __html: suggestion.highlighted || suggestion.name }}
              />
              {suggestion.formatted_address && (
                <div className="text-sm text-gray-600">
                  {suggestion.formatted_address}
                </div>
              )}
              {suggestion.distance_m && (
                <div className="text-xs text-gray-500">
                  {(suggestion.distance_m / 1000).toFixed(1)} km away
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearchInput;
