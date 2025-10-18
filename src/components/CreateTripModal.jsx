import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const CreateTripModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Trip title is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    // Only validate date relationship if both dates are provided
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Submit the form data
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      destination: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Trip</h2>
          <button 
            className="modal-close-button"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-trip-form">
          <div className="form-help-text">
            <p>Create a new trip. Only title and destination are required - you can add dates later!</p>
          </div>

          <div className="form-group">
            <label htmlFor="title">Trip Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Summer Vacation 2024"
              disabled={loading}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="destination">Destination *</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="e.g., Paris, France"
              disabled={loading}
              className={errors.destination ? 'error' : ''}
            />
            {errors.destination && <span className="error-text">{errors.destination}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                disabled={loading}
                className={errors.start_date ? 'error' : ''}
                placeholder="Optional"
              />
              {errors.start_date && <span className="error-text">{errors.start_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                disabled={loading}
                className={errors.end_date ? 'error' : ''}
                placeholder="Optional"
              />
              {errors.end_date && <span className="error-text">{errors.end_date}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description of your trip..."
              rows="3"
              disabled={loading}
            />
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '✈️ Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateTripModal;
