'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
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
          userableType: 'Admin'
        },
        as: 'user'
      });

      this.hasMany(models.Order, {
        foreignKey: 'creatorId',
        constraints: false,
        scope: {
          userableType: 'Admin'
        },
        as: 'orders'
      });
    }
  }

  Admin.init({
    title: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins'
  });

  return Admin;
};
