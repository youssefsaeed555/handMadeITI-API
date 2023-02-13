const { check } = require("express-validator");
const validator = require("../../middleware/express_validator");
// const Category = require('../../models/categoryModel');//waiting
exports.createProductValidator = [
  check("title")
  .isLength({min:3})
  .withMessage("must be at least 3 chars")
  .notEmpty()
  .withMessage('Product required'),
  check("description")
    .notEmpty()
    .withMessage("product description is required")
    .isLength({max:2000})
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({max:32})
    .withMessage('To long price'),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value,{req})=>{
        if(req.body.price <= value){
            throw new Error('priceAfterDiscount must be lower than price');
        }
        return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors must be array of string"),
  check('imageCover').notEmpty().withMessage('Image Cover is required'),
  check('images').optional().isArray().withMessage('images should be array of string'),
   check('category')
     .notEmpty()
    .withMessage('Product must be belong to a category')
    .isMongoId()
    .withMessage('Invalid ID format ')
      //check if this category exist or not
    .custom((categoryId)=>Category.findById(categoryId).then((category)=>{
     if(!category){
       return Promise.reject(new Error(`No category for this id ${categoryId}`));
     }
    })),
  check('ratingsAverage')
   .optional()
   .isNumeric()
   .withMessage('rating must be a number')
   .isLength({min:1})
   .withMessage('Rating must be above or equal 1.0')
   .isLength({max:5})
   .withMessage('Rating must be below or equal 5.0'),
  check('ratingQuantity')
   .optional()
   .isNumeric()
   .withMessage('Rating Quantity must be a number '),

  validator,
];

exports.getProductValidator= [
    check('id').isMongoId().withMessage('Invalid ID format'),
    validator,
];

exports.updateProductValidator= [
    check('id').isMongoId().withMessage('Invalid ID format'),
    validator,
];

exports.deleteProductValidator=[
    check('id').isMongoId().withMessage('Invalid ID format'),
    validator,
];
