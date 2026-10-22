const { Todo, User } = require("../models");

/**
 * Service to handle Todo business logic and database operations
 */
const createTodo = async (todoData, authUserId) => {
  const {
    userId,
    user_id,
    title,
    description,
    status = "pending",
    priority = "medium",
    dueAt,
    due_at,
  } = todoData;

  console.log("Data:-", todoData);

  let targetUserId = authUserId || userId || user_id;

  // Since this route runs with optional authentication:
  // If no userId is provided, find an existing user or create a default user
  // to satisfy the foreign key constraint on todos(user_id) -> users(id).
  if (!targetUserId) {
    let defaultUser = await User.findOne();
    if (!defaultUser) {
      defaultUser = await User.create({
        name: "Default User",
        email: "default@todo.local",
        password: "password123",
        role: "user",
        status: "active",
      });
    }
    targetUserId = defaultUser.id;
  } else {
    // If a specific userId was provided, verify it exists in the database
    const userExists = await User.findByPk(targetUserId);
    if (!userExists) {
      const error = new Error(`User with ID ${targetUserId} does not exist`);
      error.statusCode = 404;
      throw error;
    }
  }

  const createdTodo = await Todo.create({
    userId: targetUserId,
    title: title.trim(),
    description: description ? description.trim() : null,
    status,
    priority,
    dueAt: dueAt || due_at || null,
  });

  return createdTodo;
};

const getTodos = async (userId) => {
  const where = {};
  if (userId) {
    where.userId = userId;
  }
  const todos = await Todo.findAll({
    where,
    order: [["created_at", "DESC"]],
  });
  return todos;
};

const getTodoById = async (id) => {
  const todo = await Todo.findByPk(id);
  if (!todo) {
    const error = new Error(`tofo with ${id} is not found`);
    error.statusCode = 404;
    throw error;
  }
  return todo;
};
/**
 * Update an existing todo by ID
 */
const updateTodo = async (id, updateData) => {
  // find the todo
  const todo = await Todo.findByPk(id);
  if (!todo) {
    const error = new Error(`Todo wtih ${id} is not found`);
    error.statusCode = 404;
    throw error;
  }
  //  destructure fields that can be updated
  const { title, description, status, priority, dueAt, due_at } = updateData;

  const cleanString = (val) => (typeof val === "string" ? val.trim() : val);
  const updatedDueAt = dueAt !== undefined ? dueAt : due_at;

  // update the fields if provided
  await todo.update({
    title: title !== undefined ? cleanString(title) : todo.title,
    description:
      description !== undefined ? cleanString(description) : todo.description,
    status: status !== undefined ? cleanString(status) : todo.status,
    priority: priority !== undefined ? cleanString(priority) : todo.priority,
    dueAt: updatedDueAt !== undefined ? cleanString(updatedDueAt) : todo.dueAt,

    completedAt:
      status === "completed" ? new Date() : status ? null : todo.completedAt,
  });
  return todo;
};

const deleteTodo = async (id) => {
  const todo = await Todo.findByPk(id);
  if (!todo) {
    const error = new Error(`Todo wtih ${id} is not found`);
    error.statusCode = 404;
    throw error;
  }
  await todo.destroy();
  return todo;
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
};
