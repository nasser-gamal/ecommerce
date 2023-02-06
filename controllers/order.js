const Order = require("../models/order");

const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).populate("products.productId");

    return res.render("orders", {
      pageTitle: "Orders",
      cssFile: "order.css",
      orders,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

module.exports = {
  getOrders,
};
