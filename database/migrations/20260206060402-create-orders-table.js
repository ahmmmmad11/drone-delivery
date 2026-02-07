'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      creatorType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      creatorId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      originAddress: {
        allowNull: true,
        type: Sequelize.JSON
      },
      destinationAddress: {
        allowNull: true,
        type: Sequelize.JSON
      },
      originLocation: {
        allowNull: false,
        type: Sequelize.JSON
      },
      destinationLocation: {
        allowNull: false,
        type: Sequelize.JSON
      },
      currentLocation: {
        allowNull: false,
        type: Sequelize.JSON
      },
      reserved: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        default: false
      },
      collectedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deliveredAt: {
        allowNull: true,
        type: Sequelize.DATE
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};
