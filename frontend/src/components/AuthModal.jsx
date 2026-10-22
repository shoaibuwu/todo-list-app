import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  signupUser,
  requestResetCode,
  submitResetPassword,
  clearAuthMessages,
  clearResetFlow,
} from '../redux/authSlice';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  X,
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const dispatch = useDispatch();
  const { loading, authError, successMessage, logoutReason, resetFlow } = useSelector(
    (state) => state.auth
  );

  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'signup' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formValidationWarning, setFormValidationWarning] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFormValidationWarning('');
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    // Synchronize dev code into resetCode field for quick UX
    if (resetFlow.devCode) {
      setResetCode(resetFlow.devCode);
    }
    if (resetFlow.email) {
      setForgotEmail(resetFlow.email);
    }
  }, [resetFlow]);

  if (!isOpen) return null;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFormValidationWarning('');
    dispatch(clearAuthMessages());
  };

  // 1. Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormValidationWarning('');

    if (!loginEmail.trim() || !loginPassword) {
      setFormValidationWarning('Please enter both email and password.');
      return;
    }

    const result = await dispatch(
      loginUser({
        email: loginEmail.trim(),
        password: loginPassword,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      onClose();
    }
  };

  // 2. Submit Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setFormValidationWarning('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setFormValidationWarning('All fields are required.');
      return;
    }

    if (signupPassword.length < 6) {
      setFormValidationWarning('Password must be at least 6 characters.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setFormValidationWarning('Passwords do not match.');
      return;
    }

    const result = await dispatch(
      signupUser({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      })
    );

    if (signupUser.fulfilled.match(result)) {
      onClose();
    }
  };

  // 3. Request Password Reset Code
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setFormValidationWarning('');

    if (!forgotEmail.trim()) {
      setFormValidationWarning('Please enter your email address.');
      return;
    }

    await dispatch(requestResetCode(forgotEmail.trim()));
  };

  // 4. Submit Password Reset
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setFormValidationWarning('');

    if (!resetCode.trim() || !newPassword) {
      setFormValidationWarning('Please enter the verification code and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setFormValidationWarning('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormValidationWarning('Passwords do not match.');
      return;
    }

    const result = await dispatch(
      submitResetPassword({
        email: forgotEmail.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      })
    );

    if (submitResetPassword.fulfilled.match(result)) {
      // Clear and return to login tab
      setTimeout(() => {
        dispatch(clearResetFlow());
        setActiveTab('login');
        setLoginEmail(forgotEmail);
      }, 1500);
    }
  };

  // Quick fill demo credentials
  const fillDemoCredentials = () => {
    setLoginEmail('default@todo.local');
    setLoginPassword('password123');
    setFormValidationWarning('');
  };

  // Calculate password strength indicator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 3, label: 'Good', color: '#38bdf8' };
    return { score: 4, label: 'Strong', color: '#10b981' };
  };

  const signupStrength = getPasswordStrength(signupPassword);

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 999 }}>
      <div
        className="auth-modal-card animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header Badges & Close Button */}
        <div className="auth-card-topbar">
          <div className="auth-feature-pill">
            <ShieldCheck size={14} className="feature-pill-icon" />
            <span>JWT Auth • 7m Refresh • 2-Day Active Session</span>
          </div>

          <button
            type="button"
            className="auth-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Alerts: Timeout Reason / Errors / Success */}
        {logoutReason && (
          <div className="auth-alert auth-alert-warning animate-fade-in">
            <Clock size={16} className="alert-icon" />
            <span>{logoutReason}</span>
          </div>
        )}

        {(authError || formValidationWarning) && (
          <div className="auth-alert auth-alert-error animate-fade-in">
            <AlertCircle size={16} className="alert-icon" />
            <span>{authError || formValidationWarning}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert auth-alert-success animate-fade-in">
            <CheckCircle2 size={16} className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs (Sign In / Sign Up) */}
        {activeTab !== 'forgot' ? (
          <div className="auth-nav-tabs">
            <button
              id="tab-btn-login"
              type="button"
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              Sign In
            </button>
            <button
              id="tab-btn-signup"
              type="button"
              className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('signup')}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="auth-forgot-header">
            <button
              type="button"
              className="auth-back-link"
              onClick={() => handleTabSwitch('login')}
            >
              ← Back to Sign In
            </button>
            <h2 className="auth-section-title">Reset Your Password</h2>
            <p className="auth-section-desc">
              Enter your email to receive a secure 6-digit verification code.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: LOGIN FORM */}
        {/* ========================================================================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form-body animate-fade-in">
            <div className="auth-input-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <button
                  id="btn-forgot-password-link"
                  type="button"
                  className="auth-link-subtle"
                  onClick={() => handleTabSwitch('forgot')}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-options-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Stay logged in for 2 days (7m auto-lock on idle)</span>
              </label>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Demo Quick Fill */}
            <div className="auth-demo-box">
              <div className="auth-demo-text">
                <Sparkles size={14} className="text-amber-400" />
                <span>Want to test quickly?</span>
              </div>
              <button
                id="btn-fill-demo"
                type="button"
                className="btn-demo-fill"
                onClick={fillDemoCredentials}
              >
                Fill Demo Account (default@todo.local)
              </button>
            </div>

            <div className="auth-footer-prompt">
              <span>Don't have an account yet?</span>
              <button
                type="button"
                className="auth-link-bold"
                onClick={() => handleTabSwitch('signup')}
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SIGN UP FORM */}
        {/* ========================================================================= */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="auth-form-body animate-fade-in">
            <div className="auth-input-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Alex Morgan"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="signup-email">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="alex@company.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength bar */}
              {signupPassword.length > 0 && (
                <div className="password-strength-container">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="strength-step"
                        style={{
                          backgroundColor:
                            step <= signupStrength.score ? signupStrength.color : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: signupStrength.color }}>
                    {signupStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-input-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-signup"
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="auth-footer-prompt">
              <span>Already have an account?</span>
              <button
                type="button"
                className="auth-link-bold"
                onClick={() => handleTabSwitch('login')}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FORGOT / RESET PASSWORD */}
        {/* ========================================================================= */}
        {activeTab === 'forgot' && (
          <div className="auth-form-body animate-fade-in">
            {!resetFlow.codeSent ? (
              <form onSubmit={handleForgotRequestSubmit}>
                <div className="auth-input-group">
                  <label htmlFor="forgot-email">Account Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter registered email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  id="btn-request-reset-code"
                  type="submit"
                  className="btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Generating code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit}>
                {/* Code display banner */}
                <div className="auth-code-chip">
                  <KeyRound size={16} />
                  <span>
                    Verification Code:{' '}
                    <strong className="code-highlight">{resetFlow.devCode}</strong>
                  </span>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="reset-code">6-Digit Verification Code</label>
                  <div className="auth-input-wrapper">
                    <KeyRound size={18} className="auth-input-icon" />
                    <input
                      id="reset-code"
                      type="text"
                      placeholder="e.g. 123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="reset-new-password">New Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="reset-confirm-password">Confirm New Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-new-password"
                  type="submit"
                  className="btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="auth-footer-prompt">
              <span>Remembered password?</span>
              <button
                type="button"
                className="auth-link-bold"
                onClick={() => handleTabSwitch('login')}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
