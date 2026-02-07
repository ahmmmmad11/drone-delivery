'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      droneId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      orderId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      location: {
        allowNull: true,
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('deliveries', {
      type: 'foreign key',
      fields: ['droneId'],
      references: {table: 'drones', field: 'id'}
    });

    await queryInterface.addConstraint('deliveries', {
      type: 'foreign key',
      fields: ['orderId'],
      references: {table: 'orders', field: 'id'}
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('deliveries');
  }
};
