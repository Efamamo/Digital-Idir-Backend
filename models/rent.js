const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
  email: String,
  items: Array,
  name: String,
  totalAmount: Number,
});

module.exports = mongoose.model('Rent', rentSchema);
