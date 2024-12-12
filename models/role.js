const mongoose = require('mongoose');

const RoleSchema = mongoose.Schema(
  {
    role_name: {
      type: String,
      trim: true,
      unique: [true, 'Role is unique'],
      required: [true, 'Role is required'],
    },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],

    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', RoleSchema);
