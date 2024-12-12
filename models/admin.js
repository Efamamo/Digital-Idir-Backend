const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  password: { type: String },
  imageUrl: { type: String },
  isSuperAdmin: { type: Boolean },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
});

module.exports = mongoose.model('Admin', adminSchema);
