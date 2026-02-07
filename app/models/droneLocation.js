'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DroneLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Drone, {
        as: 'drone', 
        foreignKey: 'droneId'
      });
    }
  }

  DroneLocation.init({
    droneId: DataTypes.INTEGER,
    location: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'DroneLocation',
    tableName: 'drone_locations',
    timestamps: false,
  });

  return DroneLocation;
};
