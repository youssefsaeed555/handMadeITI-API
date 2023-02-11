const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/users");
const generateToken = require("../utils/generateToken");

exports.changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      changePasswordAt: Date.now(),
    },
    { new: true }
  );

  //generate token
  const token = generateToken(user._id);
  return res.status(200).json({ message: "update successfully", token });
});
