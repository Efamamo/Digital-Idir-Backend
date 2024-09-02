const Item = require('../models/items');
const User = require('../models/user');
const Rent = require('../models/rent');
const sendRentNotification = require('../cron/rent-notification');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require('express-validator');
require('dotenv').config();

const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (e) {
    res.status(500).send({ error: 'server error' });
  }
};

const getItemById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).send({ error: 'item not found' });
    }
    return res.json(item);
  } catch (e) {
    res.status(500).send({ error: 'server error' });
  }
};

const addItem = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }

    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const { name, price, amount } = req.body;

    const newItem = new Item({
      name: name.toLowerCase(),
      price,
      amount,
      imageURL: req.file ? req.file.path : '',
    });

    await newItem.save();
    res.send(newItem);
  } catch (e) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }
    res.status(500).send({ error: 'server error' });
  }
};

const updateItem = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }
    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const id = req.params.id;
    const { name, price, amount } = req.body;

    const item = await Item.findById(id);
    item.name = name.toLowerCase();
    item.price = price;
    item.amount = amount;
    item.imageURL = req.file ? req.file.path : '';

    await item.save();
    res.send(item);
  } catch (e) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }
    res.status(500).send({ error: 'server error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).send({ error: 'item not found' });
    }

    return res.status(204).send();
  } catch (e) {
    res.status(500).send({ error: 'server error' });
  }
};

const borrowItem = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const { userId, items } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).send({ error: 'User not found' });
    }

    const errors = [];

    for (const item of items) {
      const { name, amount } = item;
      const n = name.toLowerCase();
      const i = await Item.findOne({ name: n });
      if (!i) {
        errors.push({ name: `${name} not found` });
      } else if (i.amount < amount) {
        errors.push({ name: `${name} amount is unavailable` });
      }
    }

    if (errors.length !== 0) {
      return res.status(400).send({ errors });
    }

    for (const item of items) {
      const { name, amount } = item;
      const n = name.toLowerCase();
      const i = await Item.findOne({ name: n });

      i.amount -= amount;

      let isAlreadyIn = false;

      for (let j = 0; j < user.borrowedItems.length; j++) {
        if (user.borrowedItems[j].name === name.toLowerCase()) {
          console.log('changing amount');
          user.borrowedItems[j].amount += amount;
          isAlreadyIn = true;
          user.markModified(`borrowedItems.${j}.amount`);
          break;
        }
      }

      if (!isAlreadyIn) {
        user.borrowedItems.push({ name: n, amount, date: new Date() });
      }

      await i.save();
    }

    await user.save();

    res.json({ items: user.borrowedItems });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
  }
};

const returnItems = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const { userId, items } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).send({ error: 'User not found' });
    }

    const errors = [];

    for (const item of items) {
      const { name, amount } = item;
      const n = name.toLowerCase();
      const i = await Item.findOne({ name: n });
      if (!i) {
        errors.push(`name: ${name} not found`);
      }
      let exists = false;
      for (const uitems of user.borrowedItems) {
        if (n == uitems.name) {
          exists = true;
          if (uitems.amount < amount) {
            errors.push(
              `amount :  you only borrowed ${uitems.amount} ${uitems.name}s`
            );
          }
        }
      }

      if (!exists) {
        errors.push(`name: you did not borrow ${name}`);
      }
    }

    if (errors.length !== 0) {
      return res.status(400).send({ errors });
    }

    for (const item of items) {
      const { name, amount } = item;
      const n = name.toLowerCase();
      const i = await Item.findOne({ name: n });

      i.amount += amount;

      let fullyReturned = false;

      for (let j = 0; j < user.borrowedItems.length; j++) {
        if (user.borrowedItems[j].name === name.toLowerCase()) {
          user.borrowedItems[j].amount -= amount;
          if (user.borrowedItems[j].amount == 0) {
            fullyReturned = true;
          }
          user.markModified(`borrowedItems.${j}.amount`);
          break;
        }
      }

      if (fullyReturned) {
        user.borrowedItems = user.borrowedItems.filter(
          (borrowedItem) => borrowedItem.name !== n
        );
        user.markModified('borrowedItems');
      }

      await i.save();
    }

    await user.save();

    res.json({ items: user.borrowedItems });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
  }
};

const checkoutSession = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const errors = [];
    for (const item of req.body.items) {
      const { id, amount } = item;
      
      const i = await Item.findById(id);
      if (!i) {
        errors.push(`item with id ${id} not found`);
      }
      if (i.amount < amount) {
        errors.push(`amount: there are only ${i.amount} ${i.name}s`);
      }
    }

    if (errors.length !== 0) {
      return res.status(400).send({ errors });
    }

    const lineItems = await Promise.all(
      req.body.items.map(async (item) => {
        const my_item = await Item.findById(item.id);
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: my_item.name,
            },
            unit_amount: my_item.price * 100, // Stripe requires amount in cents
          },
          quantity: item.amount,
        };
      })
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url:
        'http://localhost:5000/api/v1/items/success?session_id={CHECKOUT_SESSION_ID}', // Add session ID to the URL
      cancel_url: 'http://localhost:5050',
    });
    res.send({ url: session.url });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
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
    const customerName = session.customer_details.name;
    const totalAmount = session.amount_total / 100; // Convert to dollars if needed

    // Extract line items details
    const items = session.line_items.data.map((item) => ({
      name: item.description, // This is the product name
      quantity: item.quantity,
      unit_amount: item.price.unit_amount / 100, // Convert to dollars if needed
    }));

    const newRent = new Rent({
      email: customerEmail,
      items,
      name: customerName,
      totalAmount,
    });

    await newRent.save();

    sendRentNotification(newRent);

    res.status(201).send();
  } catch (err) {
    console.error(`Error retrieving session: ${err.message}`);
    res.status(500).send({ error: 'Failed to retrieve session details.' });
  }
};

const rentItems = async (req, res) => {
  const id = req.params.id;
  try {
    const rent = await Rent.findById(id);
    if (!rent) {
      return res.status(404).send({ error: 'rent not found' });
    }

    for (const item of rent.items) {
      const { name, quantity } = item;
      const n = name.toLowerCase();
      const i = await Item.findOne({ name: n });

      i.amount -= quantity;
      await Rent.findByIdAndDelete(id);
      await i.save();

      return res.status(204).send();
    }
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

exports.getItems = getItems;
exports.getItemById = getItemById;
exports.addItem = addItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
exports.borrowItem = borrowItem;
exports.returnItems = returnItems;
exports.checkoutSession = checkoutSession;
exports.stripeSuccess = stripeSuccess;
exports.rentItems = rentItems;
