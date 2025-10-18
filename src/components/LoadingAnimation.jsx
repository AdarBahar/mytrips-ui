import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';

const LoadingAnimation = ({ 
  size = 80, 
  message = 'Loading...', 
  showMessage = true,
  className = '' 
}) => {
  return (
    <div className={`loading-animation-container ${className}`}>
      <div className="loading-animation-wrapper">
        <Lottie
          animationData={loadingAnimation}
          style={{
            width: size,
            height: size,
          }}
          loop={true}
          autoplay={true}
        />
        {showMessage && (
          <div className="loading-animation-message">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;
