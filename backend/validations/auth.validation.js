/**
 * Validation logic for Authentication operations
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSignup = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Request body must be a valid JSON object"],
    };
  }

  // Validate Name
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Full name is required");
  } else if (data.name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  } else if (data.name.trim().length > 100) {
    errors.push("Full name cannot exceed 100 characters");
  }

  // Validate Email
  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email address is required");
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push("Please provide a valid email address");
  } else if (data.email.trim().length > 254) {
    errors.push("Email address cannot exceed 254 characters");
  }

  // Validate Password
  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required");
  } else if (data.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  } else if (data.password.length > 100) {
    errors.push("Password cannot exceed 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLogin = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Request body must be a valid JSON object"],
    };
  }

  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email address is required");
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push("Please provide a valid email address");
  }

  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateForgotPassword = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Request body must be a valid JSON object"],
    };
  }

  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email address is required");
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push("Please provide a valid email address");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateResetPassword = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Request body must be a valid JSON object"],
    };
  }

  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email address is required");
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push("Please provide a valid email address");
  }

  if (!data.resetCode || typeof data.resetCode !== "string" || !data.resetCode.trim()) {
    errors.push("Reset code is required");
  }

  if (!data.newPassword || typeof data.newPassword !== "string") {
    errors.push("New password is required");
  } else if (data.newPassword.length < 6) {
    errors.push("New password must be at least 6 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
