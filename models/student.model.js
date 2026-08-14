const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  parentId: {
    type: String,
    required: true,
  },

  studentId: {
    type: String,
    required: true,
    unique: true,
  },

  surName: {
    type: String,
    required: true,
  },

  otherNames: {
    type: String,
    required: true,
  },

  gender: {
    type: String,
    required: true,
  },

  dateOfBirth: {
    type: String,
    required: true,
  },

  nationality: {
    type: String,
    required: true,
  },

  religion: {
    type: String,
    required: true,
  },

  tribe: {
    type: String,
    required: true,
  },

  // Admission Information
  classTo: {
    type: String,
    required: true,
  },

  classAdmittedTo: {
    type: String,
  },

  previousSchool: {
    type: String,
    required: true,
  },

  previousClass: {
    type: String,
    required: true,
  },

  schoolingType: {
    type: String,
    required: true,
  },

  entranceExamScore: Number,

  dateRegistered: Date,

  dateAdmitted: Date,

  dateUpdated: Date,

  admissionSession: String,

  admissionTerm: {
    type: String,
    enum: ["First Term", "Second Term", "Third Term"],
  },

  status: {
    type: String,
    enum: [
      "Applicant",
      "Admitted",
      "Graduated",
      "Transferred",
      "Withdrawn",
      "Suspended"
    ],
    default: "Applicant",
  },

  feesToPay: [String],

  promotionHistory: [
    {
      session: String,

      fromClass: String,

      toClass: String,

      promotedDate: Date,
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);