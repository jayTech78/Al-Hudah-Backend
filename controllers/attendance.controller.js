const attendanceModel = require("../models/attendance.model");
const studentModel = require("../models/student.model")
const sessionModel = require('../models/session.model')
const termModel = require('../models/term.model')

const markAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;
    const activeSession = await sessionModel.findOne({ status: "Active" });
    const activeTerm = await termModel.findOne({ status: "Active" });

    if (!activeSession || !activeTerm) {
      return res.status(400).json({ error: "No active session or term found" });
    }

    const term = activeTerm.termName;
    const session = activeSession.sessionName;

    const bulkOps = attendanceData.map((data) => {
      const { studentId, morningStatus,afternoonStatus, className, date } = data;
      const normalizedClassName = className.trim().toLowerCase();
      const normalizedDate = new Date(date).toISOString().split("T")[0]; // yyyy-mm-dd only

      return {
        updateOne: {
          filter: {
            studentId,
            date: normalizedDate,
            className: normalizedClassName,
            session,
            term,
          },
          update: {
            $set: { morningStatus, afternoonStatus  },
          },
          upsert: true,
        },
      };
    });

    await attendanceModel.bulkWrite(bulkOps);

    return res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
 
const getAttendanceByDateAndClassName = async (req, res) => {
  try {
    const { date, className } = req.params;
    //  console.log(date);
    //  console.log(className);
    const normalizedClassName = className.trim().toLowerCase();

    const attendance = await attendanceModel.find({
      className: normalizedClassName,
      date,
    })
    
    //  console.log(attendance)
    const gottenStudents= []

    for( attend of attendance )
    {
      if(attend.status === "Present")
      {
        // console.log('Present')
        const studentId = attend.studentId
        // console.log(studentId)
        const student = await studentModel.findOne({studentId: studentId})
        // console.log(student)
        if(student)
        {
          gottenStudents.push({
            studentName:`${student.surName} ${student.otherNames}`,
            status:attend.status,
            studentId: student.studentId
          })
        }
      }
    }
    return res.send({ status: true, gottenStudents });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).send({
      status: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

const getAttendanceForToday = async (req, res) => {
  try {
    const { date, className } = req.params;
    const normalizedClassName = className.trim().toLowerCase();

    // 1️⃣ Get attendance records for the given class & date
    const attendances = await attendanceModel.find({
      className: normalizedClassName,
      date,
    });

    // 2️⃣ For each attendance, fetch the matching student info
    const results = await Promise.all(
      attendances.map(async (attend) => {
        const student = await studentModel.findOne({ studentId: attend.studentId });

        return {
          studentId: attend.studentId,
          status: attend.status,
          surName: student?.surName || "",
          otherNames: student?.otherNames || "",
          className: attend.className,
          date: attend.date
        };
      })
    );

    return res.send({ status: true, attendances: results });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).send({
      status: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

const getAttendanceByStudentIdAndTerm = async (req, res) => {
  try {

    const { studentId, term } = req.params;
    // console.log(req.params);

    const activeTerm = await termModel.findOne({
      status: 'Active'
    })

    const attendance = await attendanceModel.find({
      studentId,
      term,
      session: activeTerm.session
    });
    // console.log('attendance',attendance);

    const student = await studentModel.findOne({ studentId });

    if (!student) {
      return res.send({ status: false, message: "Student not found" });
    }
    // console.log(student)
    const presentDates = [];
    const absentDates = [];

    attendance.forEach((attend) => {
      const formattedDate = new Date(attend.date).toISOString().split("T")[0]; // "YYYY-MM-DD"
      if (attend.status === "Present") {
        presentDates.push(formattedDate);
      } else {
        absentDates.push(formattedDate);
      }
    });

    const totalPresent = presentDates.length;
    const totalAbsent = absentDates.length;
    const totalSchoolDays = totalPresent + totalAbsent;

    return res.send({
      status: true,
      data: {
        studentName: `${student.surName} ${student.otherNames}`,
        presentDates,
        absentDates,
        totalPresent,
        totalAbsent,
        totalSchoolDays,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).send({
      status: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};
module.exports = { markAttendance, getAttendanceByDateAndClassName,getAttendanceByStudentIdAndTerm, getAttendanceForToday };