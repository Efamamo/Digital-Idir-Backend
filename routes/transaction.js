const express = require('express');
const { check } = require('express-validator');
const transactionController = require('../controllers/transaction');
const router = express.Router();

router.get('/monthly-payment', transactionController.monthlyPayment);
router.get('/success', transactionController.stripeSuccess);
router.get('/users/:id', transactionController.getUserTransactions);
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
