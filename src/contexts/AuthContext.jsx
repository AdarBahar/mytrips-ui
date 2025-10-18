import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { debugLogger } from '../config/debug';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    debugLogger.auth('Initializing authentication');
    setLoading(true);

    try {
      // Check if user has a stored token
      if (authService.isAuthenticated()) {
        debugLogger.auth('Existing token found, validating with server');

        // Try to get user info with existing token
        const result = await authService.getCurrentUser();

        if (result.success) {
          debugLogger.auth('Token validation successful', { user: result.user.email });
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          debugLogger.auth('Token validation failed, trying remember me');
          // Token is invalid, try to re-authenticate with remember me
          await tryRememberMeLogin();
        }
      } else {
        debugLogger.auth('No existing token, trying remember me');
        // No token, try remember me login
        await tryRememberMeLogin();
      }
    } catch (error) {
      debugLogger.error('AUTH', 'Auth initialization failed', error);
    } finally {
      setLoading(false);
      debugLogger.auth('Auth initialization complete');
    }
  };

  const tryRememberMeLogin = async () => {
    const credentials = authService.getRememberMeCredentials();

    if (credentials && credentials.email && credentials.password) {
      debugLogger.auth('Attempting remember me login', { email: credentials.email });
      const result = await authService.login(credentials.email, credentials.password);

      if (result.success) {
        debugLogger.auth('Remember me login successful');
        // Get user info after successful login
        const userResult = await authService.getCurrentUser();
        if (userResult.success) {
          setUser(userResult.user);
          setIsAuthenticated(true);
        }
      } else {
        debugLogger.auth('Remember me login failed, clearing credentials');
        // Remember me login failed, clear stored credentials
        authService.clearRememberMe();
      }
    } else {
      debugLogger.auth('No remember me credentials available');
    }
  };

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        // Store remember me credentials if requested
        if (rememberMe) {
          authService.storeRememberMe(email, password);
        } else {
          authService.clearRememberMe();
        }
        
        // Get user info
        const userResult = await authService.getCurrentUser();
        if (userResult.success) {
          setUser(userResult.user);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          return { success: false, error: 'Failed to get user information' };
        }
      } else {
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    initializeAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
