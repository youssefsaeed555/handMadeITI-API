// eslint-disable-next-line import/no-extraneous-dependencies
const stripe = require("stripe")(process.env.STRIPE_SECRET);

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

//change status of paid
exports.updateOrderPaid = asyncHandler(async (req, res, next) => {
  const updateOrder = await Order.findById(req.params.orderId);
  if (!updateOrder) {
    return next(
      new ApiError(`no order for this id ${req.params.orderId}`, 404)
    );
  }

  updateOrder.isPaid = true;
  updateOrder.paidAt = Date.now();

  await updateOrder.save();
  return res.status(200).json({
    message: "success",
    data: updateOrder,
  });
});

//change status of delivered
exports.updateOrderDelivered = asyncHandler(async (req, res, next) => {
  const updateOrder = await Order.findById(req.params.orderId);
  if (!updateOrder) {
    return next(
      new ApiError(`no order for this id ${req.params.orderId}`, 404)
    );
  }

  updateOrder.isDelivered = true;
  updateOrder.DeliveredAt = Date.now();

  await updateOrder.save();
  return res.status(200).json({
    message: "success",
    data: updateOrder,
  });
});

//change status of order
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const updateOrder = await Order.findById(req.params.orderId);
  if (!updateOrder) {
    return next(
      new ApiError(`no order for this id ${req.params.orderId}`, 404)
    );
  }

  updateOrder.orderStatus = req.body.orderStatus;

  await updateOrder.save();
  return res.status(200).json({
    message: "update status successfully",
    data: updateOrder,
  });
});

exports.checkOutSession = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`no cart for this user`, 404));
  }

  const totalOrderPrice = cart.totalPrice;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.userName,
            description: "welcome in handMade ITI ",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    client_reference_id: req.params.cartId,
    customer_email: req.user.email,
    metadata: req.body.shippingAddress,
  });
  return res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
  const cart = await Cart.findById(session.client_reference_id);

  //create order
  const order = await Order.create({
    user: cart.user,
    totalOrderPrice: session.amount_total / 100,
    cartItems: cart.cartItems,
    shippingAddress: session.metadata,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: "card",
  });

  //increase sold and decrese quantity of product
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { sold: +item.quantity, quantity: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});
    await Cart.findByIdAndDelete(session.client_reference_id);
  }
};

exports.webHookHandler = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_STRIPE
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }
  return res.status(200).json({ received: "success" });
});
