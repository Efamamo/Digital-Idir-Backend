const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  amount: Number,
  imageURL: String,
});

module.exports = mongoose.model('Item', itemSchema);
