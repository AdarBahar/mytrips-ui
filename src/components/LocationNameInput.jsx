import React, { useState, useEffect } from 'react';
import { LOCATION_NAME_OPTIONS } from '../config/locationNames';

const LocationNameInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter location name or select from dropdown...",
  disabled = false,
  className = "",
  label = "Location Name"
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [selectedOption, setSelectedOption] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Check if current value matches any predefined option
  useEffect(() => {
    const matchingOption = LOCATION_NAME_OPTIONS.find(
      option => option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.value === inputValue
    );
    
    if (matchingOption && inputValue) {
      setSelectedOption(matchingOption.value);
      setIsCustom(false);
    } else if (inputValue) {
      setSelectedOption('custom');
      setIsCustom(true);
    } else {
      setSelectedOption('');
      setIsCustom(false);
    }
  }, [inputValue]);

  // Update input value when value prop changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Handle dropdown selection
  const handleDropdownChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);

    if (selectedValue === 'custom') {
      setIsCustom(true);
      setInputValue('');
      onChange?.('');
    } else if (selectedValue === '') {
      setIsCustom(false);
      setInputValue('');
      onChange?.('');
    } else {
      const option = LOCATION_NAME_OPTIONS.find(opt => opt.value === selectedValue);
      if (option) {
        setIsCustom(false);
        // Extract the text part without emoji for the input value
        const nameWithoutEmoji = option.label.replace(/^[^\w\s]+\s*/, '');
        setInputValue(nameWithoutEmoji);
        onChange?.(nameWithoutEmoji);
      }
    }
  };

  // Handle text input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    // If user is typing and it's not matching a predefined option, mark as custom
    if (newValue && !LOCATION_NAME_OPTIONS.some(option => 
      option.label.toLowerCase().includes(newValue.toLowerCase())
    )) {
      setSelectedOption('custom');
      setIsCustom(true);
    }
  };

  return (
    <div className={`location-name-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Dropdown for predefined options */}
        <div>
          <select
            value={selectedOption}
            onChange={handleDropdownChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select a location type...</option>
            {LOCATION_NAME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="custom">✏️ Custom name</option>
          </select>
        </div>

        {/* Text input - always visible but conditionally focused */}
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={isCustom ? "Enter custom location name..." : placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isCustom ? 'border-blue-300 bg-blue-50' : ''
            }`}
          />
          {isCustom && (
            <p className="mt-1 text-xs text-blue-600">
              💡 You're entering a custom location name
            </p>
          )}
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-sm text-gray-500">
        Choose from common location types or enter your own custom name
      </p>
    </div>
  );
};

export default LocationNameInput;
