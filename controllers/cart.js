const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/user");

// get All The Products In The Cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate("products.productId");
    return res.render("cart", {
      pageTitle: "Cart",
      cssFile: "cart.css",
      cart,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// Add Products To Cart
const addToCart = async (req, res) => {
  try {
    const {productId} = req.body;
    const _product = await Product.findById(productId);
    const userId = req.user._id;
    let quantity = 1;

    const _cart = await Cart.findOne({ userId });

    //   new Product
    const products = {
      productId,
      quantity,
      totalPrice: quantity * +_product.price,
    };

    //   if The User dose not have a Cart
    if (!_cart) {
      const cart = new Cart({
        userId,
        products: [products],
        totalQuantity: 1,
        totalPrice: products.totalPrice,
        createAt: Date.now(),
      });
      cart.save();

      return res.redirect("/");
    } else {
      // check if Product Already Exist in Cart
      const productIndex = _cart.products.findIndex((product) => {
        return product.productId.toString() === productId.toString();
      });

      //   if Product Exist In Cart
      if (productIndex >= 0) {
        let cart = _cart;

        cart.products[productIndex].quantity += 1;
        cart.products[productIndex].totalPrice =
          cart.products[productIndex].quantity * +_product.price;

        cart.totalPrice += +_product.price;
        cart.totalQuantity += 1;
        cart.createAt = Date.now();

        Cart.findOneAndUpdate({ userId }, { $set: cart })
          .then((result) => {
            return res.redirect("/");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        //   add New Product to Cart
        let cart = _cart;
        cart.products.push(products);
        //   handleTotalPrice
        cart.totalPrice += products.totalPrice;
        // increment cart totalQuantity
        cart.totalQuantity += 1;
        //   update Cart
        Cart.findOneAndUpdate({ userId }, { $set: cart })
          .then((result) => {
            return res.redirect("/");
          })
          .catch((err) => console.log(err));
      }
    }
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// increment quantity Of product Form The Cart
const incrementProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
    const userCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );

    if (!userCart) {
      return res.redirect("/page404");
    }

    const cart = userCart;

    // find The Index Of The Product
    const productIndex = userCart.products.findIndex((product) => {
      return product._id.toString() === productId.toString();
    });

    // price Of The Product
    const productPrice = cart.products[productIndex].productId.price;
    // increment The Quantity
    cart.products[productIndex].quantity += 1;
    // increment The Price
    cart.products[productIndex].totalPrice += productPrice;
    cart.createAt = Date.now();

    // increment cart totalPrice
    cart.totalPrice += productPrice;
    // increment cart totalQuantity
    cart.totalQuantity += 1;

    // Update The Cart
    Cart.findOneAndUpdate({ userId }, { $set: cart })
      .then((result) => {
        return res.redirect("/cart");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// decrement quantity Of product Form The Cart
const decrementProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
    const userCart = await Cart.findOne({ userId }).populate(
      "products.productId"
    );

    if (!userCart) {
      return res.redirect("/page404");
    }

    const cart = userCart;

    // find The Index Of The Product
    const productIndex = userCart.products.findIndex((product) => {
      return product._id.toString() === productId.toString();
    });

    // handle Error If user Try To decrement The quantity less than 1
    if (userCart.products[productIndex].quantity === 1) {
      Cart.findOneAndDelete({ userId })
        .then((result) => {
          return res.redirect("/cart");
        })
        .catch((err) => console.log(err));
    }

    // price Of The Product
    const productPrice = userCart.products[productIndex].productId.price;
    // increment The Quantity
    cart.products[productIndex].quantity -= 1;
    // increment The Price
    cart.products[productIndex].totalPrice -= productPrice;

    // increment cart totalPrice
    cart.totalPrice -= productPrice;
    // increment cart totalQuantity
    cart.totalQuantity -= 1;
    cart.createAt = Date.now();

    // Update The Cart
    Cart.findOneAndUpdate({ userId }, { $set: cart })
      .then((result) => {
        return res.redirect("/cart");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

// Delete Product From The Cart
const deleteCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });

    // delete The Cart If The Product Is The Last One
    if (cart.products.length <= 1) {
      Cart.findOneAndDelete({ userId })
        .then((result) => {
          return res.redirect("/cart");
        })
        .catch((err) => console.log(err));
    } else {
      // find The Index of The Product
      const productIndex = cart.products.findIndex((product) => {
        return product.productId.toString() === productId.toString();
      });

      // product Price
      const productPrice = cart.products[productIndex].totalPrice;
      // product Quantity
      const productQuantity = cart.products[productIndex].quantity;
      // increment The Product Pricr form The totalPrice Of The Cart
      cart.totalPrice -= productPrice;
      // increment cart totalQuantity
      cart.totalQuantity -= productQuantity;

      // remove The Product Form The Cart Products
      cart.products.splice(productIndex, 1);
      // Update The Cart
      Cart.findOneAndUpdate({ userId }, { $set: cart })
        .then((result) => {
          return res.redirect("/cart");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

module.exports = {
  getCart,
  addToCart,
  deleteCart,
  incrementProduct,
  decrementProduct,
};
