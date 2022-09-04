const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: String,
  loginSchema: {
    password: String,
  },
  profile: {
    name: String,
    email: String,
  },
  adminMsg:[{
    by: String,
    messages: String,
  }]
});


const admin = mongoose.model("admin", adminSchema);

module.exports = admin;
