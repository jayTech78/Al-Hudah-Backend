const mongoose = require ("mongoose")
const sessionSchema = new mongoose.Schema(
  {
    sessionName: {
      type: String,
      required: true,
      unique: true, // e.g. "2024/2025"
      trim: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
  },
  { timestamps: true }
);


let sessionModel = mongoose.model("sessions", sessionSchema);
module.exports = sessionModel;