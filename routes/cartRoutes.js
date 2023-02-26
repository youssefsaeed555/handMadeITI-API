const express = require("express");

const routes = express.Router();

const {
  addProductToCart,
  getLoggedUserCart,
  deleteFromCart,
  clearAll,
  updateQuantity,
} = require("../services/cartServices");

const { protect, isAllowedTo } = require("../services/authServices");

routes.use(protect, isAllowedTo("user"));

routes
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearAll);

routes.route("/:cartItemId").delete(deleteFromCart).put(updateQuantity);

module.exports = routes;
