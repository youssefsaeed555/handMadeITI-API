const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const ApiError = require("../utils/ApiError");

const generateToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

exports.signup = asyncHandler(async (req, res, next) => {
  const password = await bcrypt.hash(req.body.password, 12);
  const newUser = await User.create({ ...req.body, password });
  const token = generateToken(newUser._id);
  return res.status(201).json({ message: "created successfully", token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const checkEmail = await User.findOne({ email: req.body.email });

  if (
    !checkEmail ||
    !(await bcrypt.compare(req.body.password, checkEmail.password))
  ) {
    return next(new ApiError("incorrect email or password", 401));
  }
  const token = generateToken(checkEmail._id);

  return res.status(200).json({ message: "login success", token });
});
