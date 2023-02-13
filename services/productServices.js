// eslint-disable-next-line import/no-extraneous-dependencies
const slugify =require('slugify'); //convert any space to -
//handling exceptions and passing t express error handler
const asyncHandler=require('express-async-handler');
const ApiError= require('../utils/ApiError');

const Product = require('../models/productModels');
// const cloud = require('../utils/cloudinary');

// desc   Get list of products
// route  Get/api
// access public
exports.getProducts = asyncHandler(async (req,res)=>{
 const page = req.query.page*1 || 1;
 const limit=req.query.limit*1||5;
 const skip = (page-1)*limit;

 const products =await Product.find({}).skip(skip).limit(limit);
//  const products =await Product.find({}).skip(skip).limit(limit).populate({path:'category',select:'name -_id'});

 res.status(200).json({results:products.length,data:products})

});

//desc Get specific product by id 
exports.getProduct = asyncHandler(async(req,res,next)=>{
 const {id}=req.params;
 const product = await Product.findById(id);
 if (!product){
    return next(new ApiError(`No product for this id ${id} `,404));

 }
 res.status(200).json({data:product});

});

//desc Create Product
//access Private
exports.createProduct = asyncHandler(async(req,res)=>{
   console.log(req.file);
 req.body.slug=slugify(req.body.title);
 const product = await Product.create(req.body);
 res.status(201).json({data:product});

});

//desc Update specific Product
//access Private
exports.updateProduct = asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    if(req.body.title){

       req.body.slug=slugify(req.body.title);
    }
    const product = await Product.findOneAndUpdate({_id:id},req.body,{new:true});
    if(!product){
    return next(new ApiError(`No product for this id ${id} `,404));
    }
    res.status(200).json({data:product});
   
   });

//desc Delete specific Product
//access Private
exports.deleteProduct = asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
   
    const product = await Product.findByIdAndDelete(id);
    if(!product){
    return next(new ApiError(`No product for this id ${id} `,404));
    }
    res.status(204).send();
   
   });