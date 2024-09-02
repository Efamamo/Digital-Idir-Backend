const express = require('express');
const transactionController = require('../controllers/transaction');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticate');

router.get('/monthly-payment', transactionController.monthlyPayment);
router.get('/success', transactionController.stripeSuccess);
router.get(
  '/users/:id',
  authenticateToken,
  transactionController.getUserTransactions
);
router.get('/:id', authenticateToken, transactionController.getTransactionById);

module.exports = router;
