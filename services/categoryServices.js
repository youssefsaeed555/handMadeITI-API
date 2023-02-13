const slugify = require("slugify");
const CategoryModel = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

//Get All categories
exports.getCategories = asyncHandler(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const categories = await CategoryModel.find({}).skip(skip).limit(limit);
  res.status(200).json({
    result: categories.length,
    page,
    data: categories,
  });
});

// Get specific Category by ID
exports.getCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id);
  if (!category) {
    return next(new ApiError(`There is no Category by this id ${id}`, 404));
  }
  res.status(200).json({
    data: category,
  });
});

//Create New category
exports.createCategory = asyncHandler(async (req, res, next) => {
  const name = req.body.name;
  const category = await CategoryModel.create({
    name,
    slug: slugify(name),
  });
  res.status(201).json({
    data: category,
  });
});

//Update specific Category
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;

  const category = await CategoryModel.findByIdAndUpdate(id, {
    name,
    slug: slugify(name),
  });

  if (!category) {
    return next(
      new ApiError(`There is no Category to Update by this id ${id}`, 404)
    );
  }
  res.status(200).json({
    data: category,
  });
});

//Delete Specific Category
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findByIdAndDelete(id);

  if (!category) {
    return next(
      new ApiError(`There is no Category to delete by this id ${id}`, 404)
    );
  }
  res.status(204).send();
});
