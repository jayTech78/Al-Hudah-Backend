const classModel = require("../models/class.model");
const studentModel = require("../models/student.model");
const subjectModel = require("../models/subject.model");

const addClass = async (req, res) => {
  const { className, classTeacher, classBooks, classSubjects, classFees } =
    req.body;
    let finalClass = className.toUpperCase()
  const classId = Math.floor(Math.random() * 10e5);
  const classObj = {
    classId,
    className:finalClass,
    classBooks,
    classSubjects,
    classTeacher,
    classFees,
    isApproved: false,
  };
  let form = new classModel(classObj);
  form
  .save()
  .then(() => {
    res.send({ status: true, message: "Class Added Successfully" });
    // console.log(classObj)
  })
  .catch((error) => {
      res.send({ status: true, message: "There was an error:" + error });
    });
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
    } = req.body;

    if (!classId) {
      return res.send({ status: false, message: "ClassId is required" });
    }

    const updatedClass = await classModel.findOneAndUpdate(
      { classId },
      {
        className,
        classTeacher,
        classBooks,
        classSubjects,
        classFees,
      },
      { new: true } // return the updated document
    );

    if (!updatedClass) {
      return res.send({ status: false, message: "Class not found" });
    }

    res.send({ status: true, message: "Class updated successfully", updatedClass });
  } catch (err) {
    console.error("Update error:", err);
    res.send({ status: false, message: "There was an error: " + err.message });
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
  console.log("students",students)
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