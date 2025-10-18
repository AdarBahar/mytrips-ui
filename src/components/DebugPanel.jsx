import React, { useState, useEffect } from 'react';
import { debugConfig, debugLogger, toggleDebug } from '../config/debug';
import { authService } from '../services/auth';

const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugEnabled, setDebugEnabled] = useState(debugConfig.enabled);
  const [authInfo, setAuthInfo] = useState({});

  useEffect(() => {
    updateAuthInfo();
  }, []);

  const updateAuthInfo = () => {
    const info = {
      isAuthenticated: authService.isAuthenticated(),
      hasToken: !!authService.getToken(),
      hasRememberMe: !!authService.getRememberMeCredentials(),
      rememberMeCredentials: authService.getRememberMeCredentials(),
    };
    setAuthInfo(info);
  };

  const handleToggleDebug = () => {
    toggleDebug();
    setDebugEnabled(debugConfig.enabled);
  };

  const testApiConnection = async () => {
    debugLogger.log('DEBUG_PANEL', 'Testing API connection');
    try {
      const result = await authService.login('test@example.com', 'wrongpassword');
      debugLogger.log('DEBUG_PANEL', 'API test result', result);
    } catch (error) {
      debugLogger.error('DEBUG_PANEL', 'API test failed', error);
    }
  };

  const clearAllStorage = () => {
    debugLogger.log('DEBUG_PANEL', 'Clearing all localStorage');
    localStorage.clear();
    updateAuthInfo();
  };

  const logCurrentState = () => {
    debugLogger.log('DEBUG_PANEL', 'Current application state', {
      authInfo,
      localStorage: {
        authToken: localStorage.getItem('authToken') ? '***TOKEN***' : null,
        userEmail: localStorage.getItem('userEmail'),
        rememberMe: localStorage.getItem('rememberMe'),
      },
      debugConfig,
    });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#333',
          color: 'white',
          border: 'none',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '16px',
        }}
        title="Open Debug Panel"
      >
        🐛
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '350px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>🐛 Debug Panel</h4>
        <button
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={debugEnabled}
            onChange={handleToggleDebug}
          />
          Debug Mode {debugEnabled ? '✅' : '❌'}
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h5 style={{ margin: '0 0 5px 0' }}>Auth Status:</h5>
        <div style={{ fontSize: '11px', background: '#f5f5f5', padding: '5px', borderRadius: '3px' }}>
          <div>Authenticated: {authInfo.isAuthenticated ? '✅' : '❌'}</div>
          <div>Has Token: {authInfo.hasToken ? '✅' : '❌'}</div>
          <div>Remember Me: {authInfo.hasRememberMe ? '✅' : '❌'}</div>
          {authInfo.rememberMeCredentials && (
            <div>Email: {authInfo.rememberMeCredentials.email}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={testApiConnection}
          style={{ padding: '5px', fontSize: '11px', cursor: 'pointer' }}
        >
          Test API Connection
        </button>
        
        <button
          onClick={updateAuthInfo}
          style={{ padding: '5px', fontSize: '11px', cursor: 'pointer' }}
        >
          Refresh Auth Info
        </button>
        
        <button
          onClick={logCurrentState}
          style={{ padding: '5px', fontSize: '11px', cursor: 'pointer' }}
        >
          Log Current State
        </button>
        
        <button
          onClick={clearAllStorage}
          style={{ padding: '5px', fontSize: '11px', cursor: 'pointer', background: '#ff6b6b', color: 'white', border: 'none' }}
        >
          Clear All Storage
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        <div>Console: F12 → Console</div>
        <div>Global: window.mytripsDebug</div>
      </div>
    </div>
  );
};

export default DebugPanel;
