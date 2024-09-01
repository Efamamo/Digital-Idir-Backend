const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  password: { type: String },
  imageUrl: { type: String },
  verificationToken: { type: String },
  tokenExpiration: { type: Date },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
