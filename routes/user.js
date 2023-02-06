const express = require("express");

const router = express.Router();

const {
  registerPage,
  register,
  loginPage,
  login,
  logout,
  // forgetPassword,
  // forgetPage,
  // resetPage,
} = require("../controllers/user");

const { body } = require("express-validator");
const {activeAuth } = require("../middleware/is-auth");

router.get("/register", activeAuth, activeAuth, registerPage);

router.get("/login", activeAuth, activeAuth, loginPage);

router.post(
  "/register",
  activeAuth,
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
      .not()
      .isEmpty()
      .withMessage("Email Is Required")
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage("Email address is invalid"),
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
  register
);

router.post(
  "/login",
  activeAuth,
  [
    body("email")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Email Is Required")
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage("Email address is invalid"),
    body("password").trim().not().isEmpty().withMessage("password Is Required"),
  ],
  login
  //   passport.authenticate("local-login", {
  //     successRedirect: "/",
  //     failureRedirect: "/login",
  //     failureFlash: true,
  //   })
);

router.post("/logout", logout);

// router.get("/forget-password", activeAuth, forgetPage);

// router.post(
//   "/forget-password",
//   activeAuth,
//   [
//     body("email")
//       .not()
//       .isEmpty()
//       .withMessage("Email Is Required")
//       .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
//       .withMessage("Email address is invalid"),
//   ],
//   forgetPassword
// );

// router.get(
//   "/reset-password",
//   activeAuth,
//   [
//     body("password")
//       .trim()
//       .not()
//       .isEmpty()
//       .withMessage("Password Is Required")
//       .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/)
//       .withMessage(
//         "Password must contain one capital letter and one symbol, and have a length between 8 and 20 characters."
//       ),
//     body("confirmPassword")
//       .trim()
//       .not()
//       .isEmpty()
//       .withMessage("confirm Password Is Required")
//       .custom((value, { req }) => {
//         if (value !== req.body.password) {
//           throw new Error("Password not Matched");
//         }
//         return true;
//       }),
//   ],

//   resetPage
// );
module.exports = router;
