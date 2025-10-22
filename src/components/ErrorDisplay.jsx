import React, { useState } from 'react';

const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);

  const hasErrors = error.validationErrors.length > 0 || 
                   error.routingErrors.length > 0 || 
                   error.systemErrors.length > 0;

  if (!hasErrors) return null;

  const getErrorIcon = () => {
    if (error.validationErrors.length > 0) return '⚠️';
    if (error.routingErrors.length > 0) return '🗺️';
    if (error.systemErrors.length > 0) return '🔧';
    return '❌';
  };

  const getErrorTitle = () => {
    if (error.validationErrors.length > 0) return 'Validation Error';
    if (error.routingErrors.length > 0) return 'Routing Error';
    if (error.systemErrors.length > 0) return 'System Error';
    return 'Optimization Error';
  };

  const canRetry = error.routingErrors.length > 0 || error.systemErrors.length > 0;

  return (
    <div className="error-display">
      <div className="error-header">
        <div className="error-title">
          <span className="error-icon">{getErrorIcon()}</span>
          <span className="error-text">{getErrorTitle()}</span>
        </div>
        <div className="error-actions">
          {showDetails ? (
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="toggle-details-btn"
            >
              🔼 Less Details
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="toggle-details-btn"
            >
              🔽 More Details
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="dismiss-btn"
            title="Dismiss error"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Error Summary */}
      <div className="error-summary">
        {error.validationErrors.length > 0 && (
          <div className="error-message validation">
            {error.validationErrors[0]}
          </div>
        )}
        {error.routingErrors.length > 0 && (
          <div className="error-message routing">
            {error.routingErrors[0]}
          </div>
        )}
        {error.systemErrors.length > 0 && (
          <div className="error-message system">
            {error.systemErrors[0]}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {error.suggestions.length > 0 && (
        <div className="error-suggestions">
          <div className="suggestions-header">
            <span className="suggestions-icon">💡</span>
            <span className="suggestions-title">Suggestions</span>
          </div>
          <ul className="suggestions-list">
            {error.suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Errors */}
      {showDetails && (
        <div className="error-details">
          {error.validationErrors.length > 0 && (
            <div className="error-section">
              <h6 className="section-title">
                <span className="section-icon">⚠️</span>
                Validation Errors
              </h6>
              <ul className="error-list">
                {error.validationErrors.map((err, index) => (
                  <li key={index} className="error-item validation">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error.routingErrors.length > 0 && (
            <div className="error-section">
              <h6 className="section-title">
                <span className="section-icon">🗺️</span>
                Routing Errors
              </h6>
              <ul className="error-list">
                {error.routingErrors.map((err, index) => (
                  <li key={index} className="error-item routing">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error.systemErrors.length > 0 && (
            <div className="error-section">
              <h6 className="section-title">
                <span className="section-icon">🔧</span>
                System Errors
              </h6>
              <ul className="error-list">
                {error.systemErrors.map((err, index) => (
                  <li key={index} className="error-item system">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="error-actions-footer">
        {canRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="retry-btn"
          >
            🔄 Try Again
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="dismiss-btn-footer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
