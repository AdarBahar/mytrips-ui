import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAllStatusOptions, isValidStatusTransition, getStatusInfo } from '../utils/statusUtils';

const StatusDropdown = ({ currentStatus, tripId, onStatusChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(true); // Default to upwards for cards
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);

  const statusOptions = getAllStatusOptions();

  const getCurrentStatusInfo = () => {
    return getStatusInfo(currentStatus);
  };

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Determine if we should open upwards
      const shouldOpenUpwards = spaceAbove > spaceBelow || rect.top > viewportHeight / 2;
      setOpenUpwards(shouldOpenUpwards);

      // Calculate position for fixed positioning
      const dropdownHeight = 250; // Approximate dropdown height
      let top, left;

      if (shouldOpenUpwards) {
        top = rect.top - dropdownHeight;
      } else {
        top = rect.bottom + 2;
      }

      left = rect.left;
      const width = rect.width;

      // Ensure dropdown doesn't go off screen
      if (left + width > window.innerWidth) {
        left = window.innerWidth - width - 10;
      }
      if (left < 10) {
        left = 10;
      }
      if (top < 10) {
        top = rect.bottom + 2; // Force downward if no space above
      }
      if (top + dropdownHeight > viewportHeight - 10) {
        top = rect.top - dropdownHeight; // Force upward if no space below
      }

      setDropdownPosition({ top, left, width });
    }
  }, [isOpen]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    setIsOpen(false);

    try {
      await onStatusChange(tripId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };



  const currentStatusInfo = getCurrentStatusInfo();

  return (
    <div className="status-dropdown" ref={dropdownRef}>
      <button
        className={`status-edit-button ${isOpen ? 'open' : ''} ${isUpdating ? 'updating' : ''}`}
        onClick={() => !disabled && !isUpdating && setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        title={isUpdating ? 'Updating status...' : (isOpen ? 'Cancel editing' : 'Edit status')}
      >
        {isUpdating ? '⏳ Updating...' : (isOpen ? 'Cancel' : 'Edit')}
      </button>

      {/* Render dropdown menu and overlay using portal to escape stacking context */}
      {isOpen && !isUpdating && createPortal(
        <>
          <div
            className="dropdown-overlay"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`status-dropdown-menu ${openUpwards ? 'dropdown-menu-up' : 'dropdown-menu-down'}`}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${Math.max(dropdownPosition.width, 180)}px`
            }}
          >
            <div className="dropdown-header">
              <strong>Change Status</strong>
            </div>
            {statusOptions.map((option) => {
              const isCurrentStatus = option.value === currentStatus;
              const isValidOption = isValidStatusTransition(currentStatus, option.value);

              return (
                <button
                  key={option.value}
                  className={`status-option ${isCurrentStatus ? 'current' : ''} ${!isValidOption ? 'disabled' : ''}`}
                  onClick={() => isValidOption && handleStatusChange(option.value)}
                  disabled={isCurrentStatus || !isValidOption}
                  title={!isValidOption ? 'Invalid status transition' : option.description}
                >
                  <div className="option-content">
                    <span className="option-label">{option.emoji} {option.label}</span>
                    {isCurrentStatus && <span className="current-indicator">✓ Current</span>}
                    {!isValidOption && <span className="invalid-indicator">⚠️ Invalid</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default StatusDropdown;
