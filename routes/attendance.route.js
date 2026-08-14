const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendanceByDateAndClassName,
  getAttendanceByStudentIdAndTerm,
  getAttendanceForToday
} = require("../controllers/attendance.controller");

router.post("/markAttendance", markAttendance);
router.get("/getAttendanceByDateAndClassName/:className/:date", getAttendanceByDateAndClassName);
router.get("/getAttendanceForToday/:className/:date", getAttendanceForToday)
router.get('/getAttendanceByStudentIdAndTerm/:studentId/:term',getAttendanceByStudentIdAndTerm)
module.exports = router;