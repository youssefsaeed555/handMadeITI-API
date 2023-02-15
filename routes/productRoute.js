// const { Router } = require("express");
const express = require("express");

const routes = express.Router();

const {
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../services/productServices");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator
} = require("../utils/validators/productValidator");

const upload = require('../middleware/upload_images');

const mixFiles = [{name:"imageCover",maxCount:1},{name:"images",maxCount:5}];
routes.route("/").get(getProducts).post(upload.mixFiles(mixFiles),createProductValidator,createProduct);

routes.route('/:id')
.get(getProductValidator,getProduct)
.put(updateProductValidator,updateProduct)
.delete(deleteProductValidator,deleteProduct);

module.exports = routes;