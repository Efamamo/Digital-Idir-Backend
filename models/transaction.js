const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  name: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to another document (e.g., a user)
    ref: 'User', // Optionally, specify the collection name the ID refers to (e.g., 'User')
  },
  amount: Number,
  date: {
    type: Date,
    default: Date.now, // Optionally set default date to now
  },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('Transaction', transactionSchema);
