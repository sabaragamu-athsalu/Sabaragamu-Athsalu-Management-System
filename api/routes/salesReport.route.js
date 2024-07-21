const express = require('express');
const salesReportController = require('../controllers/salesReport.controller');
const verifyToken = require("../utils/verifyUser");

const router = express.Router();

router.get('/getsales', verifyToken, salesReportController.showSalesReport);
router.get('/getsales/:shopId', verifyToken, salesReportController.showSalesByShopId);
router.post('/addsale', verifyToken, salesReportController.save);
router.post('/addsales', verifyToken, salesReportController.addSales);
router.post("/updateDueAmount/:id", verifyToken, salesReportController.updateDueAmount);

module.exports = router;