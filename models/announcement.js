const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  description: String,
  title: String,
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Announcement', announcementSchema);
