const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticate');
const { getAdmins, addAdmin } = require('../controllers/admin');
router.get('/', authenticateToken, getAdmins);

router.post(
  '/',
  authenticateToken,
  [
    check('username').notEmpty().withMessage('username cant be empty'),
    check('email').notEmpty().withMessage('email cant be empty'),
    check('email').normalizeEmail().isEmail().withMessage('invalid email'),
    check('password').isLength({ min: 6 }).withMessage('password is too small'),
    check('password')
      .isLength({ max: 50 })
      .withMessage('password is too large'),
    check('phoneNumber').notEmpty().withMessage('phoneNumber cant be empty'),
    check('phoneNumber').isMobilePhone().withMessage('phone number is invalid'),
    check('roles').notEmpty().withMessage('roles cant be empty'),
  ],
  addAdmin
);

module.exports = router;
