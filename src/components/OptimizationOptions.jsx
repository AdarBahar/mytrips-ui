import React from 'react';

const OptimizationOptions = ({ options, onChange, onReset }) => {
  const handleObjectiveChange = (e) => {
    onChange('objective', e.target.value);
  };

  const handleVehicleProfileChange = (e) => {
    onChange('vehicleProfile', e.target.value);
  };

  const handleAvoidChange = (avoidType) => {
    const currentAvoid = options.avoid || [];
    const newAvoid = currentAvoid.includes(avoidType)
      ? currentAvoid.filter(item => item !== avoidType)
      : [...currentAvoid, avoidType];
    onChange('avoid', newAvoid);
  };

  const handlePromptChange = (e) => {
    onChange('prompt', e.target.value);
  };

  return (
    <div className="optimization-options">
      <div className="options-header">
        <h4>🔧 Optimization Settings</h4>
        <button
          type="button"
          onClick={onReset}
          className="reset-options-btn"
          title="Reset to default settings"
        >
          🔄 Reset
        </button>
      </div>

      <div className="options-grid">
        {/* Optimization Objective */}
        <div className="option-group">
          <label htmlFor="objective" className="option-label">
            🎯 Optimize For
          </label>
          <select
            id="objective"
            value={options.objective || 'time'}
            onChange={handleObjectiveChange}
            className="option-select"
          >
            <option value="time">Minimum Travel Time</option>
            <option value="distance">Shortest Distance</option>
          </select>
          <div className="option-description">
            Choose whether to minimize total travel time or total distance
          </div>
        </div>

        {/* Vehicle Profile */}
        <div className="option-group">
          <label htmlFor="vehicleProfile" className="option-label">
            🚗 Vehicle Type
          </label>
          <select
            id="vehicleProfile"
            value={options.vehicleProfile || 'car'}
            onChange={handleVehicleProfileChange}
            className="option-select"
          >
            <option value="car">Car</option>
            <option value="bike">Bicycle</option>
            <option value="foot">Walking</option>
          </select>
          <div className="option-description">
            Vehicle type affects available routes and speed calculations
          </div>
        </div>

        {/* Avoid Options */}
        <div className="option-group">
          <label className="option-label">
            🚫 Avoid
          </label>
          <div className="avoid-options">
            {['tolls', 'ferries', 'highways'].map(avoidType => (
              <label key={avoidType} className="avoid-option">
                <input
                  type="checkbox"
                  checked={(options.avoid || []).includes(avoidType)}
                  onChange={() => handleAvoidChange(avoidType)}
                  className="avoid-checkbox"
                />
                <span className="avoid-label">
                  {avoidType.charAt(0).toUpperCase() + avoidType.slice(1)}
                </span>
              </label>
            ))}
          </div>
          <div className="option-description">
            Select road types to avoid during route calculation
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="option-group full-width">
          <label htmlFor="prompt" className="option-label">
            💬 Custom Instructions (Optional)
          </label>
          <textarea
            id="prompt"
            value={options.prompt || ''}
            onChange={handlePromptChange}
            placeholder="e.g., 'Prioritize scenic routes' or 'Avoid city centers'"
            className="option-textarea"
            rows={3}
            maxLength={500}
          />
          <div className="option-description">
            Provide additional instructions for the optimization algorithm
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationOptions;
