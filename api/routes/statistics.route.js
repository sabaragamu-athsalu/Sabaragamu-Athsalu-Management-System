const express = require("express");
const statisticsController = require("../controllers/statistics.controller");
const verifyToken = require("../utils/verifyUser");

const router = express.Router();

router.get(
  "/getmostsellingitems/:sellerId",
  verifyToken,
  statisticsController.getmostsellingitems
);

router.get("/gethighestqtysellingitems/:sellerId", verifyToken, statisticsController.gethighestqtysellingitems);

module.exports = router;
