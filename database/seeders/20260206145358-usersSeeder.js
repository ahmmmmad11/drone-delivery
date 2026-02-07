'use strict';

const droneStatus = require('../../app/enums/droneStatues.js');


// this seeder can only work on a fresh database don't use it with exisiting data, it will casue problem because the relation is hard coded

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const admins = await queryInterface.bulkInsert('Admins', [
      {
        title: 'manager',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'supervisor',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });


    const drones = await queryInterface.bulkInsert('drones', [
      {
        status: droneStatus.ACTIVE,
        model: 'av1',
        number: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        status: droneStatus.ACTIVE,
        model: 'av2',
        number: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        status: droneStatus.BROKEN,
        model: 'av3',
        number: '3',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], { returning: true });

    const clients = await queryInterface.bulkInsert('clients', [
      {
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });


    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'admin 1',
        userableType: 'Admin',
        userableId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'admin 2',
        userableType: 'Admin',
        userableId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        name: 'client 1',
        userableType: 'Client',
        userableId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'client 2',
        userableType: 'Client',
        userableId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },


      {
        name: 'drone 1',
        userableType: 'Drone',
        userableId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'drone 2',
        userableType: 'Drone',
        userableId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'drone 3',
        userableType: 'Drone',
        userableId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], { returning: true });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
