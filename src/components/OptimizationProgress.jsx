import React, { useState, useEffect } from 'react';

const OptimizationProgress = ({ stopCount }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Analyzing stops', icon: '📍' },
    { label: 'Calculating distances', icon: '📏' },
    { label: 'Finding optimal route', icon: '🧮' },
    { label: 'Generating results', icon: '✨' },
  ];

  useEffect(() => {
    // Simulate progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        
        // Update current step based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        setCurrentStep(Math.min(stepIndex, steps.length - 1));
        
        return Math.min(newProgress, 95); // Don't reach 100% until actual completion
      });
    }, 300);

    return () => clearInterval(interval);
  }, [steps.length]);

  const estimatedTime = Math.max(3, Math.ceil(stopCount * 0.5)); // Rough estimate

  return (
    <div className="optimization-progress">
      <div className="progress-header">
        <h4>🚀 Optimizing Your Route</h4>
        <div className="progress-stats">
          <span className="stop-count">{stopCount} stops</span>
          <span className="estimated-time">~{estimatedTime}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-percentage">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Current Step */}
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
          >
            <div className="step-icon">
              {index < currentStep ? '✅' : step.icon}
            </div>
            <div className="step-label">
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {/* Fun Facts */}
      <div className="optimization-info">
        <div className="info-item">
          <span className="info-icon">🧠</span>
          <span className="info-text">
            Using advanced algorithms to solve the Traveling Salesman Problem
          </span>
        </div>
        <div className="info-item">
          <span className="info-icon">🗺️</span>
          <span className="info-text">
            Analyzing real road networks and traffic patterns
          </span>
        </div>
        <div className="info-item">
          <span className="info-icon">⚡</span>
          <span className="info-text">
            Optimizing for your selected preferences and constraints
          </span>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="loading-animation">
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default OptimizationProgress;
