const slugify = require("slugify");
const CategoryModel = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");

//Get All categories
exports.getCategories = asyncHandler(async (req, res) => {
  //Create Pagination
  const page = req.query.page * 1 || 1;
  //Limit the products in one page #can be changed
  const limit = req.query.limit * 1 || 5;
  // u want to skip how many product in next page [page 3 : (3-1)*5 = 10 , skip first 10 products]
  const skip = (page - 1) * limit;
  const categories = await CategoryModel.find({}).skip(skip).limit(limit);
  res.status(200).json({
    result: categories.length,
    page,
    data: categories,
  });
});

// Get specific Category by ID
exports.getCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id);
  if (!category) {
    res.status(404).json({
      msg: `There is no Category by this id ${id}`,
    });
  }
  res.status(200).json({
    data: category,
  });
});

//Create New category
exports.createCategory = asyncHandler(async (req, res) => {
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
exports.updateCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  const category = await CategoryModel.findByIdAndUpdate(id, {
    name,
    slug: slugify(name),
  });

  if (!category) {
    res.status(404).json({
      msg: `There is no Category to Update by this id ${id}`,
    });
  }
  res.status(200).json({
    data: category,
  });
});

//Delete Specific Category
exports.deleteCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const category = await CategoryModel.findByIdAndDelete(id);

  if (!category) {
    res.status(404).json({
      msg: `There is no Category to delete by this id ${id}`,
    });
  }
  res.status(204).send();
});
