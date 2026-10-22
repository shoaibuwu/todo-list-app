const todoService = require("../services/todo.service");
const { validateCreateTodo } = require("../validations/todo.validation");

/**
 * Controller to handle incoming HTTP requests for Todos
 */
const createTodo = async (req, res) => {
  try {
    // Validate request payload
    const validation = validateCreateTodo(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const todo = await todoService.createTodo(req.body, req.user?.id);

    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create todo",
    });
  }
};

/**
 * Controller to get all todos
 */
const getTodos = async (req, res) => {
  try {
    const todos = await todoService.getTodos(req.user?.id);
    return res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    console.log("Error while fecthing todos", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch todos"
    });
  }
};

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await todoService.getTodoById(id);
    return res.status(200).json({
      success: true,
      data: todo
    })


  }
  catch (error) {
    console.log("Error while fetching todo", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch todo"
    });

  }

}

/**
 * Controller to update a todo by ID
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateTodo = await todoService.updateTodo(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: updateTodo
    });
  } catch (error) {
    console.log("Error while updating todo", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "failed to update todo",
    });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await todoService.deleteTodo(id);
    return res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
      data: deleteTodo
    });
  } catch (error) {
    console.log("Error while deleting todo", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "failed to delete todo",
    });
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
};
