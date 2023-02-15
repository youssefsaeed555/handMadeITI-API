const mongoose = require("mongoose");

//Creating Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " Category Required "],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short Category name"],
      maxlength: [32, "Too long Category name"],
    },
    // slug used to any category name has spaces it is changed to - , and any capital letter changed into small at URL
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, " Category image Required "],
    },
    imageId: String,
  },
  {
    //mongoose options , timestamps used to create 2 fields in DB (created at , updated at)
    // will be used to get newest categories
    timestamps: true,
  }
);

//Creating Model
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
