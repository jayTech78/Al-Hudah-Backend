const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: String,

    className: String,

    session: String,

    term: {
      type: String,
      enum: ["First Term", "Second Term", "Third Term"],
    },

    // Every subject for this report card
    subjects: [
      {
        subjectId: String,
        score: Number,
        grade: String,
        position: Number,
        remark: String,
      },
    ],

    subjectsOffered: Number,

    totalScore: Number,

    average: Number,

    percentage: Number,

    overallPosition: Number,

    attendance: {
      present: Number,
      absent: Number,
      schoolOpened: Number,
    },

    principalRemark: String,

    promoted: {
      type: Boolean,
      default: false,
    },

    graduated: {
      type: Boolean,
      default: false,
    },

    promotionProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index({
  studentId: 1,
  session: 1,
  term: 1,
});

module.exports = mongoose.model("Result", resultSchema);