const mongoose = require('mongoose');

const memorialSchema = new mongoose.Schema({
  name: String,
  dateOfBirth: Date,
  dateOfPassing: Date,
  description: String,
  imageUrl: String,
});

module.exports = mongoose.model('Memorial', memorialSchema);
