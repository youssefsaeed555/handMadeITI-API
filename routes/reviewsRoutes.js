const express = require("express");

const { protect, isAllowedTo } = require("../services/authServices");

const {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  checkReview,
} = require("../utils/validators/reviewValidator");

const routes = express.Router({ mergeParams: true });

const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setParamsOfProduct,
  setProductBody,
} = require("../services/reviewServices");

routes
  .route("/")
  .get(setParamsOfProduct, getAllReviews)
  .post(
    protect,
    isAllowedTo("user"),
    setProductBody,
    validateCreateReview,
    createReview
  );
routes
  .route("/:id")
  .get(checkReview, getReview)
  .put(protect, isAllowedTo("user"), validateUpdateReview, updateReview)
  .delete(
    protect,
    isAllowedTo("user", "admin"),
    validateDeleteReview,
    deleteReview
  );

module.exports = routes;
