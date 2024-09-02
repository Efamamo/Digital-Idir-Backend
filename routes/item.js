const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middlewares/file-upload');

const itemController = require('../controllers/item');
const router = express.Router();

router.get('/', itemController.getItems);
router.get('/success', itemController.stripeSuccess);

router.get('/:id', itemController.getItemById);
router.post(
  '/',
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

router.patch('/rent/:id', itemController.rentItems);

router.patch(
  '/:id',
  fileUpload.single('image'),
  [
    check('name').notEmpty().withMessage('name is required'),
    check('price').isFloat().withMessage('price is invalid'),
    check('amount').isInt().withMessage('amount is invalid'),
  ],
  itemController.updateItem
);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
