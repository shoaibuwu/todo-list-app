'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('todos', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      title: { type: Sequelize.STRING(160), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'), allowNull: false, defaultValue: 'medium' },
      due_at: { type: Sequelize.DATE(3), allowNull: true },
      completed_at: { type: Sequelize.DATE(3), allowNull: true },
      created_at: { type: Sequelize.DATE(3), allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)') },
      updated_at: { type: Sequelize.DATE(3), allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)') },
      deleted_at: { type: Sequelize.DATE(3), allowNull: true }
    });

    await queryInterface.addIndex('todos', ['user_id', 'deleted_at', 'created_at'], { name: 'idx_todos_user_deleted_created' });
    await queryInterface.addIndex('todos', ['user_id', 'status', 'due_at'], { name: 'idx_todos_user_status_due' });
    await queryInterface.addIndex('todos', ['user_id', 'priority'], { name: 'idx_todos_user_priority' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('todos');
  }
};