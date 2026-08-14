const express = require("express");
const router = express.Router();
const {  recordGrades,
  updateGrades,
  getStudentGrade,
  getGradesBySubject,
  getClassGrades,
  getStudentsResultsByParentId} = require("../controllers/grade.controller");

// ============================================================================
// RECORD / UPDATE GRADES
// ============================================================================

router.post("/record", recordGrades);

router.put("/update", updateGrades);

// ============================================================================
// GET STUDENT GRADES
// ============================================================================

router.get("/student/:studentId",getStudentGrade);

// ============================================================================
// GET CLASS GRADES
// ============================================================================

router.get("/class/:className",getClassGrades);

// ============================================================================
// GET SUBJECT GRADES
// ============================================================================

router.post("/subject",getGradesBySubject);

router.get('/getStudentsResultsByParentId/:parentId',getStudentsResultsByParentId)

module.exports = router;