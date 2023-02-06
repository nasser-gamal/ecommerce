const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { getUser, editUser, profileImage } = require("../controllers/profile");
const { isAuthenticate } = require("../middleware/is-auth");

router.get("/", isAuthenticate, getUser);
router.post(
  "/edit",
  isAuthenticate,
  [
    body("userName").trim().not().isEmpty().withMessage("UserName Is required"),
    body("email")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Email Is required")
      .isEmail()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage("Email address is invalid"),
    body("oldPassword")
      .trim()
      .not()
      .isEmpty()
      .withMessage("OldPassword Is required"),
    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("New Password Is required")
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/)
      .withMessage(
        "Password must contain one capital letter and one symbol, and have a length between 8 and 20 characters."
      ),
    body("confirmPassword")
      .trim()
      .not()
      .isEmpty()
      .withMessage("New Password Is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw Error("confirm Password dose not Match");
        }
        return true;
      }),
  ],
  editUser
);

  isAuthenticate,
  router.post("/image",isAuthenticate, profileImage);

module.exports = router;
