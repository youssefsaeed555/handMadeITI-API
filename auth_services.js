const crypto = require("crypto");

// eslint-disable-next-line node/no-extraneous-require
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const user = require("../models/users");
const ApiError = require("../utils/ApiError");
const sendMail = require("../utils/sendEmail");

const generateToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECERT, {
    expiresIn: process.env.JWT_EXPIRE,
  });

//@desc signup
//@route GET /api/v1/auth/signup
//@access public
exports.signUp = asyncHandler(async (req, res, next) => {
  //create user
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  //generate token
  const token = generateToken(newUser._id);
  //return res
  return res.status(201).json({ data: newUser, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  //1-check email exist or no
  const checkUser = await user.findOne({ email: req.body.email });
  //check user and password is valid or not
  //we want to compare password if checkuser be false only
  if (
    !checkUser ||
    !(await bcrypt.compare(req.body.password, checkUser.password))
  ) {
    return next(new ApiError("incorrect email or password", 401));
  }
  //generate token
  const token = generateToken(checkUser._id);
  //return res
  return res.status(201).json({ data: checkUser, token });
});

//make sure that user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  //1- check if token exist, if exist catch it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("you must login to access this route", 401));
  }
  //2- verify token and handle token errors
  const decoded = jwt.verify(token, process.env.JWT_SECERT);

  //3-check if user is exist or not
  const checkUser = await user.findById(decoded.userId);
  if (!checkUser) {
    return next(
      new ApiError("the user that belongs to this token no longer exist", 401)
    );
  }
  //4-check if user change password after generate its token
  if (checkUser.changePasswordAt) {
    const changPasswordTime = parseInt(
      checkUser.changePasswordAt.getTime() / 1000,
      10
    );
    if (changPasswordTime > decoded.iat) {
      return next(
        new ApiError(
          "user recently changed his password, please login again",
          401
        )
      );
    }
  }

  req.user = checkUser;
  next();
});

//chceck premetion of user
exports.isAllowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you don't have permission to access this route", 403)
      );
    }
    next();
  });

//forget password handler
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  //check if user is exist in db
  const checkUser = await user.findOne({ email: req.body.email });
  if (!checkUser) {
    return next(new ApiError("this email not found", 404));
  }
  //if user exist, generate 6 random number and save it on db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  //hash code yo save in db
  const hashCode = crypto.createHash("sha256").update(resetCode).digest("hex");

  checkUser.passwordCodeReset = hashCode;
  checkUser.passwordCodeResetExpire = Date.now() + 10 * 1000 * 60;
  checkUser.isVerified = false;
  checkUser.save();

  //send mail
  const message = `Hi ${checkUser.name} your code for reset password is ${resetCode}`;
  try {
    await sendMail({
      email: checkUser.email,
      subject: `your password reset code (valid for 10 minutes)`,
      message: message,
    });
  } catch (err) {
    checkUser.passwordCodeReset = undefined;
    checkUser.passwordCodeResetExpire = undefined;
    checkUser.isVerified = undefined;
    return next(new ApiError("failed to send mail ...", 500));
  }

  return res.status(200).json({ message: "email sent successfully" });
});
