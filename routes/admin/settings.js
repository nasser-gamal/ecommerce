const express = require("express");
const router = express.Router();

const { getSettings } = require("../../controllers/admin/settings");
const { adminAuth } = require("../../middleware/is-auth");


router.get("/settings", adminAuth, getSettings);

module.exports = router;
