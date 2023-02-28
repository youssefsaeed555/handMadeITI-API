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
  profileImgId: String,
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
  wishlist: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  // address will be embedded her as it is small not too many address for user
  addresses: [
    {
      id: {
        //mongoose.Schema.Types.ObjectId for unique id
        type: mongoose.Schema.Types.ObjectId,
      },
      //alias name like home , work ..
      alias: String,
      country: String,
      governorate: String,
      city: String,
      street: String,
      build_no: String,
    },
  ],
  changePasswordAt: Date,
  passwordCodeReset: String,
  passwordCodeResetExpire: Date,
  isVerified: Boolean,
});

userSchema.pre(/^find/, function (next) {
  this.populate("wishlist");
  next();
});

module.exports = mongoose.model("Users", userSchema);
