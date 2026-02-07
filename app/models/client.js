'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
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
          userableType: 'Client'
        },
        as: 'user'
      });

      this.hasMany(models.Order, {
        foreignKey: 'creatorId',
        constraints: false,
        scope: {
          userableType: 'Client'
        },
        as: 'orders'
      });
    }
  }

  Client.init({
    address: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'Client',
    tableName: 'clients'
  });

  return Client;
};
