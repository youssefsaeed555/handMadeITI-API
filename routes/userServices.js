const express = require("express");

const routes = express.Router();

const { changePassword } = require("../services/userServices");
const { protect } = require("../services/authServices");
const {
  changePasswordValidator,
} = require("../utils/validators/userValidator");

routes
  .route("/changePassword")
  .post(protect, changePasswordValidator, changePassword);

module.exports = routes;
