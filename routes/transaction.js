const express = require('express');
const transactionController = require('../controllers/transaction');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticate');

router.post(
  '/monthly-payment',
  authenticateToken,
  transactionController.monthlyPayment
);
router.get('/verify', transactionController.verifyPayment);
router.get('/', authenticateToken, transactionController.getUserTransactions);
router.get('/:id', authenticateToken, transactionController.getTransactionById);

module.exports = router;
