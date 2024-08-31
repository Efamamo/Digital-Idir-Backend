const mongoose = require("mongoose");

const refreshSchema = new mongoose.Schema({
  token: { type: String, required: true },
  
});


module.exports = mongoose.model("Refresh", refreshSchema)