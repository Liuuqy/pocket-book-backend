const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    default: "这个人很懒，没有个性签名",
  },
  avatar: {
    type: String,
    default: "/images/default.png",
  },
  ctime: {
    type: Date,
    required: true,
  },
});

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
