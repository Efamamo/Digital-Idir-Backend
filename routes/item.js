const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middlewares/file-upload');
const authenticateToken = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorize-admin');

const itemController = require('../controllers/item');
const router = express.Router();

router.get('/', authenticateToken, itemController.getItems);
router.get('/success', itemController.stripeSuccess);

router.get('/:id', authenticateToken, itemController.getItemById);
router.post(
  '/',
  authenticateToken,
  authorizeAdmin,
  fileUpload.single('image'),
  [
    check('name').notEmpty().withMessage('name is required'),
    check('price').isFloat().withMessage('price is invalid'),
    check('amount').isInt().withMessage('amount is invalid'),
  ],
  itemController.addItem
);

router.patch(
  '/borrow',
  authenticateToken,
  [
    check('userId').notEmpty().withMessage('userId is required'),
    check('items')
      .notEmpty()
      .withMessage('items are required')
      .isArray()
      .withMessage('items should be an array'),
    check('items.*.name').notEmpty().withMessage('Each item must have a name'),
    check('items.*.amount')
      .notEmpty()
      .withMessage('Each item must have an amount')
      .isInt({ gt: 0 })
      .withMessage('Each item amount must be a positive integer'),
  ],
  itemController.borrowItem
);

router.patch(
  '/return',
  authenticateToken,
  [
    check('userId').notEmpty().withMessage('userId is required'),
    check('items')
      .notEmpty()
      .withMessage('items are required')
      .isArray()
      .withMessage('items should be an array'),
    check('items.*.name').notEmpty().withMessage('Each item must have a name'),
    check('items.*.amount')
      .notEmpty()
      .withMessage('Each item must have an amount')
      .isInt({ gt: 0 })
      .withMessage('Each item amount must be a positive integer'),
  ],
  itemController.returnItems
);

router.patch(
  '/order-rent',
  authenticateToken,
  [
    check('items')
      .notEmpty()
      .withMessage('items are required')
      .isArray()
      .withMessage('items should be an array'),
    check('items.*.id').notEmpty().withMessage('Each item must have id'),
    check('items.*.amount')
      .notEmpty()
      .withMessage('Each item must have an amount')
      .isInt({ gt: 0 })
      .withMessage('Each item amount must be a positive integer'),
  ],
  itemController.checkoutSession
);

router.patch(
  '/return-rent',
  authenticateToken,
  authorizeAdmin,
  [
    check('items')
      .notEmpty()
      .withMessage('items are required')
      .isArray()
      .withMessage('items should be an array'),
    check('items.*.name').notEmpty().withMessage('Each item must have name'),
    check('items.*.amount')
      .notEmpty()
      .withMessage('Each item must have an amount')
      .isInt({ gt: 0 })
      .withMessage('Each item amount must be a positive integer'),
  ],
  itemController.returnRentItems
);

router.patch(
  '/rent/:id',
  authenticateToken,
  authorizeAdmin,
  itemController.rentItems
);

router.patch(
  '/:id',
  authenticateToken,
  authorizeAdmin,
  fileUpload.single('image'),
  [
    check('name').notEmpty().withMessage('name is required'),
    check('price').isFloat().withMessage('price is invalid'),
    check('amount').isInt().withMessage('amount is invalid'),
  ],
  itemController.updateItem
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeAdmin,
  itemController.deleteItem
);

module.exports = router;
