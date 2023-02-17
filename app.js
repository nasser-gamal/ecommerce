const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
// const MongoSession = require("connect-mongodb-session")(session);
const multer = require("multer");
const scrf = require("csurf");
// const expressIp = require("express-ip");
// require("./config/passport");
require("dotenv").config();

// userRoutes
const homeRoutes = require("./routes/home");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const orderRoutes = require("./routes/order");
const profileRoutes = require("./routes/profile");
// admin Routes
const dashboardRoutes = require("./routes/admin/dashboard");
const usersRoutes = require("./routes/admin/users");
const productsRoutes = require("./routes/admin/products");
const ordersRoutes = require("./routes/admin/orders");
const settingsRoutes = require("./routes/admin/settings");

const User = require("./models/user");
const Cart = require("./models/cart");

const PORT = process.env.PORT || 8000;
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.vhixoru.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

const csrfPortection = scrf();

// const store = new MongoSession({
//   uri,
//   collection: "session",
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "image/jpeg" || file.mimetype !== "png") {
    cb(null, false);
  }
  cb(null, true);
};

// set Template Engine
app.set("view engine", "ejs");

// MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());
app.use(multer({ storage, fileFilter }).single("image"));
// app.use(expressIp().getIpInfoMiddleware);

app.use(
  session({
    secret: "shoppingCart!",
    saveUninitialized: false,
    resave: false,
    // store,
  })
);
app.use(flash());
app.use(csrfPortection);
// app.use(passport.initialize());
// app.use(passport.session());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id, "-password")
    .then((user) => {
      req.user = user;
      next();
    })

    .catch((err) => {
      console.log(err);
      return res.redirect("/500");
    });
});

app.use(async (req, res, next) => {
  let cartQuantity = 0;
  if (req.session.user) {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cartQuantity = cart.totalQuantity;
    }
  }
  res.locals.cartQuantity = cartQuantity;
  res.locals.csrf = req.csrfToken();
  res.locals.user = req.user;
  res.locals.isAuthenticate = req.session.isAuthenticate;
  next();
});

app.use(async (req, res, next) => {
  const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (req.session.user) {
    const user = await User.findById(req.user._id);

    user.ipAddress = userIp;
    user.save();
    next();
  } else {
    next();
  }
});

// user Routes
app.use(homeRoutes);
app.use(userRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);
app.use(orderRoutes);
app.use("/profile", profileRoutes);
// admin Routes
app.use("/admin", dashboardRoutes);
app.use("/admin", usersRoutes);
app.use("/admin", productsRoutes);
app.use("/admin", ordersRoutes);
app.use("/admin", settingsRoutes);

app.use("/500", (req, res) => {
  res.render("error500");
});

app.use((req, res, next) => {
  res.render("error404");
  next()
});

// Connect To Mongo DataBase
mongoose.set("strictQuery", false);

mongoose
  .connect(uri)
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`Listning In Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
