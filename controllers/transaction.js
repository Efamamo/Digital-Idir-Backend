const User = require('../models/user');
const Transaction = require('../models/transaction');
const dotenv = require('dotenv');

dotenv.config();
const monthlyPayment = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(403).send({ error: 'User not found' });
  }

  const newTransaction = new Transaction({
    name: 'Monthely Payment',
    userId: user._id,
    amount: 1000,
  });

  const tx = `chewatatest-${newTransaction._id}`;
  var myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${process.env.CHAPA_SECRET_KEY}`);
  myHeaders.append('Content-Type', 'application/json');

  var raw = JSON.stringify({
    amount: 1000,
    currency: 'ETB',
    phone_number: req.body.phoneNumber,
    tx_ref: tx,
    callback_url: 'https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60',
    return_url: `https://digital-idir-backend.onrender.com/api/v1/transactions/verify?id=${tx}`,
    'customization[title]': 'Payment for my favourite merchant',
    'customization[description]': 'I love online payments',
    'meta[hide_receipt]': 'true',
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  };

  const response = await fetch(
    'https://api.chapa.co/v1/transaction/initialize',
    requestOptions
  );

  const result = await response.json();

  if (result.status === 'success') {
    await newTransaction.save();

    res.send(result.data.checkout_url);
  } else {
    return res.status(500).json('server error');
  }
};

const verifyPayment = async (req, res) => {
  const chapa_id = req.query.id;

  if (!chapa_id) {
    return res.status(400).send({ error: 'No ID provided.' });
  }

  try {
    const arr = chapa_id.split('-');
    if (arr.length != 2) {
      return res.status(400).send({ error: 'ID provided is invalid.' });
    }

    const id = arr[1];
    const transaction = await Transaction.findById(id);

    transaction.isVerified = true;
    await transaction.save();

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #333;
            }
            .content {
              text-align: center;
              color: #555;
              line-height: 1.6;
            }
            .content p {
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Transaction Successful!</h1>
            </div>
            <div class="content">
              <p>Congratulations! Your transuction has been successfully verified.</p>
              <p>Thank you for making your monthely due. </p>
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Digital Idir. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(`Error retrieving session: ${err.message}`);
    res.status(500).send({ error: err });
  }
};

const getUserTransactions = async (req, res) => {
  const userId = req.user.id;
  try {
    const transactions = await Transaction.find({ userId, isVerified: true });
    return res.json(transactions);
  } catch (e) {
    res.status(500).send({ error: 'server error' });
  }
};

const getTransactionById = async (req, res) => {
  const id = req.params.id;
  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).send({ error: 'transaction not found' });
    }
    return res.json(transaction);
  } catch (e) {
    res.status(500).send({ error: 'server error' });
  }
};

exports.monthlyPayment = monthlyPayment;
exports.verifyPayment = verifyPayment;
exports.getTransactionById = getTransactionById;
exports.getUserTransactions = getUserTransactions;
