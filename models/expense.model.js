const mongoose = require('mongoose')
const expenseSchema = mongoose.Schema({
  expenseRef: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  paymentMethod: {
    type: String,
    enum: ["Cash", "Bank", "Transfer"],
    required: true
  },

});

const expenseModel = mongoose.model("expenses", expenseSchema);

module.exports = expenseModel;