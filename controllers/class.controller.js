const classModel = require("../models/class.model");
const studentModel = require("../models/student.model");
const subjectModel = require("../models/subject.model");
const staffModel = require('../models/staff.model')

const addClass = async (req, res) => {
  try {
    const {
      className,
      classTeacher,
      classBooks,
      classSubjects,
      classFees,
      teacherId,
    } = req.body;

    // Validate required fields
    if (!className || !classTeacher || !teacherId) {
      return res.send({
        status: false,
        message: "Class name, class teacher and teacher ID are required",
      });
    }

    // Convert class name to uppercase
    const finalClass = className.trim().toUpperCase();

    // Check if class already exists
    const existingClass = await classModel.findOne({
      className: finalClass,
    });

    if (existingClass) {
      return res.send({
        status: false,
        message: "This class already exists",
      });
    }

    // Check that the teacher exists
    const teacher = await staffModel.findOne({
      staffId: teacherId,
    });

    if (!teacher) {
      return res.send({
        status: false,
        message: "Teacher not found",
      });
    }

    // Optional: make sure teacher is actually a teacher
    if (teacher.role !== "Teacher") {
      return res.send({
        status: false,
        message: "Selected staff member is not a teacher",
      });
    }

    // Generate class ID
    const classId = Math.floor(Math.random() * 1000000);

    // Create class
    const classObj = {
      classId,
      className: finalClass,
      classBooks,
      classSubjects,
      classTeacher,
      classFees,
      isApproved: false,
    };

    const newClass = await classModel.create(classObj);

    // Update teacher's classTaken
    teacher.classTaken = String(className);

    await teacher.save();

    return res.send({
      status: true,
      message: "Class Added Successfully",
      class: newClass,
    });

  } catch (error) {
    console.error("addClass error:", error);

    return res.send({
      status: false,
      message: "There was an error: " + error.message,
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const {
      classId,
      className,
      classTeacher,
      classBooks,
      classSubjects,
      classFees,
      teacherId,
    } = req.body;

    if (!classId) {
      return res.send({
        status: false,
        message: "ClassId is required",
      });
    }

    if (!teacherId) {
      return res.send({
        status: false,
        message: "Teacher ID is required",
      });
    }

    // Find the existing class
    const existingClass = await classModel.findOne({
      classId,
    });

    if (!existingClass) {
      return res.send({
        status: false,
        message: "Class not found",
      });
    }

    // Find the new teacher
    const newTeacher = await staffModel.findOne({
      staffId: teacherId,
    });

    if (!newTeacher) {
      return res.send({
        status: false,
        message: "Teacher not found",
      });
    }

    // Find the old teacher using the old class teacher name
    const oldTeacher = await staffModel.findOne({
      classTaken: String(className),
    });

    // Remove class from old teacher
    if (
      oldTeacher &&
      oldTeacher.staffId !== newTeacher.staffId
    ) {
      oldTeacher.classTaken = undefined;
      await oldTeacher.save();
    }

    // Assign class to new teacher
    newTeacher.classTaken = String(classId);
    await newTeacher.save();

    // Update class
    const updatedClass = await classModel.findOneAndUpdate(
      { classId },
      {
        className: className.trim().toUpperCase(),
        classTeacher,
        classBooks,
        classSubjects,
        classFees,
      },
      { new: true }
    );

    return res.send({
      status: true,
      message: "Class updated successfully",
      updatedClass,
    });

  } catch (error) {
    console.error("Update error:", error);

    return res.send({
      status: false,
      message: "There was an error: " + error.message,
    });
  }
};

const findClassById = async (req, res) => {
  const { bookId } = req.body;
  const findBook = await feesModel.findOne({ bookId });
  return findBook;
};

const getStudentsByClassName = async (req, res) => {
  try {
    const { className } = req.params;
    // console.log(req.params)
    const foundClass = await classModel.findOne({ className });
    // console.log(foundClass)
    if (!foundClass) {
      return res.send({ status: false, message: "Class Not Found!!!" });
    }

    const studentIds = foundClass.students;
    const classteacher = foundClass.classTeacher;
    const students = await studentModel.find({
      studentId: { $in: studentIds },
    });

    res.send({
      status: true,
      className: foundClass.className,
      students,
      classteacher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
};

const getStudentsAndSubjectsByClassName = async (req, res) => {
  try {
    const { className } = req.params;
    const foundClass = await classModel.findOne({ className });
    if (!foundClass) {
      return res.send({ status: false, message: "Class Not Found!!!" });
    }

    const studentIds = foundClass.students;
    const foundSubjects = foundClass.classSubjects;
    const classteacher = foundClass.classTeacher;
    const students = await studentModel.find({
      studentId: { $in: studentIds },
    });
    const subjects = await subjectModel.find({
      subject: { $in: foundSubjects },
    });
    res.send({
      status: true,
      className: foundClass.className,
      students,
      classteacher,
      subjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params; // coming from URL
    const deleted = await classModel.findOneAndDelete({ classId });

    if (deleted) {
      res.send({ status: true, message: "Deleted Successfully" });
    } else {
      res.send({ status: false, message: "Class not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: "Server Error" });
  }
};

const getClasses = async (req, res) => {
  try {
    // Fetch all classes
    const classes = await classModel.find();

    if (classes.length > 0) {
      const populatedClasses = await Promise.all(
        classes.map(async (classItem) => {
          // Fetch full student info for each studentId in the class
          const students = await studentModel.find({
            studentId: { $in: classItem.students }
          });

          return {
            _id: classItem._id,
            classId:classItem.classId,
            className: classItem.className,
            classTeacher: classItem.classTeacher,
            classBooks: classItem.classBooks,
            classSubjects: classItem.classSubjects,
            students: students, // now contains ALL student info
            isApproved: classItem.isApproved,
            classFees: classItem.classFees
          };
        })
      );

      res.send({ status: true, classes: populatedClasses });
    } else {
      res.send({ status: false, message: "No classes found" });
    }
  } catch (error) {
    console.error("Error fetching classes and students:", error);
    res.status(500).send({ status: false, message: "Server error" });
  }
};

const assignTeacherToClass = async (req, res) => {
  const { teacherInfo, selectedClass } = req.body;
  const fullName = teacherInfo.surName + teacherInfo.otherNames;
  try {
    const updatedClass = await classModel.findByIdAndUpdate(
      selectedClass,
      { classTeacher: fullName },
      { new: true } // Returns the updated document
    );

    if (updatedClass) {
      res.send({ status: true, message: "Teacher Assigned Successfully" });
    } else {
      res.send({ status: false, message: "Class not found" });
    }
  } catch (err) {
    res.send({ status: false, message: "There was an error: " + err.message });
  }
};

const addStudentToClass = async (req, res) => {
  const { className, studentId } = req.body;
  try {
    const classDoc = await classModel.findOne({ className });

    if (!classDoc) {
      return res.send({ status: false, message: "Class not found" });
    }

    if (!classDoc.students.includes(studentId)) {
      classDoc.students.push(studentId);
      await classDoc.save();
      res.send({
        status: true,
        message: "Student added to class successfully",
      });
    } else {
      res.send({ status: false, message: "Student is already in this class" });
    }
  } catch (err) {
    res.send({ status: false, message: "There was an error: " + err.message });
  }
};
const removeStudentFromClass = async (req, res) => {
  const { className, studentId } = req.body;

  try {
    const classDoc = await classModel.findOne({ className });

    if (!classDoc) {
      return res.send({ status: false, message: "Class not found" });
    }

    if (classDoc.students.includes(studentId)) {
      // Remove the student properly
      classDoc.students.pull(studentId); // <-- mongoose method
      await classDoc.save();

      res.send({
        status: true,
        message: "Student removed from class successfully",
      });
    } else {
      res.send({ status: false, message: "Student not found in this class" });
    }
  } catch (err) {
    res.send({ status: false, message: "There was an error: " + err.message });
  }
};

const getAllClasses = async (req, res) => {
  const classes = await classModel.find();
  if (classes) {
    // console.log(classes)
    res.send({ status: true, classes });
  } else {
    res.send({ status: false, message: "Empty Field" });
  }
};

const classInfo = async (req, res)=>
{
  const {className} = req.params
  // console.log(className)
  let foundClass =  await classModel.findOne({className})
  // console.log(foundClass)
  if(!foundClass)
  {
    res.send({status:false, message:'Class Not Found!!!'})
  }

  const studentsIds = foundClass.students || [];
  const students = await studentModel.find({
    studentId: {$in: studentsIds},
  })
  // console.log("students",students)
  res.send({
    status:true,
    students,
    foundClass
  })
}

module.exports = {
  addStudentToClass,
  getStudentsAndSubjectsByClassName,
  getAllClasses,
  getClasses,
  addClass,
  findClassById,
  getStudentsByClassName,
  updateClass,
  deleteClass,
  assignTeacherToClass,
  classInfo,
  removeStudentFromClass
};