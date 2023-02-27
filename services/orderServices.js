const asyncHandler = require("express-async-handler");

const Cart = require("../models/cartModel");
const Product = require("../models/productModels");
const Order = require("../models/orderModel");
const ApiError = require("../utils/ApiError");

exports.createOrder = asyncHandler(async (req, res, next) => {
  //get user cart
  const taxPrice = 0;
  const shippingPrice = 0;
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`no cart for this user`, 404));
  }
  const totalprice = taxPrice + shippingPrice + cart.totalPrice;

  //create order
  const order = await Order.create({
    cartItems: cart.cartItems,
    totalOrderPrice: totalprice,
    user: req.user._id,
    shippingAddress: req.body.shippingAddress,
  });

  if (order) {
    //increase sold and reduce quantity
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { sold: +item.quantity, quantity: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    //clear item
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  return res.status(200).json({
    message: "success",
    data: order,
  });
});

exports.getLoggedUserOrder = (req, res, next) => {
  if (req.user.role === "user") {
    req.objFilter = { user: req.user._id };
  }
  next();
};

exports.getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let queryFilter = {};
  if (req.objFilter) queryFilter = req.objFilter;
  const order = await Order.findById({ _id: id, queryFilter });
  if (!order) {
    return next(new ApiError(`No order for this id ${id} `, 404));
  }
  res.status(200).json({ data: order });
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const { page } = req.query;
  const { limit } = req.query || 5;
  const skip = (page - 1) * limit;
  let objectFilter = {};
  if (req.objFilter) objectFilter = req.objFilter;
  const orders = await Order.find(objectFilter).skip(skip).limit(limit);
  res.status(200).json({
    result: orders.length,
    page,
    data: orders,
  });
});
