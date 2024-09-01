const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  description: String,
});

module.exports = mongoose.model('Announcement', announcementSchema);
