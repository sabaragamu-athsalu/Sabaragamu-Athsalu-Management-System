const express = require("express");
const itemsendhistoryController = require("../controllers/itemsendhistory.controller");
const verifyToken = require("../utils/verifyUser");

const router = express.Router();

router.get(
  "/getallitemsendhistoryshop",
  verifyToken,
  itemsendhistoryController.getAllItemSendHistoryShop
);
router.get(
  "/getallitemsendhistorystore",
  verifyToken,
  itemsendhistoryController.getAllItemSendHistoryStore
);



module.exports = router;
