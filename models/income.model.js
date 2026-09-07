const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    incomeRef: {
      type: String,
      required: true,
      unique: true
    },

    source: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    amount: {
      type: Number,
      required: true
    },

    dateReceived: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank", "Transfer", "POS", "Cheque"],
      required: true
    },

    // session: {
    //   type: String
    // },

    // term: {
    //   type: String
    // },

    recordedBy: {
      type: String
    }
  },
  { timestamps: true }
);

const incomeModel = mongoose.model("incomes", incomeSchema);

module.exports = incomeModel;