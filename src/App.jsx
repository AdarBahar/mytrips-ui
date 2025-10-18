import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import LoadingTestPage from './pages/LoadingTestPage';
import DebugPanel from './components/DebugPanel';
import { initializeDebug } from './config/debug';
import './App.css';

function App() {
  // Initialize debug system
  useEffect(() => {
    initializeDebug();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/loading-test" element={<LoadingTestPage />} />

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
    </AuthProvider>
  );
}

export default App;
