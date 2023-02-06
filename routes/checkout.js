const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const Cart = require("../models/cart");
const { createPayment, getCheckout } = require("../controllers/checkout");
const { isAuthenticate } = require("../middleware/is-auth");

router.get("/checkout", getCheckout);

router.post(
  "/create-payment",
  isAuthenticate,
  [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("name Is Required")
      .isString()
      .not()
      .isNumeric()
      .withMessage(
        "name must be a string and should not contain numbers or symbols"
      ),
    body("address")
      .trim()
      .not()
      .isEmpty()
      .withMessage("address Is Required")
      .isString()
      .not()
      .matches(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/)
      .withMessage("address should not contain symbols"),
    body("contactNumber")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Contact Number Is Required")
      .isNumeric()
      .withMessage("Contact Number should only contain numbers")
      .isLength({ min: 11, max: 11 })
      .withMessage("Contact Number should be 11 characters long"),
  ],
  createPayment
);

module.exports = router;
