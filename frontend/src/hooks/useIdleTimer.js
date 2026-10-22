import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  refreshUserToken,
  setIdleRemainingSeconds,
  setIdleWarningModal,
} from '../redux/authSlice';

// 7 minutes in milliseconds
const IDLE_LIMIT_MS = 7 * 60 * 1000;
// Warning threshold: show warning when 60 seconds remain (at 6 minutes idle)
const WARNING_THRESHOLD_MS = 6 * 60 * 1000;
// Refresh token interval while active (every 6.5 minutes)
const AUTO_REFRESH_INTERVAL_MS = 6.5 * 60 * 1000;

export function useIdleTimer() {
  const dispatch = useDispatch();
  const { isAuthenticated, idleWarningModalOpen } = useSelector((state) => state.auth);

  const lastActivityRef = useRef(0);
  const lastRefreshRef = useRef(0);
  const throttleTimerRef = useRef(null);

  // Reset user activity
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('taskflow_last_active', lastActivityRef.current.toString());

    if (idleWarningModalOpen) {
      dispatch(setIdleWarningModal(false));
    }
  }, [dispatch, idleWarningModalOpen]);

  // Throttled event listener callback
  const handleUserActivity = useCallback(() => {
    if (!isAuthenticated) return;

    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        resetActivity();
        throttleTimerRef.current = null;
      }, 1000); // Throttle activity updates to once per second for high performance
    }
  }, [isAuthenticated, resetActivity]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!lastActivityRef.current) lastActivityRef.current = Date.now();
    if (!lastRefreshRef.current) lastRefreshRef.current = Date.now();

    // Synchronize last active timestamp from storage
    const storedActive = localStorage.getItem('taskflow_last_active');
    if (storedActive) {
      const parsed = parseInt(storedActive, 10);
      if (!isNaN(parsed) && Date.now() - parsed < IDLE_LIMIT_MS) {
        lastActivityRef.current = parsed;
      }
    }

    // Attach user activity listeners
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
      'pointermove',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // 1-second interval to check idle timeout
    const ticker = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const remainingMs = IDLE_LIMIT_MS - elapsed;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      dispatch(setIdleRemainingSeconds(remainingSec));

      // Check if idle reached 7 minutes
      if (elapsed >= IDLE_LIMIT_MS) {
        dispatch(
          logout('Session timed out: You were automatically logged out due to 7 minutes of inactivity.')
        );
        return;
      }

      // Check if warning threshold reached (6 minutes idle -> 60s warning countdown)
      if (elapsed >= WARNING_THRESHOLD_MS) {
        dispatch(setIdleWarningModal(true));
      } else {
        if (idleWarningModalOpen) {
          dispatch(setIdleWarningModal(false));
        }
      }

      // Auto-refresh token if active and interval reached (refresh every 6.5 minutes)
      if (now - lastRefreshRef.current >= AUTO_REFRESH_INTERVAL_MS) {
        lastRefreshRef.current = now;
        dispatch(refreshUserToken());
      }
    }, 1000);

    // Listen to session expired event from axios interceptor
    const handleSessionExpired = (e) => {
      const reason = e?.detail?.reason || 'Session expired. Please log in again.';
      dispatch(logout(reason));
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      window.removeEventListener('auth:session_expired', handleSessionExpired);
      clearInterval(ticker);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [isAuthenticated, idleWarningModalOpen, dispatch, handleUserActivity]);

  return { resetActivity };
}
