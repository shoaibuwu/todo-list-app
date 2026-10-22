const authService = require("../services/auth.service");
const {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require("../validations/auth.validation");

/**
 * Handle User Signup
 */
const signup = async (req, res) => {
  try {
    const validation = validateSignup(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0] || "Validation failed",
        errors: validation.errors,
      });
    }

    const data = await authService.signup(req.body);
    return res.status(201).json({
      success: true,
      message: "Account registered successfully",
      data,
    });
  } catch (error) {
    console.error("Signup error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to register account",
    });
  }
};

/**
 * Handle User Login
 */
const login = async (req, res) => {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0] || "Validation failed",
        errors: validation.errors,
      });
    }

    const data = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data,
    });
  } catch (error) {
    console.error("Login error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

/**
 * Handle Refresh Token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const data = await authService.refreshAccessToken(refreshToken);
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    const statusCode = error.statusCode || 401;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Session expired. Please log in again.",
    });
  }
};

/**
 * Request Password Reset Code
 */
const forgotPassword = async (req, res) => {
  try {
    const validation = validateForgotPassword(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0] || "Validation failed",
        errors: validation.errors,
      });
    }

    const data = await authService.requestPasswordReset(req.body.email);
    return res.status(200).json({
      success: true,
      message: "Verification code has been sent",
      data,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to process forgot password request",
    });
  }
};

/**
 * Reset Password with Verification Code
 */
const resetPassword = async (req, res) => {
  try {
    const validation = validateResetPassword(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0] || "Validation failed",
        errors: validation.errors,
      });
    }

    const result = await authService.resetPassword(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Reset password error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

/**
 * Get Current Authenticated User Profile
 */
const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to get user profile",
    });
  }
};

/**
 * Handle Logout
 */
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  signup,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
};
