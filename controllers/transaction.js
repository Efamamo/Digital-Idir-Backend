const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const Transaction = require('../models/transaction');
const monthlyPayment = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', // 'payment' mode for one-time payments
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Monthly Payment', // Description of the payment
          },
          unit_amount: 100000, // Amount in cents (1000 USD = 100000 cents)
        },
        quantity: 1, // Only one "item" for the payment
      },
    ],
    success_url:
      'http://localhost:5000/api/v1/transactions/success?session_id={CHECKOUT_SESSION_ID}', // Add session ID to the URL
    cancel_url: 'http://localhost:5050',
  });
  res.redirect(session.url);
};

const stripeSuccess = async (req, res) => {
  const session_id = req.query.session_id;

  if (!session_id) {
    return res.status(400).send({ error: 'No session ID provided.' });
  }

  try {
    // Retrieve the session and expand the line_items field
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'], // This tells Stripe to include line_items in the response
    });

    // Extract the customer details
    const customerEmail = session.customer_details.email;
    const user = await User.findOne({ email: customerEmail });
    if (!user) {
      return res.status(404).send({ error: 'no user with given email' });
    }
    const userId = user._id;
    const name = session.line_items.data[0].description;
    const amount = session.line_items.data[0].price.unit_amount / 100;

    const newTransaction = new Transaction({
      name,
      userId,
      amount,
      date: new Date(),
    });

    await newTransaction.save();

    res.status(201).send(newTransaction);
  } catch (err) {
    console.error(`Error retrieving session: ${err.message}`);
    res.status(500).send({ error: err.message });
  }
};

exports.monthlyPayment = monthlyPayment;
exports.stripeSuccess = stripeSuccess;
