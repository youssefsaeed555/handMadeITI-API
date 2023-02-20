const express = require("express");

const authServices = require("../services/authServices");

const {
  getCategoryValidator,
  updateCategoryValidator,
  createCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryServices");

const router = express.Router();

const upload = require("../middleware/upload_images");

router
  .route("/")
  .get(getCategories)
  .post(
    authServices.protect,
    authServices.isAllowedTo("admin"),
    upload.uploadSingle("image"),
    createCategoryValidator,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authServices.protect,
    authServices.isAllowedTo("admin"),
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authServices.protect,
    authServices.isAllowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
