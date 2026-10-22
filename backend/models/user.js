module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      status: {
        type: DataTypes.ENUM("active", "disabled", "pending"),
        allowNull: false,
        defaultValue: "active",
      },
      emailVerifiedAt: {
        type: DataTypes.DATE(3),
        allowNull: true,
        field: "email_verified_at",
      },
      lastLoginAt: {
        type: DataTypes.DATE(3),
        allowNull: true,
        field: "last_login_at",
      },
    },
    {
      tableName: "users",
      underscored: true, // createdAt -> created_at
      paranoid: true, // delete karne par deleted_at bharta hai, row nahi hatti
      defaultScope: {
        attributes: { exclude: ["password"] }, // password kabhi galti se bahar nahi jayega
      },
      scopes: {
        withPassword: {}, // login ke waqt: User.scope('withPassword').findOne(...)
      },
    },
  );

  return User;
};
