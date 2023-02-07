const { check } = require("express-validator");
const validator = require("../../middleware/express_validator");
const User = require("../../models/users");

exports.signupValidator = [
  check("userName").notEmpty().withMessage("userName is required"),
  check("email")
    .isEmail()
    .withMessage("input right format email")
    .notEmpty()
    .withMessage("email is required")
    .custom(async (val, { req }) => {
      const checkUser = await User.findOne({ email: val });
      if (checkUser) {
        throw new Error("this Email found please input another Email");
      }
      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be greater than 8"),
  check("confirmPassword")
    .notEmpty()
    .withMessage("password is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("confirm password not match password");
      }
      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("input valid egyptian phone"),
  check("address").notEmpty().withMessage("address is required"),
  check("age")
    .optional()
    .isNumeric()
    .isLength({ min: 8 })
    .withMessage("you must be greater than 16 years old"),
  check("gender")
    .isIn(["male", "female"])
    .withMessage("gender must be female or male"),
  validator,
];

exports.validateLogin = [
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("input valid email please!"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("too short password must be greater than 6 chars"),
  validator,
];