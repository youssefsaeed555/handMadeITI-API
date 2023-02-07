const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/users");
const ApiError = require("../utils/ApiError");

exports.changePassword = asyncHandler(async (req, res, next) => {
  await User.findOneAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.user.password, 12),
      changePasswordAt: Date.now(),
    },
    { new: true }
  );
  return res.status(200).json({ message: "update successfully" });
});
