'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.prototype.getUserable = function(options) {
        if (!this.creatorType) return Promise.resolve(null);
        const mixinMethodName = `get${this.creatorType}`;
        return this[mixinMethodName](options);
      };

      this.belongsTo(models.Client, {
        foreignKey: 'creatorId',
        constraints: false,
        as: 'client'
      });

      this.belongsTo(models.Admin, {
        foreignKey: 'creatorId',
        constraints: false,
        as: 'admin'
      });

      this.hasMany(models.Delivery, {
        as: 'deliveries',
        foreignKey: 'orderId'
      });
    }

    async collect() {
      this.status = 'collected';
      this.collectedAt = new Date();
      return this.save();
    }

    async deliver() {
      this.status = 'delivered';
      this.deliveredAt = new Date();
      return this.save();
    }
  }

  Order.init({
    status: DataTypes.STRING,
    creatorType: DataTypes.STRING,
    creatorId: DataTypes.INTEGER,
    originAddress: DataTypes.JSON,
    destinationAddress: DataTypes.JSON,
    originLocation: DataTypes.JSON,
    destinationLocation: DataTypes.JSON,
    collectedAt: DataTypes.DATE,
    deliveredAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders'
  });

  return Order;
};
