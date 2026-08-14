const studentModel = require("../models/student.model");
const feesModel = require("../models/fees.model")
const classModel = require("../models/class.model")
const paymentModel = require("../models/payment.model")
const bookModel = require('../models/book.model')
const parentModel = require("../models/parent.model")
const disciplinaryModel = require("../models/disciplinary.model")
const termModel = require("../models/term.model")

const generateId = async () => {
  const prefix = "STU";
  const year = new Date().getFullYear();

  const students = await studentModel.find({
    studentId: { $regex: `^${prefix}/${year}/` },
  });

  let highest = 0;

  students.forEach((student) => {
    const number = Number(student.studentId.split("/")[2]);

    if (number > highest) {
      highest = number;
    }
  });

  const nextNumber = highest + 1;

  return `${prefix}/${year}/${String(nextNumber).padStart(4, "0")}`;
};

const addStudent = async (req, res) => {
  try {
    let initStatus = 'Not Admitted'
    const {
      parentId,
      surName,
      otherNames,
      gender,
      dateOfBirth,
      nationality,
      religion,
      tribe,
      classTo,
      previousClass,
      previousSchool,
      schoolingType,
      status
    } = req.body;

    // ✅ Check if student with same parentId + surName + otherNames already exists
    const existingStudent = await studentModel.findOne({
      parentId,
      surName,
      otherNames,
    });

    if (existingStudent) {
      return res.send({
        status: false,
        message: "This student is already registered under this parent",
      });
    }

    const studentId = generateId()
    const studentObj = {
      parentId,
      studentId,
      surName,
      otherNames,
      gender,
      dateOfBirth,
      nationality,
      religion,
      tribe,
      classTo,
      previousClass,
      previousSchool,
      schoolingType,
      dateRegistered: new Date(),
      status: "Applicant",
    };

    const form = new studentModel(studentObj);
    await form.save();

    res.send({
      status: true,
      message: "Student has been registered successfully",
      student: form.toObject(),
    });
  } catch (err) {
    console.error(err);
    res.send({ status: false, message: "There was an error: " + err.message });
  }
};
const updateStudent = async (req, res) => {
  try {
    const { studentId, surName, status, offence } = req.body;

    if ((status === 'suspended' || status === 'blacklisted' || status === 'rusticated') && (!offence || offence.trim() === "")) {
      res.send({ status: false, message: "Offence required" });
    }
    // Find the student by ID and update the fields
    await studentModel.findOneAndUpdate(
      { studentId },  // Filter to find the student by ID
      // console.log(surName)
      {
        surName: surName,
        otherNames: req.body.otherNames,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        nationality: req.body.nationality,
        religion: req.body.religion,
        tribe: req.body.tribe,
        classTo: req.body.classTo,
        previousClass: req.body.previousClass,
        previousSchool: req.body.previousSchool,
        schoolingType: req.body.schoolingType,
        dateUpdated: new Date(),
      },
      // { new: true } // Return the updated document
    );
    //Disciplinary obj
    const disciplinaryObj = {
      studentId,
      studentName,
      status,
      offence,
      dateRecorded
    };
    // saves the disciplinary 
    const form = new disciplinaryModel(disciplinaryObj);
    await form.save();
    // Send success response
    res.send({ status: true, message: 'Updated Successfully' });
    // console.log('updated')
  } catch (err) {
    // Send error response
    res.send({ status: false, message: 'There was an error: ' + err });
  }
};
const deleteStudent = async (req, res) => {
  const { studentId } = req.body
  await studentModel.deleteOne({ studentId }).then(() => {
    res.send({ status: true, message: 'Student Deleted Successfully' })
  })
    .catch(() => {
      res.send({ status: false, message: 'Cannot Delete student' })
    })
}
const findStudentById = async (req, res) => {
  const { studentId } = req.body
  await studentModel.find({ studentId: studentId }).
    then((student) => {
      if (student) {
        // console.log('student',student)
        res.send({ status: true, student })
      }
      else {
        res.send({ status: false, message: 'Not found!' })
      }
    })
}
const findStudentBySurName = (req, res) => {
  const { surName } = req.body
  studentModel.find({ surName: surName })
    .then((student) => {
      if (student) {
        res.send({ status: true, student })
      }
      else {
        res.send({ status: false, message: 'Not found!' })
      }
    })
}
const getStudents = async (req, res) => {
  const students = await studentModel.find();

  const studentData = await Promise.all(
    students.map(async (student) => {
      const parent = await parentModel.findOne(
        { parentId: student.parentId },
      );
      // console.log(parent)
      return {
        ...student._doc,
        parentName: parent.surName + ' ' + parent.otherNames,
        parentPhone: parent?.phoneNo,
      };
    })
  );

  res.send({ status: true, students: studentData });
}

const getStudentsByParentId = async (req, res) => {
  const { parentId } = req.params; // Extract from URL
  // console.log('Received Parent ID:', parentId);

  try {
    const students = await studentModel.find({ parentId: parentId });
    if (students.length > 0) {
      res.send({ status: true, students });
    } else {
      res.send({ status: false, message: 'No Students Found' });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: 'Server Error' });
  }
};
const getApplications = async (req, res) => {
  await studentModel.find({
    // isAdmitted:false
    status: 'Applicant'
  }).then((applications) => {
    res.send({ status: true, applications })
  })
    .catch((err) => {
      res.send({ status: false, message: 'There was an error:' + err })
    })
}
const checkfees = async (req, res) => {
  const { parent_Id } = req.body; // Using the original naming convention
  // console.log("Parent ID:", parent_Id);

  try {
    // Find all students associated with the given parent_Id and admitted
    const students = await studentModel.find({ parentId: parent_Id, status: 'Admitted', feesToPay: [] });

    // If no students are found, return false
    if (students.length > 0) {
      // console.log("Students found:", students);
      return res.send({ status: true, students });
    } else {
      // If students are found, return true and send the student data
      // console.log("No students found:", students);
      res.send({ status: false, students });
    }
  } catch (error) {
    console.error("Error checking fees:", error);
    return res.status(500).send({ status: false, message: 'Server Error' });
  }
};
const saveSelectedFees = async (req, res) => {
  try {
    const { feeSelections } = req.body;

    // Loop through each feeSelection
    for (let i = 0; i < feeSelections.length; i++) {
      // Find student by studentId (assuming studentId is unique)
      const student = await studentModel.findOne({ studentId: feeSelections[i].studentId });

      if (student) {
        // console.log(`Student found: ${student}`);

        // Save or update fees for this student
        // Assuming you have a field in the student model to store selected fees
        student.feesToPay = feeSelections[i].selectedFees;

        // Save the updated student document
        await student.save();

        // console.log(`Fees saved for studentId: ${student.studentId}`);
      } else {
        // console.log(`Student not found for studentId: ${feeSelections[i].studentId}`);
      }
    }

    return res.status(200).json({ status: true, message: 'Fees successfully saved for all students' });
  } catch (error) {
    // console.error(`Error saving fees: ${error.message}`);
    return res.status(500).json({ status: false, message: 'An error occurred while saving fees' });
  }
};
const getStudentFeesToPay = async (req, res) => {
  try {
    const { parent_Id } = req.body; // Extract parent_Id from request body
    // console.log(parent_Id);

    // Query to find students who are admitted and have feesToPay not empty
    const students = await studentModel.find({
      parentId: parent_Id,
      status: 'Admitted',
      feesToPay: { $exists: true, $not: { $size: 0 } } // Only return students with non-empty feesToPay
    });

    if (students.length > 0) {
      // Loop through each student and only send the feesToPay array if it exists and is not empty
      const result = students.map(student => ({
        studentId: student.studentId,
        surName: student.surName,
        otherNames: student.otherNames,
        feesToPay: student.feesToPay
      }));

      res.send({ status: true, students: result });
    } else {
      // console.log('No students found with fees to pay.');
      res.send({ status: false, message: 'No students found with fees to pay.' });
    }

  } catch (error) {
    console.error(`Error fetching students: ${error.message}`);
    res.send({ status: false, message: 'There was an error fetching students' });
  }
};
const getStudentfeestoPayClone = async (req, res) => {
  try {
    const { parent_Id } = req.body;
    const feesToPay = [];

    // 1. Get all admitted students for the parent
    const getParentStudents = await studentModel.find({
      parentId: parent_Id,     // make sure this matches your schema field
      status: 'Admitted',
    });

    // 2. Loop through each student (await-friendly using for...of)
    for (const student of getParentStudents) {
      // 3. Find the class the student is in
      const foundClass = await classModel.findOne({ studentId: student.studentId });

      // 4. Build student name
      const studentName = `${student.surName} ${student.otherNames}`;

      // 5. Push relevant data to feesToPay if class was found
      if (foundClass) {
        feesToPay.push({
          studentId: student.studentId,
          studentName,
          className: foundClass.className,
          classFees: foundClass.classFees,
        });
      }
    }

    // 6. Send final result
    res.send({ status: true, feesToPay });

  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).send({
      status: false,
      message: "Something went wrong while fetching fees.",
      error: error.message,
    });
  }
};

const checkIfNotAdmitted = async (req, res) => {
  const { parent_Id } = req.body;

  try {
    // Find all not admitted students
    const notAdmittedStudents = await studentModel.find({
      parentId: parent_Id,
      status: 'Not Admitted'
    });

    // If no not admitted students
    if (!notAdmittedStudents.length) {
      return res.send({ status: false, message: "All students are admitted." });
    }

    // Retrieve the admission form fee once
    const fee = await feesModel.findOne({ fee: "Admission Form" });

    if (!fee) {
      return res.send({ status: false, message: "Admission Form fee not set in feesModel." });
    }

    // Attach admission fee to each not admitted student
    const studentsWithFees = notAdmittedStudents.map((student) => ({
      studentId: student._id,
      surName: student.surName,
      otherNames: student.otherNames,
      admissionFee: {
        fee: fee.fee,
        price: fee.price,
      },
    }));

    return res.send({
      status: true,
      students: studentsWithFees,
    });
  } catch (error) {
    console.error("Error checking admission status:", error);
    res.status(500).send({ status: false, message: "Internal server error." });
  }
};

const getParentPayments = async (req, res) => {
  try {
    const { parent_Id } = req.body;
    if (!parent_Id) {
      return res.send({ status: false, message: "parentId is required" });
    }

    // 1. Get all students for this parent
    const students = await studentModel.find({ parentId: parent_Id });
    if (!students.length) {
      return res.send({ status: false, message: "No students found." });
    }
    // console.log(students)
    // 2. Process each student
    const result = await Promise.all(
      students.map(async (student) => {
        if (student.status == 'Not Admitted') {
          // 🔹 Case 1: Not admitted → Admission fee only
          const admissionFee = await feesModel.findOne({ fee: "Admission fee" });

          return {
            studentId: student.studentId, // ✅ use custom studentId
            surName: student.surName,
            otherNames: student.otherNames,
            type: "notAdmitted",
            fees: admissionFee
              ? [{ fee: admissionFee.fee, price: Number(admissionFee.price) }]
              : [],
            books: [],
            totalRequired: admissionFee ? Number(admissionFee.price) : 0,
            totalPaid: 0,
            outstanding: admissionFee ? Number(admissionFee.price) : 0,
          };
        } else {
          // 🔹 Case 2: Admitted → find the student's class (class contains array of studentIds)
          const classData = await classModel.findOne({ students: student.studentId });
          if (!classData) {
            return {
              studentId: student.studentId,
              surName: student.surName,
              otherNames: student.otherNames,
              type: "admitted",
              fees: [],
              books: [],
              totalRequired: 0,
              totalPaid: 0,
              outstanding: 0,
            };
          }

          // 🔹 Fetch fees from feesModel (since classFees only stores fee names)
          let fees = [];
          if (classData.classFees.length) {
            const foundFees = await feesModel.find({
              fee: { $in: classData.classFees },
            });
            fees = foundFees.map((f) => ({
              fee: f.fee,
              price: Number(f.price), // ensure number
            }));
          }

          // 🔹 Fetch books from bookModel (since classBooks only stores names)
          let books = [];
          if (classData.classBooks.length) {
            const foundBooks = await bookModel.find({
              name: { $in: classData.classBooks },
            });
            books = foundBooks.map((b) => ({
              name: b.name,
              price: Number(b.price), // ensure number
            }));
          }

          // Calculate totals
          const totalFees = fees.reduce((sum, f) => sum + f.price, 0);
          const totalBooks = books.reduce((sum, b) => sum + b.price, 0);
          const totalRequired = totalFees + totalBooks;

          // Fetch payments using studentId
          const payments = await paymentModel.find({
            studentId: student.studentId,
          });
          // console.log(payments);
          const totalPaid = payments.reduce(
            (sum, p) => sum + Number(p.amountPaid),
            0
          );
          // console.log(totalPaid)

          const outstanding = totalRequired - totalPaid;

          return {
            studentId: student.studentId, // ✅ always custom ID
            surName: student.surName,
            otherNames: student.otherNames,
            type: "admitted",
            fees,
            books,
            totalRequired,
            totalPaid,
            outstanding,
          };
        }
      })
    );
    // console.log(result)
    res.send({ status: true, students: result });
  } catch (error) {
    console.error("Error fetching parent payments:", error);
    res.send({ status: false, message: "Server error" });
  }
};

const checkStudentPayment = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Active term
    const activeTerm = await termModel.findOne({ status: "Active" });

    if (!activeTerm) {
      return res.send({
        status: false,
        message: "No active term found",
      });
    }

    // Student
    const student = await studentModel.findOne({
      studentId,
      status: "Admitted",
    });

    if (!student) {
      return res.send({
        status: false,
        message: "Student not admitted",
      });
    }

    // Class
    const foundClass = await classModel.findOne({
      className: student.classAdmittedTo,
    });

    if (!foundClass) {
      return res.send({
        status: false,
        message: "Class not found",
      });
    }

    // All fees
    const fees = await feesModel.find({
      fee: {
        $in: foundClass.classFees,
      },
    });

    // All books
    const books = await bookModel.find({
      name: {
        $in: foundClass.classBooks,
      },
    });

    // Payments made
    const payments = await paymentModel.find({
      studentId,
      term: activeTerm.termName,
      session: activeTerm.session,
    });

    /*
        Get all paid items
    */

    const paidItems = [];

    payments.forEach((payment) => {
      if (payment.paidFor) {

        payment.paidFor.split(",").forEach((item) => {
          paidItems.push(item.trim().toLowerCase());
        });

      }
    });

    /*
        Filter unpaid fees
    */

    const unpaidFees = fees.filter(
      (fee) =>
        !paidItems.includes(fee.fee.toLowerCase())
    );

    /*
        Filter unpaid books
    */

    const unpaidBooks = books.filter(
      (book) =>
        !paidItems.includes(book.name.toLowerCase())
    );

    if (
      unpaidFees.length === 0 &&
      unpaidBooks.length === 0
    ) {
      return res.send({
        status: true,
        completed: true,
        message: "Student has completed all payments.",
      });
    }

    res.send({
      status: true,
      completed: false,
      unpaidFees,
      unpaidBooks,
    });

  } catch (err) {
    console.log(err);

    res.send({
      status: false,
      message: "Server Error",
    });
  }
};

const sentExaminationDate = async (req, res) => {
  try {
    const response = []
    const sendExamDate = await parentModel.find({
      isEntranceExamDateSent: true
    })
    if (sendExamDate.length === 0) {
      return res.send({ status: false, message: " No parent has been sent Examination Date" })
    }
    for (const parent of sendExam) {
      let foundStudents = await studentModel.find({
        parent: parent.parentId,
        status: 'Not Admitted'
      })

      response.push({
        parent,
        foundStudents
      })
    }

    res.send({ status: true, response })
  }
  catch (error) {
    console.log(error);
    res.send({ status: false, message: 'There was an error:', error })
  }

}

const searchExamDateSentByParentId = async (req, res) => {
  const { parentId } = req.body

  const parentfound = await parentModel.findOne({ parentId, isEntranceExamDateSent: true })
  if (parentfound) {
    res.send({ status: true, parentfound })
  } else {
    res.send({ status: false, message: 'Not found' })
  }
}

const getStudentsStatus = async (req, res) => {
  try {
    const getStudents = await disciplinaryModel.find();

    const students = getStudents.filter(
      (student) =>
        student.status !== "Not Admitted" &&
        student.status !== "Admitted"
    );

    res.send({
      status: true,
      students,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = { checkIfNotAdmitted, getStudentFeesToPay, saveSelectedFees, getApplications, getStudentsByParentId, addStudent, updateStudent, deleteStudent, findStudentById, findStudentBySurName, getStudentfeestoPayClone, checkfees, getStudents, getParentPayments, sentExaminationDate, searchExamDateSentByParentId, getStudentsStatus, checkStudentPayment }