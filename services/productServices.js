const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const fs = require("fs/promises");
const ApiError = require("../utils/ApiError");
const cloud = require("../utils/cloudinary");
const Product = require("../models/productModels");

// desc   Get list of products
// access public
exports.getProducts = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 10;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  const objectFilter = {};
  if (req.params.categoryId) {
    objectFilter.category = req.params.categoryId;
  }
  const countDocs = await Product.countDocuments();
  const lastIndex = limit * page;
  const numOfPages = Math.ceil(countDocs / lastIndex);

  const queryStringObj = { ...req.query, ...objectFilter };

  const exclusives = ["page", "limit", "sort", "fields", "keyword"];
  exclusives.forEach((ele) => delete queryStringObj[ele]);

  let queryStr = JSON.stringify(queryStringObj);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let mongooseQuery = Product.find(JSON.parse(queryStr))
    .limit(limit)
    .skip(skip);

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery = mongooseQuery.select("-__v");
  }

  if (req.query.sort) {
    const sorting = req.query.sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sorting);
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt");
  }

  if (req.query.keyword) {
    const query = {};
    query.$or = [
      { title: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
    mongooseQuery = mongooseQuery.find(query);
  }
  const pagination = {
    page,
    numOfPages,
  };
  if (countDocs > lastIndex) {
    pagination.nextPage = +page + 1;
  }
  if (skip > 0) {
    pagination.pervoiuesPage = page - 1;
  }

  const products = await mongooseQuery;
  res
    .status(200)
    .json({ results: products.length, pagination, data: products });
});

//desc Get specific product by id
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("reviews");
  if (!product) {
    return next(new ApiError(`No product for this id ${id} `, 404));
  }
  res.status(200).json({ data: product });
});

//desc Create Product
//access Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  if (!req.files.imageCover) {
    return next(new ApiError(`image cover required  `, 400));
  }
  const imgArray = [];
  if (req.files.images) {
    await Promise.all(
      req.files.images.map(async (ele) => {
        const result = await cloud.uploads(ele.path);
        imgArray.push(result.url);
        fs.unlink(ele.path);
      })
    );
  }
  req.body.images = imgArray;
  const result = await cloud.uploads(req.files.imageCover[0].path, "products");
  req.body.imageCover = result.url;
  const product = await Product.create(req.body);
  fs.unlink(req.files.imageCover[0].path);
  res.status(201).json({ data: product });
});

//desc Update specific Product
//access Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  if (req.file) {
    const result = await cloud.uploads(req.file.path, "users");
  }
  const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!product) {
    return next(new ApiError(`No product for this id ${id} `, 404));
  }
  res.status(200).json({ data: product });
});

//desc Delete specific Product
//access Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return next(new ApiError(`No product for this id ${id} `, 404));
  }
  res.status(204).send();
});
