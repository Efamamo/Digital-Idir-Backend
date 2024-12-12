const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
});

// Ensure endTime is after startTime
eventSchema.pre('save', function (next) {
  if (this.endTime <= this.startTime) {
    return next(new Error('endTime must be after startTime'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
