import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import ThemeToggle from './ThemeToggle';
import {
  CheckSquare,
  Plus,
  Database,
  LogIn,
  LogOut,
  User,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function Header({
  onOpenAddModal,
  onOpenAuthModal,
  onLogout,
}) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, idleRemainingSeconds } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      dispatch(logout('You have logged out successfully.'));
    }
  };

  const minutes = Math.floor(idleRemainingSeconds / 60);
  const seconds = idleRemainingSeconds % 60;
  const idleFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon-wrapper">
          <CheckSquare className="brand-icon" size={26} />
        </div>
        <div>
          <div className="brand-title-row">
            <h1 className="brand-title">TaskFlow</h1>
            <span className="brand-badge">Fullstack</span>
          </div>
          <p className="brand-subtitle">React + Redux Toolkit • Express • MySQL</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Theme Toggle (Dark / Light) */}
        <ThemeToggle />

        {/* Database Status Pill */}
        <div className="db-status-pill" title="Connected to Express API on port 8001">
          <span className="status-dot"></span>
          <Database size={14} className="db-icon" />
          <span>MySQL Sync Active</span>
        </div>

        {isAuthenticated ? (
          <>
            {/* Active Session & Idle Countdown Pill */}
            <div
              className="session-status-pill"
              title="JWT refreshes every 7 min while active. Session lasts 2 days. 7 min idle auto-locks."
            >
              <span className="session-pulse-dot"></span>
              <ShieldCheck size={14} className="text-emerald-400" />
              <div className="session-text-group">
                <span className="session-status-name">Active (2d)</span>
                <span className="session-idle-timer">
                  <Clock size={11} /> {idleFormatted} idle
                </span>
              </div>
            </div>

            {/* User Profile Badge */}
            <div className="user-profile-badge" title={`Logged in as ${user?.email}`}>
              <div className="user-avatar-circle">{userInitial}</div>
              <div className="user-details-mini">
                <span className="user-name-label">{user?.name}</span>
                <span className="user-role-label">{user?.role || 'user'}</span>
              </div>
            </div>

            {/* New Task Button */}
            <button
              id="btn-add-todo"
              className="btn-primary"
              onClick={onOpenAddModal}
            >
              <Plus size={18} />
              <span>New Task</span>
            </button>

            {/* Logout Button */}
            <button
              id="btn-logout"
              className="btn-logout"
              onClick={handleLogout}
              title="Log out of current session"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="header-auth-buttons">
            <button
              id="btn-header-login"
              className="btn-auth-outline"
              onClick={() => onOpenAuthModal('login')}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button
              id="btn-header-signup"
              className="btn-primary"
              onClick={() => onOpenAuthModal('signup')}
            >
              <User size={16} />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
