const fs = require("fs");
const Excel = require("exceljs");
const bcrypt = require("bcrypt");
const { validationResult, Result } = require("express-validator");
const cloudinary = require("../../utils/cloudinary");

const Product = require("../../models/product");
const User = require("../../models/user");

const getProducts = async (req, res) => {
  try {
    const productPage = 10;
    const page = +req.query.page || 1;
    const totalItems = await Product.find().countDocuments();
    // const totalBtns = totalItems / productPage;
    const products = await Product.find()
      .populate("createdBy", "userName")
      .sort({ createdAt: -1 })
      .skip(productPage * (page - 1))
      .limit(productPage);
    console.log(products);

    return res.render("admin/products", {
      pageTitle: "products",
      cssFile: "",
      products,
      path: "/products",
      totalItems,
      hasNextPage: productPage * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      currentPage: page,
      lastPage: Math.ceil(totalItems / productPage),
      pagenation: totalItems > productPage,
      successMessage: req.flash("deleteProduct"),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const addProductPage = (req, res) => {
  try {
    return res.render("admin/addProduct", {
      pageTitle: "products",
      cssFile: "",
      path: "/products",
      errorMessage: req.flash("error"),
      successMsg: req.flash("productSuccess"),
      edit: false,
      oldData: {
        title: "",
        price: "",
        quantity: "",
        image: "",
        gender: "",
        brand: "",
        color: "",
      },
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const addProduct = async (req, res) => {
  try {
    const { title, price, quantity, gender, brand, color } = req.body;
    const image = req.file;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.render("admin/addProduct", {
        pageTitle: "products",
        cssFile: "",
        path: "/products",
        errorMessage: req.flash("error"),
        successMsg: req.flash("productSuccess"),
        edit: false,
        oldData: {
          title,
          price,
          quantity,
          gender,
          brand,
          color,
        },
      });
    }

    if (!image) {
      req.flash("error", "Image Not Provided");
      return res.render("admin/addProduct", {
        pageTitle: "products",
        cssFile: "",
        path: "/products",
        errorMessage: req.flash("error"),
        successMsg: req.flash("productSuccess"),
        edit: false,
        oldData: {
          title,
          price,
          quantity,
          gender,
          brand,
          color,
        },
      });
    }

    const result = await cloudinary.uploader.upload(image.path, {
      folder: "products",
    });

    const product = new Product({
      title,
      price,
      quantity,
      description: { gender, brand, color },
      image: result.secure_url,
      createdBy: req.user._id,
    });

    product.save((err) => {
      if (!err) {
        req.flash("productSuccess", "Product Created Succeffully");
        return res.redirect("/admin/addProduct");
      }
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const editProductsPage = async (req, res) => {
  try {
    const edit = req.query.edit;
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!edit) {
      return res.redirect("/admin/addProducts");
    }
    if (!product) {
      return res.redirect("/401");
    }

    return res.render("admin/addProduct", {
      pageTitle: "products",
      cssFile: "",
      path: "/products",
      errorMessage: req.flash("error"),
      successMsg: req.flash("editSuccess"),
      edit,
      oldData: {
        _id: product._id,
        title: product.title,
        price: product.price,
        quantity: product.quantity,
        image: product.image,
        gender: product.description.gender,
        brand: product.description.brand,
        color: product.description.color,
      },
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const editProduct = async (req, res) => {
  try {
    const { productId, title, price, quantity, gender, brand, color } =
      req.body;
    const image = req.file;
    const errors = validationResult(req);
    const product = await Product.findById(productId);

    if (!product) {
      return res.redirect("/401");
    }

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.render("admin/addProduct", {
        pageTitle: "products",
        cssFile: "",
        path: "/products",
        errorMessage: req.flash("error"),
        successMsg: req.flash("editSuccess"),
        edit,
        oldData: {
          _id: product._id,
          title: product.title,
          price: product.price,
          quantity: product.quantity,
          image: product.image,
          gender: product.description.gender,
          brand: product.description.brand,
          color: product.description.color,
        },
      });
    }

    // if (image) {
    //   fs.unlink(product.image, (err) => {
    //     if (err) {
    //       console.log(err);
    //       return res.redirect("/500");
    //     }
    //   });
    // }

    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "products",
      });
    }

    const updateProduct = image
      ? {
          title,
          price,
          quantity,
          gender,
          brand,
          color,
          image: result.secure_url,
        }
      : {
          ...product,
          title,
          price,
          quantity,
          gender,
          brand,
          color,
        };

    Product.findByIdAndUpdate(productId, { $set: updateProduct }).then(
      (result) => {
        req.flash("editSuccess", "Product Updated Successfully");
        return res.redirect(`/admin/editProduct/${productId}?edit=true`);
      }
    );
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// access Page
const accessPage = async (req, res) => {
  try {
    const productId = req.query._id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.redirect("/404");
    }

    return res.render("admin/access", {
      pageTitle: "shop",
      path: "",
      cssFile: "",
      link: "product",
      id: product._id,
      errorMessage: req.flash("productDelete"),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id, password } = req.body;
    const adminId = req.user._id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("productDelete", errors.array()[0].msg);
      return res.redirect(`/admin/access/product?_id=${id}`);
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.redirect("/404");
    }

    const user = await User.findById(adminId);

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      req.flash("productDelete", "Password Is Wrong");
      return res.redirect(`/admin/access/product?_id=${id}`);
    }

    Product.findByIdAndDelete(id).then((result) => {
      req.flash("deleteProduct", "Product Deleted Successfully");
      return res.redirect(`/admin/products`);
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const exportProductsExcel = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy");

    if (!products) {
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
      { header: "title", key: "name", width: "30" },
      { header: "brand", key: "brand", width: "10" },
      { header: "gender", key: "gender", width: "10" },
      { header: "color", key: "color", width: "10" },
      { header: "quantity", key: "quantity", width: "10" },
      { header: "price", key: "price", width: "10" },
      { header: "createdBy", key: "createdBy", width: "30" },
      { header: "status", key: "status", width: "10" },
      { header: "createdAt", key: "date", width: "30" },
    ];

    products.map((product) => {
      const date = product.createdAt;
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
          // id: product._id,
          name: product.title,
          brand: product.description.brand,
          gender: product.description.gender,
          color: product.description.color,
          quantity: product.quantity,
          price: product.price,
          createdBy: product.createdBy.userName,
          status: product.status,
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
      "attachment; filename=" + `Shop-products.xlsx`
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
  getProducts,
  addProductPage,
  addProduct,
  editProductsPage,
  editProduct,
  accessPage,
  deleteProduct,
  exportProductsExcel,
};
