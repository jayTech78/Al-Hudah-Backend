const express = require("express");
const router = express.Router();
const resultController = require("../controllers/result.controller");
const gradeController = require("../controllers/grade.controller")
// ============================================================================
// GET STUDENT RESULT
// ============================================================================

router.post(
    "/student/",
    resultController.getStudentResult
);

// ============================================================================
// GET STUDENT RESULT BY SESSION & TERM
// ============================================================================

// router.post(
//     "/student",
//     resultController.getStudentResult
// );

// ============================================================================
// GET CLASS RESULTS
// ============================================================================

router.get(
    "/class/:className",
    resultController.getClassResults
);

// ============================================================================
// GET CLASS RESULTS BY SESSION & TERM
// ============================================================================

// router.post(
//     "/class",
//     resultController.getClassResults
// );

router.get(
    "/results/:parentId",
    gradeController.getStudentsResultsByParentId
);
module.exports = router;