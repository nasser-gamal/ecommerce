const getSettings = (req, res) => {
  try {
    res.render("admin/settings", {
      pageTitle: "Settings",
      cssFile: "",
      path: "/settings",
      errorMessage: req.flash("errorMessage"),
      successMessage: req.flash("successMessage"),
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};




module.exports = {
  getSettings,
};
