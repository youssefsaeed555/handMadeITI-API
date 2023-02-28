const express = require("express");

const routes = express.Router();
const {
  createOrder,
  getOrder,
  getLoggedUserOrder,
  getAllOrders,
  updateOrderDelivered,
  updateOrderPaid,
} = require("../services/orderServices");

const { protect, isAllowedTo } = require("../services/authServices");

routes.use(protect);

routes
  .route("/")
  .get(getLoggedUserOrder, isAllowedTo("user", "admin"), getAllOrders);

routes.route("/:id").get(isAllowedTo("user"), getOrder);

routes.route("/:cartId").post(isAllowedTo("user"), createOrder);

routes.route("/:orderId/pay").put(isAllowedTo("admin"), updateOrderPaid);

routes
  .route("/:orderId/deliver")
  .put(isAllowedTo("admin"), updateOrderDelivered);

module.exports = routes;
