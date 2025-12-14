import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import LoadingTestPage from './pages/LoadingTestPage';
import AddStopModalTest from './components/AddStopModalTest';
import DebugPanel from './components/DebugPanel';
import { initializeDebug } from './config/debug';
import './App.css';

// App content component that uses auth context
const AppContent = () => {
  const { showSplash, handleSplashComplete } = useAuth();

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Use basename only in production
  const basename = import.meta.env.PROD ? "/MyTrips" : "";

  return (
    <Router basename={basename}>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/loading-test" element={<LoadingTestPage />} />
          <Route path="/modal-test" element={<AddStopModalTest />} />

          {/* Protected routes */}
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <TripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:tripId"
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Debug Panel - only shows in development */}
        <DebugPanel />
      </div>
    </Router>
  );
};

function App() {
  // Initialize debug system
  useEffect(() => {
    initializeDebug();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
