const User = require("../../models/user");
const Product = require("../../models/product");
const Order = require("../../models/order");

const getData = async (req, res) => {
  try {
    const admins = await User.find({role: 'admin'})
    const usersCount = await User.find({role: 'user'}).countDocuments();
    const productsCount = await Product.find().countDocuments();
    const ordersCount = await Order.find().countDocuments();

    return res.render("admin/dashboard", {
      pageTitle: "Dashboard",
      cssFile: "",
      path: "/dashboard",
      admins,
      usersCount,
      productsCount,
      ordersCount,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

module.exports = {
  getData,
};
