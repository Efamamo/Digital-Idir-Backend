const express = require('express');

const transactionController = require('../controllers/transaction');
const router = express.Router();

router.get('/monthly-payment', transactionController.monthlyPayment);
router.get('/success', transactionController.stripeSuccess);

module.exports = router;
