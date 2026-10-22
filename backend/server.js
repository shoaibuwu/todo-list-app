const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const pool = require("./config/database");
const todoRoutes = require("./routes/todo.routes");
const authRoutes = require("./routes/auth.routes");
const terminalLogger = require("./middlewares/logger.middleware");

const app = express();

app.use(express.json()); // lets Express read JSON from the client

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Beautiful colored terminal logger for all API actions
app.use(terminalLogger);

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Todo API is running. The React frontend is available at http://localhost:5173",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      todos: "/api/v1/todos",
    },
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/v1/todos", todoRoutes);
app.use("/todos", todoRoutes);

// Test route: asks the database "are you there?"
app.get("/api/v1/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "API and database are working" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database not reachable" });
  }
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
