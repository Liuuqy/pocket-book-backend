const mongoose = require("mongoose");

const billSchema = mongoose.Schema({
  pay_type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type_id: {
    type: String,
    required: true,
  },
  type_name: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
  },
  remark: {
    type: String,
    default: "",
  },
});

const billModel = mongoose.model("bills", billSchema);
module.exports = billModel;
