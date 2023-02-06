const Product = require("../models/product");

const getProducts = async (req, res, next) => {
  try {
    const message = req.flash("paymentSuccess");

    const productPage = 20;
    const page = +req.query.page || 1;
    const totalItems = await Product.find().countDocuments();
    // const totalBtns = totalItems / productPage;
    const products = await Product.find()
      .populate("createdBy", "userName")
      .sort({ createdAt: -1 })
      .skip(productPage * (page - 1))
      .limit(productPage);
    

    return res.render("home", {
      pageTitle: "Home",
      cssFile: "index.css",
      products,
      totalItems,
      hasNextPage: productPage * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      currentPage: page,
      lastPage: Math.ceil(totalItems / productPage),
      pagenation: totalItems > productPage,
      message: message,
    });
  } catch (err) {
    return res.redirect("/500");
  }
};

module.exports = getProducts;
