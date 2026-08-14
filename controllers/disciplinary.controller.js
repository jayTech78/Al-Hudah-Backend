const disciplinaryModel = require("../models/disciplinary.model");
const studentModel = require("../models/student.model");


// ========================================
// ADD DISCIPLINARY RECORD
// ========================================

const add = async (req, res) => {
  try {
    const { studentId, status, offence } = req.body;

    if (!studentId || !status) {
      return res.send({
        status: false,
        message: "Student ID and Status are required.",
      });
    }

    // Offence is compulsory for these statuses
    if (
      ["Suspended", "Rusticated", "Blacklisted"].includes(status) &&
      (!offence || offence.trim() === "")
    ) {
      return res.send({
        status: false,
        message: "Offence is required.",
      });
    }

    // Find Student
    const student = await studentModel.findOne({ studentId });

    if (!student) {
      return res.send({
        status: false,
        message: "Student not found.",
      });
    }

    // Prevent duplicate record
    const existing = await disciplinaryModel.findOne({ studentId });

    if (existing) {
      return res.send({
        status: false,
        message:
          "This student already has a disciplinary record. Edit it instead.",
      });
    }

    const disciplinaryId = Math.floor(
      100000 + Math.random() * 900000
    );

    const disciplinary = new disciplinaryModel({
      disciplinaryId,
      studentId,
      studentName:
        `${student.surName} ${student.otherNames}`,
      status,
      offence:
        ["Suspended", "Rusticated", "Blacklisted"].includes(status)
          ? offence
          : "",
      dateRecorded: Date.now(),
    });

    await disciplinary.save();

    // Update student status
    student.status = status;
    await student.save();

    return res.send({
      status: true,
      message: "Student disciplinary record added successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.send({
      status: false,
      message: error.message,
    });
  }
};



// ========================================
// UPDATE DISCIPLINARY RECORD
// ========================================

const update = async (req, res) => {
  try {
    const { studentId, status, offence } = req.body;

    if (!studentId) {
      return res.send({
        status: false,
        message: "Student ID is required.",
      });
    }

    if (!status) {
      return res.send({
        status: false,
        message: "Status is required.",
      });
    }

    if (
      ["Suspended", "Rusticated", "Blacklisted"].includes(status) &&
      (!offence || offence.trim() === "")
    ) {
      return res.send({
        status: false,
        message: "Offence is required.",
      });
    }

    const student = await studentModel.findOne({ studentId });

    if (!student) {
      return res.send({
        status: false,
        message: "Student not found.",
      });
    }

    const disciplinary =
      await disciplinaryModel.findOneAndUpdate(
        { studentId },
        {
          status,
          offence:
            ["Suspended", "Rusticated", "Blacklisted"].includes(status)
              ? offence
              : "",
        },
        {
          new: true,
        }
      );

    if (!disciplinary) {
      return res.send({
        status: false,
        message: "Disciplinary record not found.",
      });
    }

    student.status = status;
    await student.save();

    return res.send({
      status: true,
      message: "Student updated successfully.",
      disciplinary,
    });
  } catch (error) {
    console.log(error);

    return res.send({
      status: false,
      message: error.message,
    });
  }
};



// ========================================
// DELETE RECORD
// ========================================

const remove = async (req, res) => {
  try {
    const { studentId } = req.body;

    const disciplinary =
      await disciplinaryModel.findOneAndDelete({
        studentId,
      });

    if (!disciplinary) {
      return res.send({
        status: false,
        message: "Record not found.",
      });
    }

    // Reset student's status
    const student = await studentModel.findOne({
      studentId,
    });

    if (student) {
      student.status = "Admitted";
      await student.save();
    }

    return res.send({
      status: true,
      message: "Record deleted successfully.",
    });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};



// ========================================
// GET ALL RECORDS
// ========================================

const get = async (req, res) => {
  try {
    const disciplinaries =
      await disciplinaryModel.find().sort({
        dateRecorded: -1,
      });

    return res.send({
      status: true,
      students: disciplinaries,
    });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};



// ========================================
// SEARCH STUDENT BY STUDENT ID
// ========================================

const searchStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.send({
        status: false,
        message: "Student ID is required.",
      });
    }

    const student = await studentModel.findOne({
      studentId,
    });

    if (!student) {
      return res.send({
        status: false,
        message: "Student not found.",
      });
    }

    return res.send({
      status: true,
      student: {
        studentId: student.studentId,
        studentName: `${student.surName} ${student.otherNames}`,
        status: student.status,
      },
    });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};



module.exports = {
  add,
  update,
  remove,
  get,
  searchStudent,
};