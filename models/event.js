const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  date: Date,
  description: String,
  location: String,
  reminderSent: {
    // Indicates if the reminder has been sent
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Event', eventSchema);
