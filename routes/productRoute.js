// const { Router } = require("express");
const express = require("express");

const routes = express.Router({ mergeParams: true });

const {
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/productServices");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const { protect, isAllowedTo } = require("../services/authServices");

const reviews = require("./reviewsRoutes");

routes.use("/:productId/reviews", reviews);

const upload = require("../middleware/upload_images");

// const mixFiles = [
//   { name: "imageCover", maxCount: 1 },
//   { name: "images", maxCount: 5 },
// ];
routes
  .route("/")
  .get(getProducts)
  .post(
    protect,
    isAllowedTo("admin"),
    upload.uploadSingle("imageCover"),
    createProductValidator,
    createProduct
  );

routes
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(protect, isAllowedTo("admin"), updateProductValidator, updateProduct)
  .delete(protect, isAllowedTo("admin"), deleteProductValidator, deleteProduct);

module.exports = routes;
