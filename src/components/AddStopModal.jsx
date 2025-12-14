import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { tripsService } from '../services/auth';
import AddressSearchInput from './AddressSearchInput';
import LocationNameInput from './LocationNameInput';

const STOP_TYPES = [
  { value: 'ACCOMMODATION', label: '🏨 Accommodation', description: 'Hotels, B&Bs, camping' },
  { value: 'FOOD', label: '🍽️ Food', description: 'Restaurants, cafes, bars' },
  { value: 'ATTRACTION', label: '🎯 Attraction', description: 'Museums, landmarks, tours' },
  { value: 'ACTIVITY', label: '⚡ Activity', description: 'Sports, adventures, experiences' },
  { value: 'SHOPPING', label: '🛍️ Shopping', description: 'Stores, markets, outlets' },
  { value: 'GAS', label: '⛽ Gas/Fuel', description: 'Fuel stations, charging points' },
  { value: 'TRANSPORT', label: '🚗 Transport', description: 'Airports, train stations' },
  { value: 'SERVICES', label: '🏥 Services', description: 'Banks, hospitals, repairs' },
  { value: 'NATURE', label: '🌲 Nature', description: 'Parks, trails, beaches' },
  { value: 'CULTURE', label: '🎭 Culture', description: 'Theaters, galleries, events' },
  { value: 'NIGHTLIFE', label: '🌙 Nightlife', description: 'Bars, clubs, entertainment' },
  { value: 'OTHER', label: '📍 Other', description: 'Custom locations' }
];

const AddStopModal = ({
  isOpen,
  onClose,
  tripId,
  dayId,
  onStopAdded,
  existingStops = [],
  userLocation = null
}) => {
  // Determine available location types based on existing stops
  const availableLocationTypes = useMemo(() => {
    const hasStart = existingStops.some(stop => stop.kind === 'start');
    const hasEnd = existingStops.some(stop => stop.kind === 'end');

    const types = [];

    if (!hasStart) {
      types.push({ value: 'start', label: '🚀 Start Location', description: 'Starting point of the day' });
    }

    types.push({ value: 'via', label: '📍 Stop', description: 'Intermediate stop along the route' });

    if (!hasEnd) {
      types.push({ value: 'end', label: '🏁 End Location', description: 'Final destination of the day' });
    }

    return types;
  }, [existingStops]);

  // Calculate next sequence number
  const getNextSequenceNumber = (locationType) => {
    if (locationType === 'start') return 1;
    if (locationType === 'end') {
      return Math.max(...existingStops.map(s => s.seq || 0), 0) + 1;
    }
    // For via stops, insert between start and end
    return Math.max(...existingStops.map(s => s.seq || 0), 0) + 1;
  };

  const [formData, setFormData] = useState({
    locationType: availableLocationTypes[0]?.value || 'via',
    selectedPlace: null, // Will store the selected place from address search
    locationName: '',
    notes: '',
    stop_type: 'OTHER'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        locationType: availableLocationTypes[0]?.value || 'via',
        selectedPlace: null,
        locationName: '',
        notes: '',
        stop_type: 'OTHER'
      });
      setError('');
    }
  }, [isOpen, availableLocationTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.selectedPlace) {
        setError('Please select a location from the address search');
        setLoading(false);
        return;
      }

      if (!formData.locationType) {
        setError('Please select a location type');
        setLoading(false);
        return;
      }

      // Step 1: Always create place first (autocomplete IDs are not database IDs)
      const placeData = {
        name: formData.locationName || formData.selectedPlace.name,
        address: formData.selectedPlace.formatted_address
      };

      // Only add coordinates if they exist (not for manual entries)
      if (formData.selectedPlace.lat && formData.selectedPlace.lng) {
        placeData.lat = formData.selectedPlace.lat;
        placeData.lon = formData.selectedPlace.lng;
      }

      const placeResult = await tripsService.createPlace(placeData);

      if (!placeResult.success) {
        setError(placeResult.error || 'Failed to create place');
        setLoading(false);
        return;
      }

      const placeId = placeResult.place.id;

      // Step 2: Create the stop
      const stopData = {
        place_id: placeId,
        seq: getNextSequenceNumber(formData.locationType),
        kind: formData.locationType,
        stop_type: formData.stop_type,
        fixed: formData.locationType === 'start' || formData.locationType === 'end',
        priority: formData.locationType === 'start' || formData.locationType === 'end' ? 1 : 3
      };

      // Add optional fields
      if (formData.notes.trim()) {
        stopData.notes = formData.notes.trim();
      }

      const result = await tripsService.createStop(tripId, dayId, stopData);

      if (result.success) {
        onStopAdded(result.stop);
        onClose();
      } else {
        setError(result.error || 'Failed to create stop');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Add stop error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle place selection from address search
  const handlePlaceSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      selectedPlace: place
    }));
  };

  // Handle manual address entry (fallback when API is unavailable)
  const handleManualAddressEntry = (address) => {
    if (address.trim().length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedPlace: {
          id: `manual_${Date.now()}`,
          name: address.trim(),
          formatted_address: address.trim(),
          lat: null,
          lng: null,
          types: ['manual_entry']
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedPlace: null
      }));
    }
  };

  // Handle location name change
  const handleLocationNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      locationName: name
    }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{maxWidth: '700px'}} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Location to Day</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-trip-form">
          {/* Step 1: Select Location Type */}
          <div className="form-group mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              1. Select Location Type *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {availableLocationTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.locationType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="locationType"
                    value={type.value}
                    checked={formData.locationType === type.value}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 2: Search Address */}
          <div className="form-group mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              2. Search Address *
            </label>
            <AddressSearchInput
              value=""
              onPlaceSelect={handlePlaceSelect}
              placeholder="Search for an address or place..."
              disabled={loading}
              userLocation={userLocation}
            />

            {/* Fallback manual entry when API is unavailable */}
            <div className="mt-2">
              <input
                type="text"
                placeholder="Or enter address manually if search is unavailable..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={loading}
                onChange={(e) => handleManualAddressEntry(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use this if the address search above is not working due to API limits
              </p>
            </div>
            {formData.selectedPlace && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="font-medium text-green-800">{formData.selectedPlace.name}</div>
                <div className="text-sm text-green-600">{formData.selectedPlace.formatted_address}</div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, selectedPlace: null }))}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  Change location
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Location Name (Optional) */}
          <div className="form-group mb-6">
            <LocationNameInput
              value={formData.locationName}
              onChange={handleLocationNameChange}
              disabled={loading}
              label="3. Location Name (Optional)"
            />
          </div>

          {/* Step 4: Category */}
          <div className="form-group mb-6">
            <label htmlFor="stop_type" className="block text-sm font-medium text-gray-700 mb-3">
              4. Category
            </label>
            <select
              id="stop_type"
              name="stop_type"
              value={formData.stop_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {STOP_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {STOP_TYPES.find(t => t.value === formData.stop_type)?.description}
            </p>
          </div>

          {/* Step 5: Notes */}
          <div className="form-group mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-3">
              5. Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Add any notes about this location..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !formData.selectedPlace}
            >
              {loading ? 'Adding...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddStopModal;
