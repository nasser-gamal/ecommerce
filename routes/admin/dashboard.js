const express = require("express");
const router = express.Router();

const {adminAuth} = require('../../middleware/is-auth')
const { getData } = require("../../controllers/admin/dashbord");

router.get("/dashboard",adminAuth, getData);

module.exports = router;
