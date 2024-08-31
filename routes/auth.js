const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth")

const router = express.Router();

router.post("/signup", [
  check("username").notEmpty().withMessage("username cant be empty"),
  check("email").notEmpty().withMessage("email cant be empty"),
  check("email").normalizeEmail().isEmail().withMessage("invalid email"),
  check("password").isLength({min: 6}).withMessage("password is too small"),
  check("password").isLength({max: 50}).withMessage("password is too large"),
  check("phoneNumber").notEmpty().withMessage("phoneNumber cant be empty"),
  check("phoneNumber").isMobilePhone().withMessage("phone number is invalid")  
], authController.signup);
router.post("/login", [
    check("username").notEmpty().withMessage("username cant be empty"),
    check("password").notEmpty().withMessage("password cant be empty"),

], authController.login);
router.post("/logout", authController.logout);

module.exports = router;
