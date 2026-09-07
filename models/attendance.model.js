const mongoose = require ("mongoose")
let attendanceSchema = mongoose.Schema
({
    studentId: { type: String, required: true },
    date: { type: String, required: true },
    morningStatus: { type: String, enum: ["Present", "Absent"]},
    afternoonStatus: { type: String, enum: ["Present", "Absent"]},
    term: { type:String },
    session:{ type: String },
    className:{type:String}
  }
  )
let attendanceModel = mongoose.model("attendance", attendanceSchema);
module.exports = attendanceModel;