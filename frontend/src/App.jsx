import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

/**
 * Protected Route wrapper:
 * If authenticated -> render component
 * If not authenticated -> redirect to /login
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public Auth Route wrapper:
 * If already authenticated -> redirect to / (Todo Dashboard)
 * If not authenticated -> render Auth page
 */
function PublicAuthRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Todo Dashboard (Only accessible when user is logged in) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Separate Standalone Login Page */}
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <AuthPage initialMode="login" />
            </PublicAuthRoute>
          }
        />

        {/* Separate Standalone Sign Up Page */}
        <Route
          path="/signup"
          element={
            <PublicAuthRoute>
              <AuthPage initialMode="signup" />
            </PublicAuthRoute>
          }
        />

        {/* Separate Standalone Forgot Password Page */}
        <Route
          path="/forgot-password"
          element={
            <PublicAuthRoute>
              <AuthPage initialMode="forgot" />
            </PublicAuthRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
