const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// Registration endpoints
router.post("/signup", authController.signup);
router.post("/register", authController.signup);

// Login endpoint
router.post("/login", authController.login);

// Refresh token endpoint (called every 7 mins or on demand)
router.post("/refresh", authController.refreshToken);
router.post("/refresh-token", authController.refreshToken);

// Forgot / Reset password endpoints
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Profile endpoint (protected)
router.get("/me", requireAuth, authController.getMe);

// Logout endpoint
router.post("/logout", authController.logout);

module.exports = router;
