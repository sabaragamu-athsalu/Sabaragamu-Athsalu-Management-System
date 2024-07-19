const models = require("../models");
const bcrypt = require("bcrypt");
const errorHandler = require("../utils/error");
const { get } = require("../routes/user.route");
const { where } = require("sequelize");

// I need to displaye item name and count of items sold
function getmostsellingitems(req, res) {
  models.CustomerBuyItem.findAll({
    where: { shopId: req.params.sellerId },

    attributes: ["itemId", [models.sequelize.fn("COUNT", "itemId"), "count"]],
    group: ["itemId"],
    order: [[models.sequelize.fn("COUNT", "itemId"), "DESC"]],
    limit: 5,
    include: [
      {
        model: models.Product,
        as: "Product",
        attributes: ["itemName"],
      },
    ],
  })
    .then((items) => {
      res.status(200).json({
        success: true,
        message: "Most Selling Items",
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

function gethighestqtysellingitems(req, res) {
  models.CustomerBuyItem.findAll({
    where: { shopId: req.params.sellerId },

    attributes: [
      "itemId",
      [
        models.sequelize.fn("sum", models.sequelize.col("quantity")),
        "totalQty",
      ],
    ],
    group: ["itemId"],
    order: [
      [models.sequelize.fn("sum", models.sequelize.col("quantity")), "DESC"],
    ],
    limit: 5,

    include: [
      {
        model: models.Product,
        as: "Product",
        attributes: ["itemName"],
      },
    ],
  })
    .then((items) => {
      res.status(200).json({
        success: true,
        message: "Highest Quantity Selling Items",
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
  getmostsellingitems: getmostsellingitems,
  gethighestqtysellingitems: gethighestqtysellingitems,
};
