const User = require("../../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const fs = require("fs");
const Excel = require("exceljs");

// getAll Users
const getUsers = async (req, res) => {
  try {
    const userPerPage = 10;
    const page = +req.query.page || 1;
    const totalItems = await User.find().countDocuments();
    const totalBtns = totalItems / userPerPage;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(userPerPage * (page - 1))
      .limit(userPerPage);

    return res.render("admin/users", {
      pageTitle: "Users",
      cssFile: "",
      users,
      path: "/users",
      totalItems,
      hasNextPage: userPerPage * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      currentPage: page,
      lastPage: Math.ceil(totalItems / userPerPage),
      pagenation: totalItems > userPerPage,
      successMessage: req.flash("successMsg"),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// addUser Page
const addUser = (req, res) => {
  try {
    return res.render("admin/addUser", {
      pageTitle: "Users",
      cssFile: "",
      path: "/users",
      errorMessage: req.flash("error"),
      passwordSuccess: req.flash("passwordSuccess"),
      passwordError: req.flash("passwordError"),
      edit: false,
      oldData: {
        userName: "",
        email: "",
        role: "",
        address: "",
        contactNumber: "",
      },
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// Create Users And Admins
const createUser = async (req, res) => {
  try {
    const { userName, email, password, role, contactNumber, address } =
      req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.render("admin/addUser", {
        pageTitle: "Users",
        cssFile: "",
        path: "/users",
        edit: false,
        errorMessage: req.flash("error"),
        passwordSuccess: req.flash("passwordSuccess"),
        passwordError: req.flash("passwordError"),
        oldData: {
          userName,
          email,
          role,
          address,
          contactNumber,
        },
      });
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      req.flash("error", "Email Already Exist");
      return res.render("admin/addUser", {
        pageTitle: "Users",
        cssFile: "",
        path: "/users",
        edit: false,
        errorMessage: req.flash("error"),
        passwordSuccess: req.flash("passwordSuccess"),
        passwordError: req.flash("passwordError"),
        oldData: {
          userName,
          email,
          role,
          address,
          contactNumber,
        },
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
      role,
      contactNumber,
      address,
    });

    user.save((err) => {
      if (!err) {
        req.flash("successMsg", "User Created Successfully");
        return res.redirect("/admin/users");
      }
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// EditUsers Page
const editUserPage = async (req, res) => {
  try {
    const edit = req.query.edit;
    const userId = req.params.userId;

    if (!edit) {
      return res.redirect("/admin/addUser");
    }
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/401");
    }

    return res.render("admin/addUser", {
      pageTitle: "Users",
      cssFile: "",
      path: "/users",
      errorMessage: req.flash("error"),
      passwordSuccess: req.flash("passwordSuccess"),
      passwordError: req.flash("passwordError"),
      edit,
      oldData: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        address: user.address,
        contactNumber: user.contactNumber,
      },
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const editUser = async (req, res) => {
  try {
    const { userId, userName, email, role, contactNumber, address } = req.body;
    const errors = validationResult(req);

    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/404");
    }

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect(`/admin/editUser/${userId}?edit=true`);
    }

    const updateUser = {
      userName,
      email,
      role,
      contactNumber,
      address,
    };

    User.findOneAndUpdate({ _id: userId }, { $set: updateUser })
      .then((result) => {
        req.flash("success", "User Updated Successfully");
        return res.redirect(`/admin/editUser/${userId}?edit=true`);
      })
      .catch((err) => {
        req.flash("error", "User Updated Successfully");
        return res.redirect(`/admin/editUser/${userId}?edit=true`);
      });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const editPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const errors = validationResult(req);
    const user = await User.findById(userId);

    if (!errors.isEmpty()) {
      req.flash("passwordError", errors.array()[0].msg);
      return res.redirect(`/admin/editUser/${userId}?edit=true`);
    }

    if (!user) {
      return res.redirect("/401");
    }

    const hashPassword = await bcrypt.hash(password, 12);
    user.password = hashPassword;
    user.save((err) => {
      if (!err) {
        req.flash("passwordSuccess", "Password Updated Successfully");
        return res.redirect(`/admin/editUser/${userId}?edit=true`);
      }
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const accessPage = async (req, res) => {
  try {
    const userId = req.query._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/404");
    }

    return res.render("admin/access", {
      pageTitle: "shop",
      path: "",
      cssFile: "",
      link: "user",
      id: user._id,
      errorMessage: req.flash("passError"),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id, password } = req.body;
    const adminId = req.user._id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("passError", errors.array()[0].msg);
      return res.redirect(`/admin/access/user?_id=${id}`);
    }

    const user = await User.findById(id);
    const admin = await User.findOne({ _id: adminId, role: "admin" });

    if (!user) {
      return res.redirect("/404");
    }

    const matchPassword = await bcrypt.compare(password, admin.password);

    if (!matchPassword) {
      req.flash("passError", "Password Is Wrong");
      return res.redirect(`/admin/access/users?_id=${id}`);
    }

    if (user.image) {
      fs.unlink(user.image, (err) => {
        if (err) {
          console.log(err);
          return res.redirect("/500");
        }
      });
    }

    User.findOneAndDelete(id).then((result) => {
      req.flash("successMsg", "User Deleted Successfully");
      res.redirect("/admin/users");
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const exportUsersExcel = async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.redirect("/500");
    }

    const workbook = new Excel.Workbook();

    const worksheet = workbook.addWorksheet("sheet1");


    // center rows
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };


    worksheet.columns = [
      // { header: "userId", key: "id", width: "30" },
      { header: "Name", key: "name", width: "30" },
      { header: "email", key: "email", width: "30" },
      { header: "Role", key: "role", width: "30" },
      { header: "contactNumber", key: "mobile", width: "30" },
      { header: "status", key: "status", width: "30" },
      { header: "createdAt", key: "date", width: "30" },
    ];

    users.map((user) => {
      const date = user.createdAt;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours =
        date.getHours() > 12 ? date.getHours() - 12 : `${date.getHours()}`;
      const minutes =
        date.getMinutes() > 12 ? date.getMinutes() : `0${date.getMinutes()}`;
      const period = date.getHours() > 12 ? "pm" : "am";

      return worksheet.addRows([
        {
          // id: user._id,
          name: user.userName,
          email: user.email,
          role: user.role,
          mobile: user.contactNumber,
          status: user.status,
          date: `${day} / ${month} / ${year} --- ${hours}:${minutes} ${period}`,
        },
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + `Shop-Users.xlsx`
    );

    workbook.xlsx.write(res).then(function () {
      res.end();
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

module.exports = {
  getUsers,
  addUser,
  createUser,
  editUserPage,
  editUser,
  editPassword,
  accessPage,
  deleteUser,
  exportUsersExcel,
};
