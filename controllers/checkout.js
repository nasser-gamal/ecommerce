const Cart = require("../models/cart");
const Order = require("../models/order");
const { validationResult } = require("express-validator");

// const stripe = require("stripe")(
//   "sk_test_51MShscBxBfRJQLlvXRDeAnQnk0Op9mKltQgxNKCCoFifNhvOjRR0l4QC9ik0qvgDuYlPFL2y4bs58mQT0XKcuDoR00q2s2yYFv"
// );

const getCheckout = (req, res) => {
  try {
    const cart = Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.redirect("/");
    }

    return res.render("checkout", {
      pageTitle: "Checkout",
      cssFile: "checkout.css",
      totalPrice: cart.totalPrice,
      errorMessage: req.flash("checkError"),
      oldData: {
        name: "",
        address: "",
        contactNumber: "",
        creditCardNumber: "",
        cvc: "",
        exp_month: "",
        exp_year: "",
      },
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const createPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      address,
      contactNumber,
      creditCardNumber,
      password,
      cvc,
      exp_month,
      exp_year,
      stripeToken,
    } = req.body;
    const cart = await Cart.findOne({ userId });

    const errors = validationResult(req);

    // Validation
    if (!errors.isEmpty()) {
      req.flash("checkError", errors.array()[0].msg);

      return res.render("checkout", {
        pageTitle: "Checkout",
        cssFile: "checkout.css",
        totalPrice: cart.totalPrice,
        errorMessage: req.flash("checkError"),
        oldData: {
          name,
          address,
          contactNumber,
          creditCardNumber,
          cvc,
          exp_month: password[0],
          exp_year: password[1],
        },
      });
    }

    // const charge = await stripe.charges.create({
    //   amount: cart.totalPrice * 100,
    //   source: stripeToken,
    //   currency: "usd",
    // });

    const order = new Order({
      name,
      address,
      contactNumber,
      products: cart.products,
      userId: cart.userId,
      totalPrice: cart.totalPrice,
      totalQuantity: cart.totalQuantity,
      // paymentId: charge.id,
      paymentStatus: "success",
    });

    order.save((err) => {
      if (!err) {
        Cart.findOneAndDelete({ userId }).then((result) => {
          req.flash("paymentSuccess", "Payment Successed");
          return res.redirect("/");
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/500");
  }
};

module.exports = { getCheckout, createPayment };
