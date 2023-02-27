// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require("slugify");
const fs = require("fs/promises");
const asyncHandler = require("express-async-handler");
const CategoryModel = require("../models/categoryModel");
const ApiError = require("../utils/ApiError");
const cloud = require("../utils/cloudinary");

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
    console.log('upload path 1')

  const { id } = req.params;
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
  if (!req.file)
    return next(new ApiError("image of category is required", 400));
  console.log('upload path 1')
  const result = await cloud.uploads(req.file.path, "category");
    console.log('upload path 2')
  const { name } = req.body;
  const category = await CategoryModel.create({
    name,
    slug: slugify(name),
    image: result.url,
    imageId: result.id,
  });
  console.log('upload path 3')
  await fs.unlink(req.file.path);
    console.log('upload path 4')
  res.status(201).json({
    message: "create successfully",
    data: category,
  });
});

//Update specific Category
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

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
  const { id } = req.params;
  const category = await CategoryModel.findByIdAndDelete(id);

  if (!category) {
    return next(
      new ApiError(`There is no Category to delete by this id ${id}`, 404)
    );
  }
  res.status(204).send();
});
