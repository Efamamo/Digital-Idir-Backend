const express = require("express");
const { check } = require("express-validator");
const passport = require("passport")

const fileUpload = require("../middlewares/file-upload");

const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("username").notEmpty().withMessage("username cant be empty"),
    check("email").notEmpty().withMessage("email cant be empty"),
    check("email").normalizeEmail().isEmail().withMessage("invalid email"),
    check("password").isLength({ min: 6 }).withMessage("password is too small"),
    check("password")
      .isLength({ max: 50 })
      .withMessage("password is too large"),
    check("phoneNumber").notEmpty().withMessage("phoneNumber cant be empty"),
    check("phoneNumber").isMobilePhone().withMessage("phone number is invalid"),
  ],
  authController.signup
);

router.post("/token",authController.refresh)
router.post(
  "/login",
  [
    check("email").notEmpty().withMessage("email cant be empty"),
    check("email").normalizeEmail().isEmail().withMessage("email is invalid"),
    check("password").notEmpty().withMessage("password cant be empty"),
  ],
  authController.login
);
router.delete("/logout", authController.logout);

router.get("/google", passport.authenticate('google', {
  scope: ['profile', 'email']
}))

router.get("/callback",passport.authenticate("google", { session: false}), authController.googleCallback)

module.exports = router;
