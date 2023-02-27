const express = require("express");

const routes = express.Router();
const {
  createOrder,
  getOrder,
  getLoggedUserOrder,
  getAllOrders,
} = require("../services/orderServices");

const { protect, isAllowedTo } = require("../services/authServices");

routes.use(protect);

routes
  .route("/")
  .get(
    getLoggedUserOrder,
    isAllowedTo("user", "admin", "seller"),
    getAllOrders
  );

routes.route("/:id").get(isAllowedTo("user"), getOrder);

routes.route("/:cartId").post(isAllowedTo("user"), createOrder);

module.exports = routes;
