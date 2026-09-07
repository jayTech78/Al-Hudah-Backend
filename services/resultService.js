/******************************************************************************
 *
 * FILE NAME
 * ---------
 * resultService.js
 *
 * MODULE
 * ------
 * Academic Management Module
 *
 * PURPOSE
 * -------
 * Generates students' report cards and calculates class positions.
 *
 ******************************************************************************/

// ============================================================================
// IMPORTS
// ============================================================================

const resultModel = require("../models/result.model");
const gradeModel = require("../models/grade.model");
const { getAcademicPeriod } = require("../utils/academicUtils");
const studentModel = require("../models/student.model");

// ============================================================================
// PRIVATE FUNCTION
// Returns the correct grade field for the current term.
// ============================================================================

const getTermField = (term) => {
  switch (term.toLowerCase()) {
    case "first term":
      return "firstTerm";

    case "second term":
      return "secondTerm";

    case "third term":
      return "thirdTerm";

    default:
      throw new Error("Invalid academic term.");
  }
};

// ============================================================================
// PRIVATE FUNCTION
// Calculates the overall class position after a student's result is generated.
// ============================================================================

const calculateOverallPosition = async (className, session, term) => {
  const results = await resultModel.find({
    className,
    session,
    term,
  });

  // Highest average comes first
  results.sort((a, b) => b.average - a.average);

  let currentPosition = 1;

  for (let i = 0; i < results.length; i++) {
    // Handle ties
    if (i > 0 && results[i].average !== results[i - 1].average) {
      currentPosition = i + 1;
    }

    results[i].overallPosition = currentPosition;

    await results[i].save();
  }
};

// ============================================================================
// PUBLIC FUNCTION
// Generates a student's report card for a particular term.
// ============================================================================

const generateStudentResult = async (studentId, className, session, term) => {
  // console.log("generateStudentResult got here", studentId, className, session, term);
  // console.log("Generate result")
  const termField = getTermField(term);

  // Retrieve all grades belonging to this student

  const grades = await gradeModel.find({
    studentId,
    className,
    session,
  });
  // console.log(grades)
  let totalScore = 0;

  const subjects = [];

  for (const grade of grades) {
    if (!grade[termField]) continue;

    totalScore += grade[termField].totalScore;
    // console.log('totalScore',totalScore);
    // console.log('grade term score',grade)

    subjects.push({
      subjectId: grade[termField].subjectId,
      score: grade[termField].weightedAverageScore,
      grade: grade[termField].grade,
      position: grade[termField].position,
      remark: grade[termField].teacherRemarks,
    });
  }

  const subjectsOffered = subjects.length;

  const average = subjectsOffered === 0 ? 0 : totalScore / subjectsOffered;
  // console.log('average',average)
  // Since every subject is marked over 100,
  // percentage is the same as the average.

  const percentage = average;
  // console.log('percentage',percentage)

  const filter = {
    studentId,
    className,
    session,
    term,
  };

  const update = {
    $set: {
      studentId,
      className,
      session,
      term,
      subjects,
      subjectsOffered,
      totalScore,
      average,
      percentage,
    },
  };

  await resultModel.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
  });

  // Recalculate class positions

  await calculateOverallPosition(className, session, term);
};

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Returns a student's result.
 ******************************************************************************/

const getStudentResult = async (studentId, session = null, term = null) => {
  try {
    // Get current academic period if not provided
    if (!session || !term) {
      const academicPeriod = getAcademicPeriod();

      session = session || academicPeriod.session.session;
      term = term || academicPeriod.term;
    }

    let termField = "";

    switch (term.toLowerCase().trim()) {
      case "first term":
        termField = "firstTerm";
        break;

      case "second term":
        termField = "secondTerm";
        break;

      case "third term":
        termField = "thirdTerm";
        break;

      default:
        throw new Error("Invalid term");
    }

    // console.log("Student ID:", studentId);
    // console.log("Session:", session);
    // console.log("Term:", term);
    // console.log("Term Field:", termField);

    // Get individual subject grades
    const grades = await gradeModel.find({
      studentId,
      session,
      [termField]: { $exists: true },
    });

    // Get overall result
    const result = await resultModel.findOne({
      studentId,
      session,
      term,
    });

    // Get student information
    const student = await studentModel.findOne({
      studentId,
    });

    // console.log("RESULT:", result);
    // console.log("GRADES:", grades);
    // console.log("STUDENT:", student);

    return {
      result,
      student,
      grades,
      termField,
    };
  } catch (error) {
    console.error("Error getting student result:", error);
    throw error;
  }
};

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Returns every student's result in a class.
 ******************************************************************************/

const getClassResults = async (className, session = null, term = null) => {
  if (!session || !term) {
    const academicPeriod = await getAcademicPeriod();
    session = session || academicPeriod.session.sessionName;
    term = term || academicPeriod.term.termName;
  }

  return await resultModel.find({
    className,
    session,
    term,
  });
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateStudentResult,
  getStudentResult,
  getClassResults,
};
