const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// const sendgridTransporter = require("nodemailer-sendgrid-transport");

var options = {
  auth: {
    api_key:
      "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",
  },
};

// const transporter = nodemailer.createTransport(sendgridTransporter(options));

const registerPage = (req, res) => {
  const errorMessage = req.flash("error");

  res.render("register", {
    pageTitle: "Register",
    cssFile: "sign.css",
    oldData: {
      email: "",
      userName: "",
    },
    errorMessage,
  });
};

const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.render("register", {
        pageTitle: "Register",
        cssFile: "sign.css",
        oldData: {
          userName,
          email,
        },
        errorMessage: req.flash("error"),
      });
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      req.flash("error", "Email Already Exist");
      return res.render("register", {
        pageTitle: "Register",
        cssFile: "sign.css",
        oldData: {
          userName,
          email,
        },
        errorMessage: req.flash("error"),
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    if (!hashPassword) {
      return res.redirect("/500");
    }
    const user = new User({
      userName,
      email,
      password: hashPassword,
    });

    user.save();
    return res.redirect("/login");
  } catch (err) {
    return res.redirect("/500");
  }
};

const loginPage = (req, res) => {
  res.render("login", {
    pageTitle: "login",
    cssFile: "sign.css",
    errorMessage: req.flash("loginError"),
    oldData: {
      email: "",
    },
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("loginError", errors.array()[0].msg);
      return res.render("login", {
        pageTitle: "login",
        cssFile: "sign.css",
        errorMessage: req.flash("loginError"),
        oldData: {
          email,
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("loginError", "Email Is Not Exist");
      return res.render("login", {
        pageTitle: "login",
        cssFile: "sign.css",
        errorMessage: req.flash("loginError"),
        oldData: {
          email,
        },
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      req.flash("loginError", "Password Is Wrong");
      return res.render("login", {
        pageTitle: "login",
        cssFile: "sign.css",
        errorMessage: req.flash("loginError"),
        oldData: {
          email,
        },
      });
    }
    req.session.user = user;
    req.session.isAuthenticate = true;

    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else {
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

const forgetPage = (req, res) => {
  try {
    res.render("forgetPassword", {
      pageTitle: "ForgetPassword",
      cssFile: "",
      errorMessage: req.flash("emailError"),
      successMessage: req.flash("successSend"),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// const forgetPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       req.flash("emailError", errors.array()[0].msg);
//       return res.render("forgetPassword", {
//         pageTitle: "ForgetPassword",
//         cssFile: "",
//         errorMessage: req.flash("emailError"),
//         successMessage: req.flash("successSend"),
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       req.flash("emailError", "Email Is Not Exist");
//       return res.render("forgetPassword", {
//         pageTitle: "ForgetPassword",
//         cssFile: "",
//         errorMessage: req.flash("emailError"),
//         successMessage: req.flash("successSend"),
//       });
//     }
//     const token = crypto.randomBytes(32).toString("hex");
//     user.resetToken = token;
//     user.tokenExpiration = Date.now() + 3600000;
//     user.save();

//     const mailOptions = {
//       to: email,
//       from: "nassergamal2222@gmail.com",
//       subject: `Dear ${user.name},
//                 I hope this email finds you well. I wanted to follow up on a request that we received regarding resetting your password. Our records indicate that a request was made to reset your password on our system.
//                 Please let us know if you did initiate this request, or if there may have been some unauthorized access to your account. If you did request a password reset, we will proceed with the process and send you further instructions.
//                 If there was any unauthorized access, we will take necessary steps to secure your account.`,
//       html: `<p>Here Is
//                 <a href='http://localhost:8000/reset-password?resetCode=${token}'>Link</a>
//                 to Reset Your Password</p>`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return console.log(error);
//       }
//       console.log("Message sent: %s", info);
//     });

//     req.flash("successSend", "We Send You An email Please Check Your Inbox");
//     return res.redirect("/forget-password");
//   } catch (err) {
//     console.log(err);
//     return res.redirect("/500");
//   }
// };

// const resetPage = async (req, res) => {
//   try {
//     const token = req.query.resetCode;

//     const user = await User.findOne({
//       resetToken: token,
//       tokenExpiration: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.redirect("/forget-password");
//     }

//     return res.render("resetPassword", {
//       pageTitle: "ResetPassword",
//       cssFile: "",
//       errorMessage: req.flash("passError"),
//       userId: user._id,
//       token: token,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.redirect("/500");
//   }
// };

// const resetPassword = async (req, res) => {
//   try {
//     const { userId, token, password } = req.body;

//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       req.flash("passError", errors.array()[0].msg);
//       return res.render("resetPassword", {
//         pageTitle: "ResetPassword",
//         cssFile: "",
//         errorMessage: req.flash("passError"),
//       });
//     }

//     const user = await User.findOne({
//       _id: userId,
//       resetToken: token,
//       tokenExpiration: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.redirect("/forget-password");
//     }

//     const hashPassword = await bcrypt.hash(password, 12);
//     user.password = hashPassword;
//     user.resetToken = undefined;
//     user.tokenExpiration = undefined;

//     user.save((err) => {
//       if (!err) {
//         return res.redirect("/login");
//       }
//     });
//   } catch (err) {
//     console.log(err);
//     return res.redirect("/500");
//   }
// };

module.exports = {
  registerPage,
  register,
  loginPage,
  login,
  logout,
  forgetPage,
  // forgetPassword,
  // resetPage,
  // resetPassword,
};
