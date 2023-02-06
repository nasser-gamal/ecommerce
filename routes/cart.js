const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  deleteCart,
  incrementProduct,
  decrementProduct,
} = require("../controllers/cart");
const { isAuthenticate } = require("../middleware/is-auth");

router.get("/cart", isAuthenticate, getCart);

router.post("/addCart", isAuthenticate, isAuthenticate, addToCart);

router.post("/deleteCart/:productId", isAuthenticate, deleteCart);

router.post("/increment/:productId", isAuthenticate, incrementProduct);

router.post("/decrement/:productId", isAuthenticate, decrementProduct);

module.exports = router;
