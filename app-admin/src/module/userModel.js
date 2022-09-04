const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  category: String,
  loginSchema: {
    password: String,
  },
  profile: {
    name: String,
    email: String,
  },
  platformHandles:{
    codechef: String,
    hackerrank: String,
  },
  adminMsg:[{
    by: String,
    messages: String,
  }]
});


const users = mongoose.model("users", userSchema);

module.exports = users;
