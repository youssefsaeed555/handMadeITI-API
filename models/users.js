const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "please input your user name"],
  },
  email: {
    type: String,
    unique: [true, "email must ne unique"],
    required: [true, "please input your email"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minLength: [8, "too short password"],
  },
  phone: String,
  profileImg: String,
  age: {
    type: Number,
    min: [16, "you must be greater than 16 years old"],
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  role: {
    type: String,
    enum: ["user", "seller", "admin"],
    default: "user",
  },
  changePasswordAt: Date,
  passwordCodeReset: String,
  passwordCodeResetExpire: Date,
  isVerified: Boolean,
});

module.exports = mongoose.model("Users", userSchema);
