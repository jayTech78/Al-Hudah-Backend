const mongoose = require ("mongoose")
const termSchema = new mongoose.Schema({
  termName: {
    type: String,
    required: true,
    enum: ["First Term", "Second Term", "Third Term"],
  },
  session: {
    type: String,
    ref: "Session",
    required: true, // Link term to a session
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Closed", "InActive"],
    default: "Active",
  },
}, { timestamps: true });

const termModel = mongoose.model("Term", termSchema);
module.exports = termModel;