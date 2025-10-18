import React, { useState } from 'react';
import LoadingAnimation from '../components/LoadingAnimation';

const LoadingTestPage = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [animationSize, setAnimationSize] = useState(80);
  const [animationMessage, setAnimationMessage] = useState('Loading...');
  const [animationVariant, setAnimationVariant] = useState('default');

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Loading Animation Test Page</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Controls</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button 
            onClick={() => setShowLoading(!showLoading)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {showLoading ? 'Hide' : 'Show'} Loading Animation
          </button>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Size:
            <input 
              type="range" 
              min="40" 
              max="120" 
              value={animationSize}
              onChange={(e) => setAnimationSize(Number(e.target.value))}
            />
            <span>{animationSize}px</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Message:
            <input 
              type="text" 
              value={animationMessage}
              onChange={(e) => setAnimationMessage(e.target.value)}
              style={{ padding: '0.25rem' }}
            />
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Variant:
            <select 
              value={animationVariant}
              onChange={(e) => setAnimationVariant(e.target.value)}
              style={{ padding: '0.25rem' }}
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="inline">Inline</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Animation Preview</h2>
        <div style={{ 
          border: '2px dashed #ccc', 
          borderRadius: '8px', 
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {showLoading ? (
            <LoadingAnimation 
              size={animationSize}
              message={animationMessage}
              className={animationVariant !== 'default' ? animationVariant : ''}
            />
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Loading animation is hidden
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Usage Examples</h2>
        
        <h3>1. Default Loading (Trips Page Style)</h3>
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <LoadingAnimation 
            size={60} 
            message="Loading trips..." 
            className="compact"
          />
        </div>
        
        <h3>2. Trip Detail Loading</h3>
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <LoadingAnimation 
            size={80} 
            message="Loading trip details..." 
          />
        </div>
        
        <h3>3. Inline Loading</h3>
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <p>Processing your request... 
            <LoadingAnimation 
              size={24} 
              message="Please wait" 
              className="inline"
            />
          </p>
        </div>
        
        <h3>4. No Message</h3>
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <LoadingAnimation 
            size={60} 
            showMessage={false}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Implementation Details</h2>
        <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          <h4>LoadingAnimation Component Props:</h4>
          <ul>
            <li><strong>size</strong>: Animation size in pixels (default: 80)</li>
            <li><strong>message</strong>: Text to display below animation (default: "Loading...")</li>
            <li><strong>showMessage</strong>: Whether to show the message (default: true)</li>
            <li><strong>className</strong>: Additional CSS classes ("compact", "inline", or custom)</li>
          </ul>
          
          <h4>CSS Classes:</h4>
          <ul>
            <li><strong>.compact</strong>: Smaller padding and spacing</li>
            <li><strong>.inline</strong>: Horizontal layout for inline use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoadingTestPage;
