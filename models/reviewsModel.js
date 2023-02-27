const mongoose = require("mongoose");

const Product = require("./productModels");

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

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "userName" });
  next();
});

reviewSchema.statics.calcAvgRatingAndQuantity = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "product",
        ratingsAverage: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingQuantity: result[0].ratingQuantity,
      ratingsAverage: result[0].ratingsAverage,
    });
  }
};

reviewSchema.post("save", async function (doc) {
  await this.constructor.calcAvgRatingAndQuantity(doc.product);
});

reviewSchema.post("remove", async function (doc) {
  await this.constructor.calcAvgRatingAndQuantity(doc.product);
});

module.exports = mongoose.model("Reviews", reviewSchema);
