const express = require("express");
const router = express.Router();

const {
  getOrders,
  exportOrderExcel,
  exportOrderPDF,
} = require("../../controllers/admin/orders");

const { adminAuth } = require("../../middleware/is-auth");

router.get("/orders", adminAuth, getOrders);

router.post("/excel/order", adminAuth, exportOrderExcel);

router.post("/pdf/order", adminAuth, exportOrderPDF);

module.exports = router;
