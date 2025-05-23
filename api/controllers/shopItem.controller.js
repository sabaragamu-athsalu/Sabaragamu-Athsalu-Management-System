const e = require("express");
const models = require("../models");
const { parse } = require("dotenv");
const { where } = require("sequelize");

function sendShopItemoShop(req, res) {
  const { shopId, itemId, fromId, fromShopId, quantity } = req.params;
  console.log(
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  );
  console.log(
    `Parameters received -  shopId: ${shopId}, itemId: ${itemId}, fromId: ${fromId}, fromShopId: ${fromShopId}, quantity: ${quantity}`
  );
  console.log(
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  );

  models.ShopItem.findOne({
    where: {
      shopId: req.params.shopId,
      itemId: req.params.itemId,
    },
  }).then((dataX) => {
    const quantity = parseInt(dataX.quantity) - parseInt(req.params.quantity);
    console.log("quantity: ", quantity);

    models.ShopItem.update(
      { quantity: parseInt(dataX.quantity) - parseInt(req.params.quantity) },
      {
        where: {
          shopId: req.params.shopId,
          itemId: req.params.itemId,
        },
      }
    )
      .then((data) => {
        if (data == 1) {
          models.ShopItem.findOne({
            where: {
              shopId: req.params.fromShopId,
              itemId: req.params.itemId,
            },
            include: [
              {
                model: models.Shop,
                as: "shop",
              },
              {
                model: models.Product,
                as: "item",
              },
            ],
          })
            .then((dataB) => {
              if (dataB != null) {
                const quantity =
                  parseInt(dataB.quantity) + parseInt(req.params.quantity);
                models.ShopItem.update(
                  {
                    quantity: quantity,
                    status: "pending",
                    lastreceivedquantity: req.params.quantity,
                    fromType: "shoptoshop",
                    fromId: req.params.shopId,
                  },
                  {
                    where: {
                      shopId: req.params.fromShopId,
                      itemId: req.params.itemId,
                    },
                  }
                )
                  .then((data) => {
                    models.ItemSendHistory.create({
                      sendId: req.params.shopId,
                      receivedId: req.params.fromShopId,
                      itemId: req.params.itemId,
                      quantity: req.params.quantity,
                      status: "pending",
                      type: "shoptoshop",
                    })
                      .then((data) => {
                        res.status(200).json({
                          success: true,
                          message: "Recorded item send history",
                          shopItem: data,
                        });
                      })
                      .catch((err) => {
                        console.error("Error sending shop item:", err);
                        res.status(500).json({ success: false, message: err });
                      });
                  })
                  .catch((err) => {
                    console.error("Error sending shop item:", err);
                    res.status(500).json({ success: false, message: err });
                  });
              } else {
                models.ShopItem.create({
                  shopId: req.params.fromShopId,
                  itemId: req.params.itemId,
                  quantity: req.params.quantity,
                  status: "pending",
                  lastreceivedquantity: req.params.quantity,
                  fromType: "shoptoshop",
                  fromId: req.params.shopId,
                })
                  .then((data) => {
                    models.ItemSendHistory.create({
                      sendId: req.params.shopId,
                      receivedId: req.params.fromShopId,
                      itemId: req.params.itemId,
                      quantity: req.params.quantity,
                      status: "pending",
                      type: "shoptoshop",
                    })
                      .then((data) => {
                        res.status(200).json({
                          success: true,
                          message: "Recorded item send history",
                          shopItem: data,
                        });
                      })
                      .catch((err) => {
                        console.error("Error sending shop item:", err);
                        res.status(500).json({ success: false, message: err });
                      });
                  })
                  .catch((err) => {
                    console.error("Error sending shop item:", err);
                    res.status(500).json({ success: false, message: err });
                  });
              }
            })
            .catch((err) => {
              console.error("Error fetching shop item:", err);
              res.status(500).json({ success: false, message: err });
            });
        } else {
          res.status(404).json({
            success: false,
            message: "Shop item not found",
          });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ success: false, message: "Some error occurred" });
      });
  });
}

function rejectShopItemoShop(req, res) {
  models.ShopItem.findOne({
    where: {
      shopId: req.params.shopId,
      itemId: req.params.itemId,
    },
  }).then((dataX) => {
    const quantity = parseInt(dataX.quantity) - parseInt(req.params.quantity);

    if (quantity < 0) {
      res.status(404).json({
        success: false,
        message: "Not enough quantity",
      });
      return;
    }

    models.ShopItem.update(
      {
        quantity: dataX.quantity - req.params.quantity,
        status: quantity == 0 ? "rejected" : "approved",
      },
      {
        where: {
          shopId: req.params.shopId,
          itemId: req.params.itemId,
        },
      }
    )
      .then((data) => {
        if (data == 1) {
          models.ShopItem.findOne({
            where: {
              shopId: req.params.fromId,
              itemId: req.params.itemId,
            },
            include: [
              {
                model: models.Shop,
                as: "shop",
              },
              {
                model: models.Product,
                as: "item",
              },
            ],
          })
            .then((dataB) => {
              if (dataB != null) {
                const quantity =
                  parseInt(dataB.quantity) + parseInt(req.params.quantity);
                models.ShopItem.update(
                  {
                    quantity: quantity,
                  },
                  {
                    where: {
                      shopId: req.params.fromId,
                      itemId: req.params.itemId,
                    },
                  }
                )
                  .then((data) => {
                    models.ItemSendHistory.update(
                      {
                        status: "rejected",
                      },
                      {
                        where: {
                          itemId: req.params.itemId,
                          sendId: req.params.fromId,
                          receivedId: req.params.shopId,
                          type: "shoptoshop",
                          status: "pending",
                          quantity: req.params.quantity,
                        },
                      }
                    )
                      .then((data) => {
                        res.status(200).json({
                          success: true,
                          message: "Shop item rejected successfully",
                          shopItem: data,
                        });
                      })
                      .catch((err) => {
                        console.error("Error rejecting shop item:", err);
                        res.status(500).json({ success: false, message: err });
                      });
                  })
                  .catch((err) => {
                    console.error("Error sending shop item:", err);
                    res.status(500).json({ success: false, message: err });
                  });
              } else {
                models.ShopItem.create({
                  shopId: req.params.fromId,
                  itemId: req.params.itemId,
                  quantity: req.params.quantity,
                })
                  .then((data) => {
                    models.ItemSendHistory.update(
                      {
                        status: "rejected",
                      },
                      {
                        where: {
                          itemId: req.params.itemId,
                          sendId: req.params.fromId,
                          receivedId: req.params.shopId,
                          type: "shoptoshop",
                          status: "pending",
                          quantity: req.params.quantity,
                        },
                      }
                    )
                      .then((data) => {
                        res.status(200).json({
                          success: true,
                          message: "Shop item rejected successfully",
                          shopItem: data,
                        });
                      })
                      .catch((err) => {
                        console.error("Error rejecting shop item:", err);
                        res.status(500).json({ success: false, message: err });
                      });
                  })
                  .catch((err) => {
                    console.error("Error sending shop item:", err);
                    res.status(500).json({ success: false, message: err });
                  });
              }
            })
            .catch((err) => {
              console.error("Error fetching shop item:", err);
              res.status(500).json({ success: false, message: err });
            });
        } else {
          res.status(404).json({
            success: false,
            message: "Shop item not found",
          });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ success: false, message: "Some error occurred" });
      });
  });
}

function getShopsItemId(req, res) {
  models.ShopItem.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: models.Shop,
        as: "shop",
      },
      {
        model: models.Product,
        as: "item",

        include: [
          {
            model: models.Store,
            as: "store",
          },
        ],
      },
    ],
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Shop item retrieved successfully",
        shopItem: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching shop item:", err);
      res.status(500).json({ success: false, message: err });
    });
}

function getShopsItems(req, res) {
  models.ShopItem.findAll({
    where: { shopId: req.params.sellerId },
    include: [
      {
        model: models.Shop,
        as: "shop",
      },
      {
        model: models.Product,
        as: "itemDetails",

        include: [
          {
            model: models.Store,
            as: "store",
          },
        ],
      },
    ],
    order: [
      ["updatedAt", "DESC"], // Sorting by updatedAt in descending order
    ],
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Shop items retrieved successfully",
        shopItems: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching shop items:", err);
      res.status(500).json({ success: false, message: err });
    });
}

function getAllShopsItems(req, res) {
  models.ShopItem.findAll({
    where: {
      fromType: "shoptoshop",
      //status: "pending",
    },
    include: [
      {
        model: models.Shop,
        as: "shop",
        include: [
          {
            model: models.User,
            as: "seller",
          },
        ],
      },
      {
        model: models.Shop,
        as: "fromshop",
        include: [
          {
            model: models.User,
            as: "seller",
          },
        ],
      },
      {
        model: models.Product,
        as: "sendItem",

        include: [
          {
            model: models.Store,
            as: "store",
          },
        ],
      },
    ],
    order: [
      [
        models.sequelize.literal(
          `CASE WHEN status = 'pending' THEN 0 ELSE 1 END`
        ),
        "ASC",
      ],
      ["updatedAt", "DESC"], // Sorting by updatedAt in descending order
    ],
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Shop items retrieved successfully",
        shopItems: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching shop items:", err);
      res.status(500).json({ success: false, message: err });
    });
}

function getAllStoreToShopsItems(req, res) {
  models.ShopItem.findAll({
    where: {
      fromType: "storetoshop",
      //status: "pending",
    },
    include: [
      {
        model: models.Shop,
        as: "shop",
        include: [
          {
            model: models.User,
            as: "seller",
          },
        ],
      },
      {
        model: models.Shop,
        as: "fromshop",
        include: [
          {
            model: models.User,
            as: "seller",
          },
        ],
      },
      {
        model: models.Product,
        as: "sendItem",

        include: [
          {
            model: models.Store,
            as: "store",
          },
        ],
      },
    ],
    order: [
      [
        models.sequelize.literal(
          `CASE WHEN status = 'pending' THEN 0 ELSE 1 END`
        ),
        "ASC",
      ],
      ["updatedAt", "DESC"], // Sorting by updatedAt in descending order
    ],
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Shop items retrieved successfully",
        shopItems: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching shop items:", err);
      res.status(500).json({ success: false, message: err });
    });
}

function buyItems(req, res) {
  if (req.body.quantity < 1) {
    res.status(400).json({
      success: false,
      message: "Quantity should be greater than 0",
    });
    return;
  }

  if (req.body.unitPrice < 1) {
    res.status(400).json({
      success: false,
      message: "Unit price should be greater than 0",
    });
    return;
  }

  if (
    req.body.customerId == null ||
    req.body.itemId == null ||
    req.body.shopId == null ||
    req.body.buyDateTime == null ||
    req.body.type == null ||
    req.body.quantity == null
  ) {
    res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
    return;
  }

  const buyItem = {
    customerId: req.body.customerId,
    itemId: req.body.itemId,
    shopId: req.body.shopId,
    buyDateTime: req.body.buyDateTime,
    unitPrice: req.body.unitPrice,
    type: req.body.type,
    quantity: req.body.quantity,
    dueAmount: req.body.dueAmount,
  };

  models.CustomerBuyItem.create(buyItem)
    .then((data) => {
      // res.status(200).json({
      //   success: true,
      //   message: "Item bought successfully",
      //   item: data,
      // });

      models.ShopItem.findOne({
        where: {
          itemId: data.itemId,
          shopId: data.shopId,
        },
      }).then((dataX) => {
        quantity = parseInt(dataX.quantity) - parseInt(data.quantity);

        if (quantity < 0) {
          res.status(404).json({
            success: false,
            message: "Not enough quantity",
          });
          return;
        }

        models.ShopItem.update(
          { quantity: dataX.quantity - data.quantity },
          {
            where: {
              itemId: data.itemId,
              shopId: data.shopId,
            },
          }
        ).then((data) => {
          res.status(200).json({
            success: true,
            message: "Item bought successfully",
            item: data,
          });
        });
      });
    })
    .catch((err) => {
      console.error("Error buying item:", err);
      res.status(500).json({ success: false, message: err });
    });
}

function shopItemApprove(req, res) {
  models.ShopItem.update(
    { status: "approved" },
    { where: { id: req.params.id } }
  )
    .then((data) => {
      if (data == 1) {
        models.ShopItem.findOne({
          where: { id: req.params.id },
          include: [
            {
              model: models.Shop,
              as: "shop",
            },
            {
              model: models.Product,
              as: "item",
            },
          ],
        })
          .then((data) => {
            models.ItemSendHistory.update(
              {
                status: "approved",
              },
              {
                where: {
                  itemId: data.itemId,
                  sendId: data.fromId,
                  receivedId: data.shopId,
                  type:
                    data.fromType === "shoptoshop"
                      ? "shoptoshop"
                      : "storetoshop",
                  status: "pending",
                },
              }
            )
              .then((data) => {
                res.status(200).json({
                  success: true,
                  message: "Shop item approved successfully",
                  shopItem: data,
                });
              })
              .catch((err) => {
                console.error("Error approving shop item:", err);
                res.status(500).json({ success: false, message: err });
              });
          })
          .catch((err) => {
            console.error("Error fetching shop item:", err);
            res.status(500).json({ success: false, message: err });
          });
      } else {
        res.status(404).json({
          success: false,
          message: "Shop item not found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: "Some error occurred" });
    });
}

function pendingShopItemCount(req, res) {
  models.ShopItem.count({
    where: {
      fromType: "shoptoshop",
      status: "pending",
    },
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Shop items count retrieved successfully",
        shopItemsCount: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching shop items count:", err);
      res.status(500).json({ success: false, message: err });
    });
}

function pendingStoreItemCount(req, res) {
  models.ShopItem.count({
    where: {
      fromType: "storetoshop",
      status: "pending",
    },
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Shop items count retrieved successfully",
        shopItemsCount: data,
      });
    })
    .catch((err) => {
      console.error("Error fetching shop items count:", err);
      res.status(500).json({ success: false, message: err });
    });
}

module.exports = {
  getAllShopsItems: getAllShopsItems,
  getShopsItems: getShopsItems,
  getShopsItemId: getShopsItemId,
  sendShopItemoShop: sendShopItemoShop,
  buyItems: buyItems,
  shopItemApprove: shopItemApprove,
  rejectShopItemoShop: rejectShopItemoShop,
  pendingShopItemCount: pendingShopItemCount,
  getAllStoreToShopsItems: getAllStoreToShopsItems,
  pendingStoreItemCount: pendingStoreItemCount,
};
