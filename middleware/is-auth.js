const isAuthenticate = (req, res, next) => {
  if (!req.session.isAuthenticate) {
    return res.redirect("/login");
  }
  next();
};

const activeAuth = (req, res, next) => {
  if (req.session.isAuthenticate) {
    if (req.user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/");
    }
    next();
  }
  next();
};

const adminAuth = (req, res, next) => {
  if (
    !req.session.isAuthenticate ||
    (req.session.isAuthenticate && req.session.user.role !== "admin")
  ) {
    res.redirect("/");
  }
  next();
};

module.exports = {
  adminAuth,
  activeAuth,
  isAuthenticate,
};
