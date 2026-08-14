const mongoose = require("mongoose");

const termSchema = new mongoose.Schema(
  {
    firstCa: {
      type: Number,
      default: 0,
    },

    secondCa: {
      type: Number,
      default: 0,
    },

    exam: {
      type: Number,
      default: 0,
    },

    continuousAssessment: {
      type: Number,
      default: 0,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    grade: {
      type: String,
      enum: ["A", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"],
    },

    teacherRemark: {
      type: String,
      enum: [
        "Excellent",
        "Very Good",
        "Good",
        "Fair",
        "Average",
        "Fail",
      ],
    },

    position: Number,

    recordedBy: String,

    recordedAt: Date,
  },
  { _id: false }
);

const gradeSchema = new mongoose.Schema(
  {
    studentId: String,

    className: String,

    session: String,

    subjectId: String,

    firstTerm: termSchema,

    secondTerm: termSchema,

    thirdTerm: termSchema,
  },
  {
    timestamps: true,
  }
);

gradeSchema.index(
  {
    studentId: 1,
    subjectId: 1,
    session: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Grade", gradeSchema);