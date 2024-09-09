const express = require('express');
const transactionController = require('../controllers/transaction');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticate');

router.post(
  '/monthly-payment',
  authenticateToken,
  transactionController.monthlyPayment
);
router.patch('/verify', transactionController.verifyPayment);
router.get(
  '/users/:id',
  authenticateToken,
  transactionController.getUserTransactions
);
router.get('/:id', authenticateToken, transactionController.getTransactionById);

module.exports = router;
