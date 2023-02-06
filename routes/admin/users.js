const express = require("express");
const router = express.Router();

const {
  getUsers,
  addUser,
  createUser,
  editUserPage,
  editUser,
  accessPage,
  deleteUser,
  editPassword,
  exportUsersExcel,
} = require("../../controllers/admin/users");
const { body } = require("express-validator");

const { adminAuth } = require("../../middleware/is-auth");

router.get("/users", adminAuth, getUsers);

router.get("/addUser", adminAuth, addUser);
router.get("/editUser/:userId", adminAuth, editUserPage);

router.post(
  "/addUser",
  adminAuth,
  [
    body("userName")
      .trim()
      .not()
      .isEmpty()
      .withMessage("UserName Is Required")
      .isLength({ min: 6, max: 20 })
      .withMessage("UserName Must be At least 8 character to 12 Character"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email Not Valid")
      .not()
      .isEmpty()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage("Email address is invalid"),
    body("role").trim().not().isEmpty().withMessage("Role Is Required"),
    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Password Is Required")
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/)
      .withMessage(
        "Password must contain one capital letter and one symbol, and have a length between 8 and 20 characters."
      ),
    body("confirmPassword")
      .trim()
      .not()
      .isEmpty()
      .withMessage("confirmPassword Is Required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("password not Matched");
        }
        return true;
      }),
  ],
  createUser
);

router.post(
  "/editUser",
  adminAuth,
  [
    body("userName")
      .trim()
      .not()
      .isEmpty()
      .withMessage("UserName Is Required")
      .isLength({ min: 6, max: 20 })
      .withMessage("UserName Must be At least 8 character to 12 Character"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email Not Valid")
      .not()
      .isEmpty()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage("Email address is invalid"),
    body("role").trim().not().isEmpty().withMessage("Role Is Required"),
    body("contactNumber")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Contact Number Is Required")
      .isNumeric()
      .withMessage("Contact Number should only contain numbers")
      .isLength({ min: 11, max: 11 })
      .withMessage("Contact Number should be 11 characters long"),
    body("address").trim().not().isEmpty().withMessage("address Is Required"),
  ],
  editUser
);
router.post(
  "/edit-password",
  adminAuth,
  [
    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Password Is Required")
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/)
      .withMessage(
        "Password must contain one capital letter and one symbol, and have a length between 8 and 20 characters."
      ),
    body("confirmPassword")
      .trim()
      .not()
      .isEmpty()
      .withMessage("confirmPassword Is Required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("password not Matched");
        }
        return true;
      }),
  ],
  editPassword
);
router.get("/access/user", adminAuth, accessPage);

router.post(
  "/delete/user",
  adminAuth,
  [body("password").trim().not().isEmpty().withMessage("Password Is Required")],
  deleteUser
);

router.post("/excel/users", exportUsersExcel);
module.exports = router;
