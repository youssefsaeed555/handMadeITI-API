const express = require("express");

const {
  getCategoires,
  createCategory,
} = require("../services/categoryServices");

const router = express.Router();

router.route("/").get(getCategoires).post(createCategory);

module.exports = router;
