'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Drone, {
        as: 'drone', 
        foreignKey: 'droneId'
      });

      this.belongsTo(models.Order, {
        as: 'order', 
        foreignKey: 'orderId'
      });
    }
  }

  Delivery.init({
    status: DataTypes.STRING,
    orderId: DataTypes.INTEGER,
    droneId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Delivery',
    tableName: 'deliveries'
  });

  return Delivery;
};
