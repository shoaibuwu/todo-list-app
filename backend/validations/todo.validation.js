/**
 * Validation logic for Todo operations
 */

const validateCreateTodo = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Request body must be a valid JSON object"],
    };
  }

  // Validate title
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.push("Title is required and must be a non-empty string");
  } else if (data.title.trim().length > 160) {
    errors.push("Title cannot exceed 160 characters");
  }

  // Validate status if provided
  const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  // Validate priority if provided
  const validPriorities = ["low", "medium", "high", "urgent"];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(", ")}`);
  }

  // Validate due date if provided
  const dueAt = data.dueAt || data.due_at;
  if (dueAt && isNaN(Date.parse(dueAt))) {
    errors.push("Due date must be a valid date or timestamp string");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateCreateTodo,
};
