const express = require("express");

const routes = express.Router();

const { changePassword, updatePhoto } = require("../services/userServices");
const { protect } = require("../services/authServices");
const { uploadSingle } = require("../middleware/upload_images");
const {
  changePasswordValidator,
} = require("../utils/validators/userValidator");

routes
  .route("/changePassword")
  .post(protect, changePasswordValidator, changePassword);

routes
  .route("/updatePhoto")
  .put(uploadSingle("profileImg"), protect, updatePhoto);

module.exports = routes;
