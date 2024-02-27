const mongoose = require("mongoose");

const typeSchema = mongoose.Schema({
  name: {
    type: String,
  },
  //判断是支出还是收入
  type: {
    type: String,
    default: "1",
  },
  username: {
    type: String,
  },
});

const typeModel = mongoose.model("types", typeSchema);
module.exports = typeModel;
