const express = require("express");
const router = express.Router();
const { body, check } = require("express-validator");
const {
  getProducts,
  addProductPage,
  addProduct,
  editProductsPage,
  editProduct,
  accessPage,
  deleteProduct,
  exportProductsExcel,
} = require("../../controllers/admin/products");

const { adminAuth } = require("../../middleware/is-auth");

router.get("/products", adminAuth, getProducts);

router.get("/addProduct", adminAuth, addProductPage);

router.post(
  "/addProduct",
  adminAuth,
  [
    body("title").trim().not().isEmpty().withMessage("title Is Required"),
    body("price")
      .trim()
      .not()
      .isEmpty()
      .withMessage("price Is Required")
      .isNumeric()
      .withMessage("Price Must Be Number"),
    body("quantity")
      .trim()
      .not()
      .isEmpty()
      .withMessage("quantity Is Required")
      .isNumeric()
      .withMessage("quantity Must Be Number"),
    body("gender").trim().not().isEmpty().withMessage("gender Is Required"),
    body("brand").trim().not().isEmpty().withMessage("brand Is Required"),
    body("color").trim().not().isEmpty().withMessage("color Is Required"),
  ],

  addProduct
);

router.get("/editProduct/:productId", adminAuth, editProductsPage);

router.post(
  "/editProduct",
  adminAuth,
  [
    body("title").trim().not().isEmpty().withMessage("title Is Required"),
    body("price")
      .trim()
      .not()
      .isEmpty()
      .withMessage("price Is Required")
      .isNumeric()
      .withMessage("Price Must Be Number"),
    body("quantity")
      .trim()
      .not()
      .isEmpty()
      .withMessage("quantity Is Required")
      .isNumeric()
      .withMessage("quantity Must Be Number"),
    body("gender").trim().not().isEmpty().withMessage("gender Is Required"),
    body("brand").trim().not().isEmpty().withMessage("brand Is Required"),
    body("color").trim().not().isEmpty().withMessage("color Is Required"),
  ],

  editProduct
);

router.get("/access/product", adminAuth, accessPage);
router.post(
  "/delete/product",
  adminAuth,
  [body("password").not().isEmpty().withMessage("Password Is Required")],

  deleteProduct
);

router.post("/excel/products", exportProductsExcel);

module.exports = router;
