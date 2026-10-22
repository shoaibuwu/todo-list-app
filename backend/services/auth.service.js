const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

// In-memory store for password reset codes (email -> { code, expiresAt })
const resetCodeStore = new Map();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_access_key_todo_flow_2026!";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7m";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "super_secret_jwt_refresh_key_todo_flow_2d_2026!";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "2d";

/**
 * Generate a short-lived access token (7 minutes)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Generate a long-lived refresh token (2 days)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      tokenType: "refresh",
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

/**
 * Register a new user
 */
const signup = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    const error = new Error("An account with this email address already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
    status: "active",
    lastLoginAt: new Date(),
  });

  const userSafe = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
  };

  const accessToken = generateAccessToken(userSafe);
  const refreshToken = generateRefreshToken(userSafe);

  return {
    user: userSafe,
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
    sessionDuration: REFRESH_TOKEN_EXPIRES_IN,
  };
};

/**
 * Log in an existing user
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Retrieve user including password
  const user = await User.scope("withPassword").findOne({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "active") {
    const error = new Error("Your account is currently disabled. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  // Check bcrypt hash or legacy plaintext match fallback
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, user.password);
  } catch (err) {
    isPasswordValid = false;
  }

  // Fallback for legacy seeded/plain passwords like "password123"
  if (!isPasswordValid && user.password === password) {
    isPasswordValid = true;
    // Upgrade password to bcrypt hash in DB
    const upgradedHash = await bcrypt.hash(password, 10);
    await user.update({ password: upgradedHash });
  }

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Update last login timestamp
  await user.update({ lastLoginAt: new Date() });

  const userSafe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  const accessToken = generateAccessToken(userSafe);
  const refreshToken = generateRefreshToken(userSafe);

  return {
    user: userSafe,
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
    sessionDuration: REFRESH_TOKEN_EXPIRES_IN,
  };
};

/**
 * Refresh access token using valid 2-day refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (err) {
    const error = new Error("Session expired or refresh token invalid. Please log in again.");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findByPk(decoded.id);
  if (!user || user.status !== "active") {
    const error = new Error("User session is no longer active");
    error.statusCode = 401;
    throw error;
  }

  const userSafe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  const newAccessToken = generateAccessToken(userSafe);

  return {
    user: userSafe,
    accessToken: newAccessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
  };
};

/**
 * Generate password reset code
 */
const requestPasswordReset = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    const error = new Error("No account found with this email address");
    error.statusCode = 404;
    throw error;
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  resetCodeStore.set(normalizedEmail, { code, expiresAt });

  return {
    message: "Password reset code generated successfully",
    email: normalizedEmail,
    resetCode: code, // returned for seamless user experience/testing in UI
    expiresInMinutes: 15,
  };
};

/**
 * Reset password using the code
 */
const resetPassword = async ({ email, resetCode, newPassword }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const record = resetCodeStore.get(normalizedEmail);

  if (!record) {
    const error = new Error("No active password reset request found for this email. Please request a new code.");
    error.statusCode = 400;
    throw error;
  }

  if (Date.now() > record.expiresAt) {
    resetCodeStore.delete(normalizedEmail);
    const error = new Error("Password reset code has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  if (record.code !== resetCode.trim()) {
    const error = new Error("Invalid password reset code. Please check and try again.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  // Delete used reset code
  resetCodeStore.delete(normalizedEmail);

  return {
    success: true,
    message: "Your password has been successfully reset! You can now log in with your new password.",
  };
};

/**
 * Fetch current user profile
 */
const getMe = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  getMe,
};
