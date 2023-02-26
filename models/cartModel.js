const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  cartItems: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
      quantity: { type: Number, default: 1 },
      price: Number,
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: ["true", "cart must belong to user"],
  },
  totalPrice: Number,
});

module.exports = mongoose.model("Carts", cartSchema);
