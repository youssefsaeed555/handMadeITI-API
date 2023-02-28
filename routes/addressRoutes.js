const express = require("express");

const authServices = require("../services/authServices");

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../services/addressServices");

const router = express.Router();

router.use(authServices.protect, authServices.isAllowedTo("user", "admin"));

router.route("/").post(addAddress).get(getLoggedUserAddresses);

router.route("/:addressId").delete(removeAddress);

module.exports = router;
