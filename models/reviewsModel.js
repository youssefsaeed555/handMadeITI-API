const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      max: [5, "max rating value is 5.0"],
      min: [1, "max rating value is 1.0"],
      required: [true, "rating is required"],
    },
    comment: String,
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: [true, "review must belongs to user"],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: [true, "Product must belongs to user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewSchema);
