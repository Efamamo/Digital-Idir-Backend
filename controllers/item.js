const Item = require('../models/items');
const User = require('../models/user');
const Rent = require('../models/rent');
const sendRentNotification = require('../cron/rent-notification');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require('express-validator');
const sendPaymentNotification = require('../cron/send-rent');
require('dotenv').config();

const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
};

const getItemById = async (req, res) => {
  try {
    const id = req.params.id;
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
    const { items } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(403).send({ error: 'User not found' });
    }

    const errors = [];

    for (const item of items) {
      const { id, amount } = item;
      const i = await Item.findById(id);
      if (!i) {
        errors.push({ id: `item with id ${id} not found` });
      } else if (i.amount < amount) {
        errors.push({ name: `${i.name} amount is unavailable` });
      }
    }

    if (errors.length !== 0) {
      return res.status(400).send({ errors });
    }

    for (const item of items) {
      const { id, amount } = item;
      const i = await Item.findById(id);

      i.amount -= amount;

      let isAlreadyIn = false;

      for (let j = 0; j < user.borrowedItems.length; j++) {
        if (user.borrowedItems[j].id === id) {
          console.log('changing amount');
          user.borrowedItems[j].amount += amount;
          isAlreadyIn = true;
          user.markModified(`borrowedItems.${j}.amount`);
          break;
        }
      }

      if (!isAlreadyIn) {
        user.borrowedItems.push({ id, amount, date: new Date() });
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
    const { items } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(403).send({ error: 'User not found' });
    }

    const errors = [];

    for (const item of items) {
      const { id, amount } = item;
      const i = await Item.findById(id);
      if (!i) {
        errors.push(`name: item with id ${id} not found`);
      }
      let exists = false;
      for (const uitems of user.borrowedItems) {
        if (id == uitems.id) {
          exists = true;
          if (uitems.amount < amount) {
            errors.push(
              `amount :  you only borrowed ${uitems.amount} ${i.name}s`
            );
          }
        }
      }

      if (!exists) {
        errors.push(`name: you did not borrow ${i.name}`);
      }
    }

    if (errors.length !== 0) {
      return res.status(400).send({ errors });
    }

    for (const item of items) {
      const { id, amount } = item;
      const i = await Item.findById(id);

      i.amount += amount;

      let fullyReturned = false;

      for (let j = 0; j < user.borrowedItems.length; j++) {
        if (user.borrowedItems[j].id === id) {
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
          (borrowedItem) => borrowedItem.id !== id
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
  console.log(errors);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).json({ errors: formattedErrors });
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

    let total = 0;

    for (const item of req.body.items) {
      const i = await Item.findById(item.id);
      total += item.amount * i.price;
    }

    const newRent = new Rent({
      email: req.body.email,
      items: req.body.items,
      totalAmount: total,
    });

    const tx = `chewatatest-${newRent._id}`;
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${process.env.CHAPA_SECRET_KEY}`);
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      amount: total,
      currency: 'ETB',
      email: req.body.email,
      phone_number: req.body.phoneNumber,
      tx_ref: tx,
      callback_url: 'https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60',

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
      await newRent.save();
      await sendPaymentNotification(req.body.email);

      res.json(result.data.checkout_url);
    } else {
      return res.json(500).json('server error');
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e });
  }
};

const rentItems = async (req, res) => {
  const Rid = req.params.id;
  try {
    const rent = await Rent.findById(Rid);
    if (!rent) {
      return res.status(404).send({ error: 'rent not found' });
    }

    for (const item of rent.items) {
      const { id, amount } = item;
      const i = await Item.findById(id);

      i.amount -= amount;
      await i.save();
    }

    await Rent.findByIdAndDelete(Rid);
    return res.status(204).send();
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e.message });
  }
};

const getRent = async (req, res) => {
  const id = req.params.id;
  try {
    const rent = await Rent.findById(id);
    if (!rent) {
      return res.status(404).send({ error: 'rent not found' });
    }

    return res.json(rent);
  } catch (e) {
    res.status(500).send({ error: e });
  }
};

const returnRentItems = async (req, res) => {
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
      const { name } = item;
      const n = name.toLowerCase();
      const i = await Item.findOne({ name: n });
      if (!i) {
        errors.push(`name: ${name} not found`);
      }
    }

    if (errors.length !== 0) {
      return res.status(400).send({ errors });
    }

    for (const item of req.body.items) {
      const { name, amount } = item;
      const n = name.toLowerCase();
      const i = await Item.findOne({ name: n });

      i.amount += amount;
      await i.save();
    }
    res.json({ items: req.body.items });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
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
exports.rentItems = rentItems;
exports.returnRentItems = returnRentItems;
exports.getRent = getRent;
