'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemSendHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ItemSendHistory.init({
    sendId: DataTypes.INTEGER,
    receivedId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    status: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ItemSendHistory',
  });
  return ItemSendHistory;
};