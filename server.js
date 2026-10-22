const path = require("path");

// Switch directory to backend so all relative configs and paths work as expected
process.chdir(path.join(__dirname, "backend"));

// Run backend server
require("./backend/server.js");
