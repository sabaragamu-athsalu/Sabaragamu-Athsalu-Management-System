const express = require("express");
const shopItemController = require("../controllers/shopItem.controller");
const verifyToken = require("../utils/verifyUser");

const router = express.Router();

router.get(
  "/getshopitems/:sellerId",
  verifyToken,
  shopItemController.getShopsItems
);
router.get("/getshopitem/:id", verifyToken, shopItemController.getShopsItemId);
router.put(
  "/senditem/:shopId/:itemId/:fromId/:fromShopId/:quantity",
  verifyToken,
  shopItemController.sendShopItemoShop
);
router.post("/buyitems", verifyToken, shopItemController.buyItems);
router.get(
  "/getallshopitems",
  verifyToken,
  shopItemController.getAllShopsItems
);

router.get("/getallstoretoshopitem", verifyToken, shopItemController.getAllStoreToShopsItems);

router.put("/approveitem/:id", verifyToken, shopItemController.shopItemApprove);
router.put(
  "/rejectitem/:shopId/:itemId/:fromId/:quantity",
  verifyToken,
  shopItemController.rejectShopItemoShop
);
router.get("/pending-count", verifyToken, shopItemController.pendingShopItemCount);
router.get("/pending-count-shop", verifyToken, shopItemController.pendingStoreItemCount);

module.exports = router;
