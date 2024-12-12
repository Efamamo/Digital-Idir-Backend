const mongoose = require('mongoose');
const PermissionSchema = mongoose.Schema(
  {
    code_name: { type: String, unique: true },
    description: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permission', PermissionSchema);
