'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(254), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
      status: { type: Sequelize.ENUM('active', 'disabled', 'pending'), allowNull: false, defaultValue: 'active' },
      email_verified_at: { type: Sequelize.DATE(3), allowNull: true },
      last_login_at: { type: Sequelize.DATE(3), allowNull: true },
      created_at: { type: Sequelize.DATE(3), allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)') },
      updated_at: { type: Sequelize.DATE(3), allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)') },
      deleted_at: { type: Sequelize.DATE(3), allowNull: true }
    });

    await queryInterface.addIndex('users', ['status'], { name: 'idx_users_status' });
    await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};