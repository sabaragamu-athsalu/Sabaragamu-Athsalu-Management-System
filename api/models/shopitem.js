"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ShopItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ShopItem.belongsTo(models.Shop, {
        foreignKey: "shopId",
        as: "shop",
      });
      ShopItem.belongsTo(models.Product, {
        foreignKey: "id",
        as: "item",
      });

      ShopItem.belongsTo(models.Shop, {
        foreignKey: "fromId",
        as: "fromshop",
      });

      ShopItem.belongsTo(models.Product, {
        foreignKey: "itemId",
        as: "sendItem",
      });

      ShopItem.belongsTo(models.Product, {
        foreignKey: "itemId",
        as: "itemDetails",
      });

      

    }
  }
  ShopItem.init(
    {
      shopId: DataTypes.INTEGER,
      itemId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      status: DataTypes.STRING,
      lastreceivedquantity: DataTypes.INTEGER,
      fromId: DataTypes.INTEGER,
      fromType: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ShopItem",
    }
  );
  return ShopItem;
};
