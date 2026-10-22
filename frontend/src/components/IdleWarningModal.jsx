import React from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';

export default function IdleWarningModal({ onStayActive, onLogout }) {
  const { idleRemainingSeconds, idleWarningModalOpen } = useSelector((state) => state.auth);

  if (!idleWarningModalOpen) return null;

  const minutes = Math.floor(idleRemainingSeconds / 60);
  const seconds = idleRemainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progressPercent = Math.min(100, Math.max(0, (idleRemainingSeconds / 60) * 100));

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
      <div
        className="modal-container idle-warning-card animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="idle-warning-title"
      >
        <div className="idle-warning-icon-wrapper">
          <AlertTriangle className="idle-warning-icon" size={32} />
        </div>

        <div className="idle-warning-content">
          <h2 id="idle-warning-title" className="idle-warning-title">
            Inactivity Timeout Warning
          </h2>
          <p className="idle-warning-desc">
            You have been inactive for over 6 minutes. For your security, your session will automatically
            lock and log you out.
          </p>

          <div className="idle-countdown-box">
            <Clock size={20} className="countdown-icon" />
            <div className="countdown-time-wrap">
              <span className="countdown-label">Auto-logout in</span>
              <span className="countdown-time">{formattedTime}</span>
            </div>
          </div>

          <div className="idle-progress-track">
            <div
              className="idle-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="idle-note">
            Moving your mouse, pressing any key, or clicking below will immediately keep you signed in.
          </p>
        </div>

        <div className="idle-warning-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onLogout}
          >
            Log Out Now
          </button>
          <button
            type="button"
            className="btn-primary btn-stay-active"
            onClick={onStayActive}
          >
            <span>I'm Still Here</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
