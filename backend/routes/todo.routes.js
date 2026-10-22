const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");
const { optionalAuth } = require("../middlewares/auth.middleware");

// Apply optionalAuth to all todo routes
router.use(optionalAuth);

// Create todo
router.post("/", todoController.createTodo);

// Get all todos (supports both GET / and GET /getall)
router.get("/", todoController.getTodos);
router.get("/getall", todoController.getTodos);

// Get a single todo by ID (supports both GET /:id and GET /get/:id)
router.get("/:id", todoController.getTodoById);
router.get("/get/:id", todoController.getTodoById);

// Update a todo by ID (supports both PUT /:id and PUT /update/:id)
router.put("/:id", todoController.updateTodo);
router.put("/update/:id", todoController.updateTodo);

// Delete a todo by ID (supports both DELETE /:id and DELETE /delete/:id)
router.delete("/:id", todoController.deleteTodo);
router.delete("/delete/:id", todoController.deleteTodo);

module.exports = router;
