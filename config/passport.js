// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const User = require("../models/user");
// const bcrypt = require("bcrypt");

// passport.serializeUser((user, done) => {
//   return done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, "_id role").then((user) => {
//     return done(null, user);
//   });
// });

// passport.use(
//   "local-login",
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//       passReqToCallback: true,
//     },
//     async (req, email, password, done) => {
//       const user = await User.findOne({ email });
//       return done(null, user);
//     }
//   )
// );

// passport.use(
//   "local-register",
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//       passReqToCallback: true,
//     },
//     async (req, { userName, email, password }, done) => {
//       const hashPassword = await bcrypt.hash(password, 12);

//       const user = new User({
//         userName,
//         email,
//         password: hashPassword,
//       });

//       user.save((error, user) => {
//         if (error) {
//           return done(null, false);
//         }
//         return done(null, user);
//       });
//     }
//   )
// );
