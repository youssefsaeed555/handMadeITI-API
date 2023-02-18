const { check } = require("express-validator");
const validator = require("../../middleware/express_validator");
const Reviews = require("../../models/reviewsModel");
const Product = require("../../models/productModels");

exports.validateCreateReview = [
  check("rating")
    .notEmpty()
    .withMessage("rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("max rating value must between 1.0 and 5.0"),
  check("comment").optional(),
  check("product").custom(async (val, { req }) => {
    const product = await Product.findOne({ _id: val });
    if (!product) {
      throw new Error("this product not found");
    }
    return true;
  }),
  check("user").custom(async (val, { req }) => {
    const user = await Reviews.findOne({
      user: req.user._id,
      product: req.body.product,
    });
    if (user) {
      throw new Error("you already create review before");
    }
    return true;
  }),
  validator,
];

exports.validateUpdateReview = [
  check("id").custom(async (val, { req }) => {
    const review = await Reviews.findById(val);
    if (!review) {
      throw new Error("review not found");
    }
    if (review.user.toString() !== req.user._id.toString()) {
      throw new Error("you not allowed to modify this review");
    }
    return true;
  }),
  validator,
];

exports.validateDeleteReview = [
  check("id").custom(async (val, { req }) => {
    const review = await Reviews.findById(val);
    if (!review) {
      throw new Error("review not found");
    }
    if (req.user.role === "user") {
      if (review.user.toString() !== req.user._id.toString()) {
        throw new Error("you not allowed to modify this review");
      }
    }
    return true;
  }),
  validator,
];

exports.checkReview = [
  check("id").isMongoId().withMessage(`invalid id format `),
  validator,
];
