const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/404");
    }

    return res.render("profile", {
      pageTitle: "User Profile",
      cssFile: "",
      user,
      errorMessage: req.flash("errorMessage"),
      successMessage: req.flash("successMessage"),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const editUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userName, email, oldPassword, password, confirmPassword } =
      req.body;

    const errors = validationResult(req);
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/404");
    }

    if (!errors.isEmpty()) {
      req.flash("errorMessage", errors.array()[0].msg);
      if (user.role === "admin") {
        return res.redirect("/admin/settings?edit=true");
      } else {
        return res.redirect("/profile?edit=true");
      }
    }

    const matchPassword = await bcrypt.compare(oldPassword, user.password);

    if (!matchPassword) {
      req.flash("errorMessage", "oldPassword Is Wrong");
      if (user.role === "admin") {
        return res.redirect("/admin/settings?edit=true");
      } else {
        return res.redirect("/profile?edit=true");
      }
    }

    const newPassword = await bcrypt.hash(password, 12);

    user.userName = userName;
    user.email = email;
    user.password = newPassword;

    user.save((err, user) => {
      if (!err) {
        req.flash("successMessage", "Profile Updated Successfully");
        if (user.role === "admin") {
          return res.redirect("/admin/settings");
        } else {
          return res.redirect("/profile");
        }
      }
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const profileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const image = req.file;

    if (!image) {
      req.flash("errorMessage", "Profile Image Not Provided");
      if (user.role === "admin") {
        return res.redirect("/admin/settings");
      } else {
        return res.redirect("/profile");
      }
    }

    const result = await cloudinary.uploader.upload(image.path, {
      folder: "products",
    });

    const user = await User.findById(userId);
    // Delete The Old Image
    // if (user.image) {
    //   const path = user.image;
    //   fs.unlink(path, (err) => {
    //     if (err) {
    //       return res.redirect("/500");
    //     }
    //   });
    // }

    user.image = result.secure_url;
    user.save((err) => {
      req.flash("successMessage", "Profile Image Updated Succefully");
      if (user.role === "admin") {
        return res.redirect("/admin/settings");
      } else {
        return res.redirect("/profile");
      }
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

module.exports = {
  getUser,
  editUser,
  profileImage,
};
