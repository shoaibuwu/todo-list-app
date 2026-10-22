const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: "+00:00",
    logging: false,
  },
);

const User = require("./user")(sequelize, DataTypes);
const Todo = require("./todo")(sequelize, DataTypes);

User.hasMany(Todo, { foreignKey: "userId", as: "todos" });
Todo.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, User, Todo };
