const e = require("express");
const models = require("../models");
const { parse } = require("dotenv");
const { StoreKeeper, Store, StoreItem, Product } = require("../models");
const { where } = require("sequelize");

function sendStoreItemoShop(req, res) {
  try {
    const { id, shopId, itemId } = req.params;
    console.log(
      `Parameters received - id: ${id}, shopId: ${shopId}, itemId: ${itemId}`
    );

    models.StoreItem.findOne({
      where: { storeid: id, itemId: itemId },
    })
      .then((dataX) => {
        if (!dataX) {
          res.status(404).json({
            success: false,
            message: "Store item not found",
          });
          return;
        }

        let quantity = parseInt(dataX.quantity) - parseInt(req.body.quantity);

        if (quantity < 0) {
          res.status(404).json({
            success: false,
            message: "Not enough quantity",
          });
          return;
        }

        return models.StoreItem.update(
          { quantity: quantity },
          { where: { storeid: id, itemId: itemId } }
        );
      })
      .then((updatedRows) => {
        if (updatedRows == 1) {
          return models.ShopItem.findOne({
            where: { shopId: shopId, itemId: itemId },
          });
        } else {
          throw new Error("Failed to update store item quantity");
        }
      })
      .then((dataB) => {
        if (dataB) {
          let quantity = parseInt(dataB.quantity) + parseInt(req.body.quantity);
          return models.ShopItem.update(
            { quantity: quantity },
            {
              where: {
                shopId: shopId,
                itemId: itemId,
              },
            }
          );
        } else {
          return models.ShopItem.create({
            shopId: shopId,
            itemId: itemId,
            quantity: req.body.quantity,
          });
        }
      })
      .then((data) => {
        res.status(200).json({
          success: true,
          message: data
            ? "Updated existing shop item"
            : "Created new shop item",
          shopItem: data,
        });
      })
      .catch((err) => {
        console.error("Error processing request:", err);
        res.status(500).json({ success: false, message: err.message });
      });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}



//Add data to storeitem table: if the store item is not already in the store, add it, else update the quantity
//only quantity can be updated
function addStoreItem(req, res) {
  try {
    models.StoreItem.findOne({
      where: { storeId: req.body.storeId, itemId: req.body.itemId },
    })
      .then((data) => {
        if (data != null) {
          quantity = parseInt(data.quantity) + parseInt(req.body.quantity);
          models.StoreItem.update(
            { quantity: quantity },
            { where: { storeId: req.body.storeId, itemId: req.body.itemId } }
          )
            .then((data) => {
              res.status(200).json({
                success: true,
                message: "Updated already existing store item",
                storeItem: data,
              });
            })
            .catch((err) => {
              console.error("Error adding store item:", err);
              res.status(500).json({ success: false, message: err });
            });
        } else {
          models.StoreItem.create(req.body)
            .then((data) => {
              res.status(200).json({
                success: true,
                message: "Created new store item",
                storeItem: data,
              });
            })
            .catch((err) => {
              console.error("Error adding store item:", err);
              res.status(500).json({ success: false, message: err });
            });
        }
      })
      .catch((err) => {
        console.error("Error fetching store item:", err);
        res.status(500).json({ success: false, message: err });
      });
  } catch (err) {
    console.error("Error adding store item:", err);
    res.status(500).json({ success: false, message: err });
  }
}

//Get data from storeitem table by id
function getStoresItemId(req, res) {
  models.StoreItem.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: models.Store,
        as: "store",
      },
      {
        model: models.Product,
        as: "item",

        include: [
          {
            model: models.Shop,
            as: "shop",
          },
        ],
      },
    ],
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Store item retrieved successfully",
        storeItem: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching store item:", err);
      res.status(500).json({ success: false, message: err });
    });
}

function getStoresItems(req, res) {
  models.StoreItem.findAll({
    where: { storeId: req.params.storeKeeperId },
    include: [
      {
        model: models.Store,
        as: "store",
      },
      {
        model: models.Product,
        as: "item",
      },
    ],
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Store items retrieved successfully",
        storeItems: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching store items:", err);
      res.status(500).json({ success: false, message: err });
    });
}

//update store item table by checking storeId and itemId and updating the quantity only
function updateStoreItem(req, res) {
  try {
    models.StoreItem.findOne({
      where: { storeId: req.body.storeId, itemId: req.body.itemId },
    })
      .then((data) => {
        if (data != null) {
          models.StoreItem.update(
            { quantity: req.body.quantity },
            { where: { storeId: req.body.storeId, itemId: req.body.itemId } }
          )
            .then((data) => {
              res.status(200).json({
                success: true,
                message: "Updated already existing store item",
                storeItem: data,
              });
            })
            .catch((err) => {
              console.error("Error updating store item:", err);
              res.status(500).json({ success: false, message: err });
            });
        } else {
          res.status(404).json({
            success: false,
            message: "Store item not found",
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching store item:", err);
        res.status(500).json({ success: false, message: err });
      });
  } catch (err) {
    console.error("Error updating store item:", err);
    res.status(500).json({ success: false, message: err });
  }
}

//Delete function storeitem table
function deleteStoreItem(req, res) {
  const id = req.params.id;
  models.StoreItem.destroy({
    where: { storeId: req.body.storeId, itemId: req.body.itemId },
  })
    .then((num) => {
      if (num == 1) {
        res.status(200).json({
          success: true,
          message: "Store item deleted successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Store item not found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Some error occurred",
        error: err,
      });
    });
}

module.exports = {
  getStoresItems: getStoresItems,
  getStoresItemId: getStoresItemId,
  sendStoreItemoShop: sendStoreItemoShop,
  updateStoreItem: updateStoreItem,
  deleteStoreItem: deleteStoreItem,
  addStoreItem: addStoreItem,
};
