'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('drone_locations', {
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
      location: {
        allowNull: false,
        type: Sequelize.JSON
      },
    });

    await queryInterface.addConstraint('drone_locations', {
      type: 'foreign key',
      fields: ['droneId'],
      references: {table: 'drones', field: 'id'}
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('drone_locations');
  }
};
