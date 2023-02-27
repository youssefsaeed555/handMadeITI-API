const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: ["true", "orders must belong to user"],
    },
    cartItems: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        price: Number,
        quantity: Number,
      },
    ],
    shippingAddress: {
      details: String,
      postalCode: Number,
      city: String,
      phone: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    DeliveredAt: Date,
    totalOrderPrice: Number,
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema);
