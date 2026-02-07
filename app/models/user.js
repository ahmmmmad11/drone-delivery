'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.prototype.getUserable = function(options) {
        if (!this.userableType) return Promise.resolve(null);
        const mixinMethodName = `get${this.userableType}`;
        return this[mixinMethodName](options);
      };

      // Association methods for each possible userable type
      this.belongsTo(models.Drone, {
        foreignKey: 'userableId',
        constraints: false,
        as: 'drone'
      });

      this.belongsTo(models.Client, {
        foreignKey: 'userableId',
        constraints: false,
        as: 'client'
      });

      this.belongsTo(models.Admin, {
        foreignKey: 'userableId',
        constraints: false,
        as: 'admin'
      });
    }
  }

  User.init({
    name: DataTypes.STRING,
    userableType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Drone', 'Client', 'Admin']] // Add all possible types
      }
    },
    userableId: DataTypes.INTEGER,
    lastLogin: DataTypes.DATE,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });

  return User;
};
