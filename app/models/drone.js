'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Drone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.User, {
        foreignKey: 'userableId',
        constraints: false,
        scope: {
          userableType: 'Drone'
        },
        as: 'user'
      });

      this.hasMany(models.DroneLocation, {
        as: 'locations',
         foreignKey: 'droneId'
      });

      this.hasMany(models.Delivery, {
        as: 'deliveries',
         foreignKey: 'droneId'
      });
    }
  }

  Drone.init({
    status: DataTypes.STRING,
    model: DataTypes.STRING,
    number: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Drone',
    tableName: 'drones'
  });

  return Drone;
};
