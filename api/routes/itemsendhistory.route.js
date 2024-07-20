const express = require("express");
const itemsendhistoryController = require("../controllers/itemsendhistory.controller");
const verifyToken = require("../utils/verifyUser");

const router = express.Router();

router.get(
  "/getallitemsendhistoryshop",
  verifyToken,
  itemsendhistoryController.getAllItemSendHistoryShop
);



module.exports = router;
