const { sequelize, User, Todo } = require("./models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected");
    console.log("users count:", await User.count());
    console.log("todos count:", await Todo.count());
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    await sequelize.close();
  }
})();
