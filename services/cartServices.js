const asyncHandler = require("express-async-handler");

const Cart = require("../models/cartModel");
const Product = require("../models/productModels");
const ApiError = require("../utils/ApiError");

function calcTotalPrice(cart) {
  let totalprice = 0;
  cart.cartItems.forEach((item) => {
    totalprice += item.quantity * item.price;
  });
  cart.totalPrice = totalprice;
}

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  const product = await Product.findById(productId);
  if (product.quantity < 1) {
    return next(new ApiError("this product is out of stock", 400));
  }
  //if user haven't cart then create cart
  if (!cart) {
    cart = await Cart.create({
      cartItems: [{ product: productId, price: product.price }],
      user: req.user._id,
    });
  } else {
    //if product exist in cart update quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );
    if (productIndex > -1) {
      const updateCart = cart.cartItems[productIndex];
      updateCart.quantity += 1;
      cart.cartItems[productIndex] = updateCart;
    } else {
      cart.cartItems.push({ product: productId, price: product.price });
    }
  }
  calcTotalPrice(cart);
  await cart.save();

  return res.status(200).json({
    message: "added to cart successfully",
    numberOfCartItems: cart.cartItems.length,
    cart,
  });
});

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const userCart = await Cart.findOne({ user: req.user._id });
  if (!userCart) {
    return next(new ApiError(`no cart for this user`, 404));
  }
  return res
    .status(200)
    .json({ numberOfCartItems: userCart.cartItems.length, userCart });
});

exports.deleteFromCart = asyncHandler(async (req, res, next) => {
  const userCart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.cartItemId } },
    },
    { new: true }
  );
  calcTotalPrice(userCart);
  userCart.save();
  return res.status(200).json({
    message: "product removed from cart successfully",
    numberOfCartItems: userCart.cartItems.length,
    userCart,
  });
});

exports.clearAll = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  return res.status(204).send();
});

exports.updateQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(`no cart for this user`, 404));
  }
  const cartItemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.cartItemId
  );
  const product = await Product.findById(cart.cartItems[cartItemIndex].product);
  if (!product) {
    return next(new ApiError(`no product found to update quantity`, 404));
  }
  if (quantity > product.quantity) {
    return next(
      new ApiError(
        `there is only ${product.quantity} for this product to add in cart`,
        400
      )
    );
  }

  if (cartItemIndex > -1) {
    const cartItem = cart.cartItems[cartItemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[cartItemIndex] = cartItem;
  }
  calcTotalPrice(cart);
  await cart.save();
  return res.status(200).json({
    message: "product updated successfully",
    numberOfCartItems: cart.cartItems.length,
    cart,
  });
});
