import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  CheckSquare,
  Zap,
  Database,
} from 'lucide-react';

export default function AuthPage({ initialMode = 'login' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isAuthenticated,
    loading,
    authError,
    successMessage,
    logoutReason,
    resetFlow,
  } = useSelector((state) => state.auth);

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [validationWarning, setValidationWarning] = useState('');

  // Sync mode from props if URL route changes
  useEffect(() => {
    setMode(initialMode);
    setValidationWarning('');
    dispatch(clearAuthMessages());
  }, [initialMode, dispatch]);

  // If already logged in, redirect to Todo Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auto-populate generated reset code in development
  useEffect(() => {
    if (resetFlow.devCode) {
      setResetCode(resetFlow.devCode);
    }
    if (resetFlow.email) {
      setForgotEmail(resetFlow.email);
    }
  }, [resetFlow]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setValidationWarning('');
    dispatch(clearAuthMessages());
    if (newMode === 'login') navigate('/login');
    else if (newMode === 'signup') navigate('/signup');
    else if (newMode === 'forgot') navigate('/forgot-password');
  };

  // 1. Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setValidationWarning('');

    if (!loginEmail.trim() || !loginPassword) {
      setValidationWarning('Please enter both your email address and password.');
      return;
    }

    const result = await dispatch(
      loginUser({
        email: loginEmail.trim(),
        password: loginPassword,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  // 2. Signup Handler (Saves user credentials into MySQL)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setValidationWarning('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setValidationWarning('All fields are required.');
      return;
    }

    if (signupPassword.length < 6) {
      setValidationWarning('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setValidationWarning('Passwords do not match.');
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
      navigate('/', { replace: true });
    }
  };

  // 3. Request Password Reset Code
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setValidationWarning('');

    if (!forgotEmail.trim()) {
      setValidationWarning('Please enter your registered email address.');
      return;
    }

    await dispatch(requestResetCode(forgotEmail.trim()));
  };

  // 4. Submit New Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setValidationWarning('');

    if (!resetCode.trim() || !newPassword) {
      setValidationWarning('Please enter the 6-digit code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setValidationWarning('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setValidationWarning('Passwords do not match.');
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
      setTimeout(() => {
        dispatch(clearResetFlow());
        switchMode('login');
        setLoginEmail(forgotEmail);
      }, 1500);
    }
  };

  // Demo user shortcut
  const fillDemoAccount = () => {
    setLoginEmail('default@todo.local');
    setLoginPassword('password123');
    setValidationWarning('');
  };

  // Password strength calculator
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
    <div className="auth-page-container">
      {/* Background radial glows */}
      <div className="auth-bg-glow glow-1"></div>
      <div className="auth-bg-glow glow-2"></div>

      <div className="auth-page-content">
        {/* Left Side: Brand Showcase & Features */}
        <div className="auth-hero-column">
          <div className="auth-hero-brand">
            <div className="brand-icon-wrapper-large">
              <CheckSquare size={34} className="text-white" />
            </div>
            <div>
              <div className="brand-title-row">
                <span className="auth-brand-name">TaskFlow</span>
                <span className="brand-badge">Fullstack</span>
              </div>
              <p className="auth-brand-tagline">
                Next-Gen Task Management with Enterprise JWT Session Security
              </p>
            </div>
          </div>

          <div className="auth-feature-cards">
            <div className="auth-feature-card">
              <div className="feature-icon-box box-blue">
                <ShieldCheck size={20} />
              </div>
              <div className="feature-card-text">
                <h4>7-Minute JWT Auto-Refresh</h4>
                <p>
                  Tokens are continuously and silently renewed every 6.5 minutes while you're active
                  to keep your session seamlessly alive.
                </p>
              </div>
            </div>

            <div className="auth-feature-card">
              <div className="feature-icon-box box-purple">
                <Zap size={20} />
              </div>
              <div className="feature-card-text">
                <h4>2-Day Active Session</h4>
                <p>
                  Stay securely authenticated across reloads and browsing sessions for up to 48
                  hours without frequent re-logins.
                </p>
              </div>
            </div>

            <div className="auth-feature-card">
              <div className="feature-icon-box box-amber">
                <Clock size={20} />
              </div>
              <div className="feature-card-text">
                <h4>7-Minute Inactivity Auto-Lock</h4>
                <p>
                  If mouse movement or typing is idle for 7 minutes, your session automatically
                  locks to protect your workspace.
                </p>
              </div>
            </div>

            <div className="auth-feature-card">
              <div className="feature-icon-box box-emerald">
                <Database size={20} />
              </div>
              <div className="feature-card-text">
                <h4>MySQL Relational Storage</h4>
                <p>
                  Your credentials and tasks are safely stored in MySQL with bcrypt password hashing
                  and user-scoped relational integrity.
                </p>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span>MySQL 8.0</span>
            <span>•</span>
            <span>Node Express</span>
            <span>•</span>
            <span>React 19 + Redux Toolkit</span>
          </div>
        </div>

        {/* Right Side: Standalone Authentication Card */}
        <div className="auth-card-column">
          <div className="auth-main-card">
            {/* Top Security Pill */}
            <div className="auth-card-header">
              <div className="auth-security-chip">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>JWT • 7m Refresh • 2d Session • 7m Auto-Lock</span>
              </div>
            </div>

            {/* Inactivity Logout / Error / Success Alerts */}
            {logoutReason && (
              <div className="auth-alert auth-alert-warning animate-fade-in">
                <Clock size={18} className="alert-icon" />
                <span>{logoutReason}</span>
              </div>
            )}

            {(authError || validationWarning) && (
              <div className="auth-alert auth-alert-error animate-fade-in">
                <AlertCircle size={18} className="alert-icon" />
                <span>{authError || validationWarning}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-alert auth-alert-success animate-fade-in">
                <CheckCircle2 size={18} className="alert-icon" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Navigation Tabs (Sign In / Create Account) */}
            {mode !== 'forgot' ? (
              <div className="auth-nav-tabs">
                <button
                  id="tab-btn-signin"
                  type="button"
                  className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => switchMode('login')}
                >
                  Sign In
                </button>
                <button
                  id="tab-btn-create-account"
                  type="button"
                  className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => switchMode('signup')}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="auth-forgot-header">
                <button
                  type="button"
                  className="auth-back-link"
                  onClick={() => switchMode('login')}
                >
                  ← Back to Sign In
                </button>
                <h2 className="auth-section-title">Reset Your Password</h2>
                <p className="auth-section-desc">
                  Enter your email address to receive a 6-digit verification code.
                </p>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 1: LOGIN FORM */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-form-body animate-fade-in">
                <div className="auth-input-group">
                  <label htmlFor="auth-email">Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="e.g. alex@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <div className="auth-label-row">
                    <label htmlFor="auth-password">Password</label>
                    <button
                      id="btn-forgot-password"
                      type="button"
                      className="auth-link-subtle"
                      onClick={() => switchMode('forgot')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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
                    <span>Stay logged in for 2 days (auto-locks after 7m idle)</span>
                  </label>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  className="btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Authenticating with MySQL...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Quick Demo Fill Shortcut */}
                <div className="auth-demo-box">
                  <div className="auth-demo-text">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Quick Test Account (MySQL Seeded)</span>
                  </div>
                  <button
                    id="btn-fill-demo-account"
                    type="button"
                    className="btn-demo-fill"
                    onClick={fillDemoAccount}
                  >
                    Click to fill: <strong>default@todo.local</strong> /{' '}
                    <strong>password123</strong>
                  </button>
                </div>

                <div className="auth-footer-prompt">
                  <span>Don't have an account yet?</span>
                  <button
                    type="button"
                    className="auth-link-bold"
                    onClick={() => switchMode('signup')}
                  >
                    Create one now
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: SIGN UP FORM */}
            {/* ========================================================================= */}
            {mode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="auth-form-body animate-fade-in">
                <div className="auth-input-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-input-icon" />
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="e.g. Sarah Connor"
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
                      placeholder="e.g. sarah@company.com"
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
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {signupPassword.length > 0 && (
                    <div className="password-strength-container">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className="strength-step"
                            style={{
                              backgroundColor:
                                step <= signupStrength.score
                                  ? signupStrength.color
                                  : 'rgba(255,255,255,0.1)',
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
                      placeholder="Re-enter your password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      autoComplete="new-password"
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
                  id="btn-signup-submit"
                  type="submit"
                  className="btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Saving to MySQL Database...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Open Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="auth-footer-prompt">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="auth-link-bold"
                    onClick={() => switchMode('login')}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: FORGOT & RESET PASSWORD */}
            {/* ========================================================================= */}
            {mode === 'forgot' && (
              <div className="auth-form-body animate-fade-in">
                {!resetFlow.codeSent ? (
                  <form onSubmit={handleForgotRequestSubmit}>
                    <div className="auth-input-group">
                      <label htmlFor="forgot-email">Account Email Address</label>
                      <div className="auth-input-wrapper">
                        <Mail size={18} className="auth-input-icon" />
                        <input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your registered email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      id="btn-request-code"
                      type="submit"
                      className="btn-primary auth-submit-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Generating verification code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send 6-Digit Verification Code</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit}>
                    {/* Dev helper displaying the 6-digit code */}
                    <div className="auth-code-chip">
                      <KeyRound size={16} />
                      <span>
                        Verification Code:{' '}
                        <strong className="code-highlight">{resetFlow.devCode}</strong>
                      </span>
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="reset-code-input">6-Digit Verification Code</label>
                      <div className="auth-input-wrapper">
                        <KeyRound size={18} className="auth-input-icon" />
                        <input
                          id="reset-code-input"
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
                      <label htmlFor="new-password-input">New Password</label>
                      <div className="auth-input-wrapper">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                          id="new-password-input"
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
                      <label htmlFor="confirm-new-password">Confirm New Password</label>
                      <div className="auth-input-wrapper">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                          id="confirm-new-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter new password"
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
                      id="btn-submit-reset"
                      type="submit"
                      className="btn-primary auth-submit-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Updating in MySQL Database...</span>
                        </>
                      ) : (
                        <>
                          <span>Save New Password</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="auth-footer-prompt">
                  <span>Remember your password?</span>
                  <button
                    type="button"
                    className="auth-link-bold"
                    onClick={() => switchMode('login')}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
