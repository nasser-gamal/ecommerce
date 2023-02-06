const express = require("express");
const { getOrders } = require("../controllers/order");
const { isAuthenticate } = require("../middleware/is-auth");
const router = express.Router();


router.get("/orders",isAuthenticate, getOrders);


module.exports = router;
