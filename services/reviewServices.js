const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Reviews = require("../models/reviewsModel");

exports.setParamsOfProduct = (req, res, next) => {
  const objFilter = {};
  if (req.params.productId) {
    objFilter.product = req.params.productId;
  }
  req.objFilter = objFilter;
  next();
};

exports.setProductBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  next();
};

exports.getAllReviews = asyncHandler(async (req, res, next) => {
  const { page } = req.query;
  const { limit } = req.query || 5;
  const skip = (page - 1) * limit;
  let objectFilter = {};
  if (req.objFilter) objectFilter = req.objFilter;
  const reviews = await Reviews.find(objectFilter).skip(skip).limit(limit);
  res.status(200).json({
    result: reviews.length,
    page,
    data: reviews,
  });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Reviews.findById(id);
  if (!review) {
    return next(new ApiError(`There is no review for this id ${id}`, 404));
  }
  res.status(200).json({
    data: review,
  });
});

exports.createReview = asyncHandler(async (req, res, next) => {
  const review = await Reviews.create({
    user: req.user._id,
    ...req.body,
  });
  res.status(201).json({
    message: "review created successfully",
    data: review,
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Reviews.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    { new: true }
  );

  if (!review) {
    return next(
      new ApiError(`There is no review to Update by this id ${id}`, 404)
    );
  }
  res.status(200).json({
    message: "updated successfully",
    data: review,
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Reviews.findByIdAndDelete(id);
  if (!review) {
    return next(
      new ApiError(`There is no review to delete by this id ${id}`, 404)
    );
  }
  res.status(204).send();
});
