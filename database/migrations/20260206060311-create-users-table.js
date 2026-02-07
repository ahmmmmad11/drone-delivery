'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userableType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      userableId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lastLogin: {
        allowNull: true,
        type: Sequelize.DATE
      },
      isActive: {
        allowNull: true,
        type: Sequelize.BOOLEAN
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

    await queryInterface.addIndex('users', ['userableType', 'userableId'], {
      name: 'users_userable_unique',
      unique: true,
      where: {
        userableType: {
          [Sequelize.Op.ne]: null
        },
        userableId: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Users', 'users_userable_unique');
    
    await queryInterface.dropTable('users');
  }
};
