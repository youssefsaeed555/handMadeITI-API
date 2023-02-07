const express = require("express");

const routes = express.Router();

const { signup, login, forgetPassword } = require("../services/authServices");

const {
  signupValidator,
  validateLogin,
} = require("../utils/validators/authValidator");

routes.route("/signup").post(signupValidator, signup);

routes.route("/login").post(validateLogin, login);

routes.route("/forgetPassword").post(forgetPassword);

module.exports = routes;
