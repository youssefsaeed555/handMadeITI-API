const express = require("express");

const { protect, isAllowedTo } = require("../services/authServices");

const {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  checkReview,
} = require("../utils/validators/reviewValidator");

const routes = express.Router();

const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require("../services/reviewServices");

routes
  .route("/")
  .get(getAllReviews)
  .post(protect, isAllowedTo("user"), validateCreateReview, createReview);
routes
  .route("/:id")
  .get(checkReview, getReview)
  .put(protect, isAllowedTo("user"), validateUpdateReview, updateReview)
  .delete(
    protect,
    isAllowedTo("user", "seller", "admin"),
    validateDeleteReview,
    deleteReview
  );

module.exports = routes;
