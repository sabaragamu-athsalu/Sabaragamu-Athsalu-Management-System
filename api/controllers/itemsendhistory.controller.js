const { where } = require("sequelize");
const models = require("../models");
const bcrypt = require("bcrypt");

function getAllItemSendHistoryShop(req, res) {
  models.ItemSendHistory.findAll({
    where: { type: "shoptoshop" },

    include: [
      {
        model: models.Shop,
        as: "Sender",
      },
      {
        model: models.Shop,
        as: "Receiver",
      },
      {
        model: models.Product,
        as: "Item",
      },
    ],
    order: [
      ["createdAt", "DESC"], // Sorting by updatedAt in descending order
    ],
  })
    .then((items) => {
      res.status(200).json({
        success: true,
        message: "Item Send History",
        data: items,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err,
      });
    });
}

module.exports = {
  getAllItemSendHistoryShop: getAllItemSendHistoryShop,
};
