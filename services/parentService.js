/******************************************************************************
 *
 * FILE NAME
 * ---------
 * parentService.js
 *
 * PURPOSE
 * -------
 * Handles all parent-related operations.
 *
 ******************************************************************************/

// ============================================================================
// IMPORTS
// ============================================================================

const studentModel = require("../models/student.model");
const resultModel = require("../models/result.model");
const attendanceModel = require("../models/attendance.model");

const {
    getAcademicPeriod
} = require("../utils/academicUtils");
const gradeModel = require("../models/grade.model");

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Returns every student's result and attendance belonging to a parent.
 ******************************************************************************/

const getStudentsResults = async (parentId) => {

    // Get current academic session and term

    const {
        session,
        term
    } = await getAcademicPeriod();

    // Find all children

    const students = await studentModel.find({
        parentId,
        status: 'Admitted'
    });

    if (!students.length) {
        return [];
    }

    const studentsResult = [];

    // Process each student

    for (const student of students) {

        // Get report card
        // console.log("all results",await gradeModel.find())
        const result = await resultModel.findOne({
            studentId: student.studentId,
            session: session.sessionName,
            term: term.termName
        });

        // Attendance

        const present = await attendanceModel.countDocuments({
            studentId: student.studentId,
            session: session.sessionName,
            term: term.termName,
            status: "Present"
        });

        const absent = await attendanceModel.countDocuments({
            studentId: student.studentId,
            session: session.sessionName,
            term: term.termName,
            status: "Absent"
        });

        const grades = await gradeModel.find({
            studentId: student.studentId,
            session: session.sessionName,
        });

        studentsResult.push({
            student,
            result,
            grades,
            attendanceSummary: {
                present,
                absent
            }
        });
    }
    return studentsResult;
};

module.exports = {
    getStudentsResults
};