const express = require("express");
const getProducts = require("../controllers/home");
const router = express.Router();
const isAuthenticate = require("../middleware/is-auth");

router.get("/", getProducts);

module.exports = router;
