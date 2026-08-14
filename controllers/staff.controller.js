const staffModel = require("../models/staff.model");
const classModel = require("../models/class.model");
const studentModel = require("../models/student.model");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");
cloudinary.config({
  cloud_name: "dmyvk5qyq",
  api_key: "817443962198346",
  api_secret: "YqUWDjBlyz2lZ7ckeDDWKiwOx54",
});


const generateId = async () => {
  const prefix = "STF";
  const year = new Date().getFullYear();

  const staffs = await staffModel.find({
    staffId: { $regex: `^${prefix}/${year}/` },
  });

  let highest = 0;

  staffs.forEach((staff) => {
    const number = Number(staff.staffId.split("/")[2]);

    if (number > highest) {
      highest = number;
    }
  });

  const nextNumber = highest + 1;

  return `${prefix}/${year}/${String(nextNumber).padStart(4, "0")}`;
};

const addStaff = async (req, res) => {

  const staffId = generateId
  let {
    surName,
    otherNames,
    email,
    phoneNo,
    address,
    password,
    gender,
    dateOfBirth,
    role,
    classTaken,
    subjectTaken,
    salary,
  } = req.body;
  const existingStaff = await staffModel.findOne({ email });

  if (existingStaff) {
    return res.send({ status: false, message: "Email already registered" });
  }

  const staffObj = {
    staffId,
    surName,
    otherNames,
    phoneNo,
    email,
    address,
    password,
    role,
    gender,
    dateOfBirth,
    classTaken,
    subjectTaken,
    salary,
    dateRegistered: Date.now(),
  };

  if (classTaken) {
    const foundClass = await classModel.findOne({ className: classTaken });

    // console.log(foundClass)

    if (foundClass) {
      foundClass.classTeacherId = staffId;
      foundClass.classTeacher = surName + ' ' + otherNames
      await foundClass.save();

      let form = new staffModel(staffObj);
      form
        .save()
        .then(() => {
          res.send({
            status: true,
            message: "Registered Successfully",
            staff: form,
          });
        })
        .catch((error) => {
          console.log(error);
          res.send({ status: false, message: "There was an error" + error });
        });
    }
  }


  let form = new staffModel(staffObj);
  form
    .save()
    .then(() => {
      res.send({
        status: true,
        message: "Registered Successfully",
        staff: form,
      });
    })
    .catch((error) => {
      console.log(error);
      res.send({ status: false, message: "There was an error" + error });
    });
  // console.log(userObj)
};

const updateStaff = async (req, res) => {
  // console.log(req.body);
const {classTaken, staffId, surName, otherNames}= req.body

  if (classTaken) {
    // console.log('classTaken',classTaken);

    const foundClass = await classModel.findOne({ className: classTaken });

    // console.log('foundClass', foundClass);

    if (foundClass) {
      foundClass.classTeacherId = staffId;
      foundClass.classTeacher = surName + ' ' + otherNames;
      await foundClass.save();

      // console.log(surName + " "+ otherNames)
      // console.log('saved')
    }
  }

    const updatestaff = await staffModel.findOneAndUpdate(
      { staffId },
      {
        // all the manager info
        surName: req.body.surName,
        otherNames: req.body.otherNames,
        phoneNo: req.body.phoneNo,
        email: req.body.email,
        address: req.body.address,
        role: req.body.role,
        gender: req.body.gender,
        dateOFBirth: req.body.dateOfBirth,
        subjectTaken: req.body.subjectTaken,
        salary: req.body.salary,
        classTaken: req.body.classTaken,
      }
    );
    if (updatestaff) {
      res.send({ status: true, message: "Updated Successfully" });
    } else {
      res.send({ status: true, message: "Cannot Update Parent" });
    }
  };

  const login = (req, res) => {
  const { email, password } = req.body;

  staffModel.findOne({ email })
    .then((user) => {

      // User doesn't exist
      if (!user) {
        return res.send({
          status: false,
          message: "User Not Found"
        });
      }

      const secret = process.env.SECRET;

      user.validatePassword(password, (err, same) => {

        // Password validation error
        if (err) {
          return res.send({
            status: false,
            message: "Invalid Password"
          });
        }

        // Password is incorrect
        if (!same) {
          return res.send({
            status: false,
            message: "Invalid Password"
          });
        }

        // Create token
        const token = jwt.sign(
          {
            email: user.email,
            role: user.role
          },
          secret,
          {
            expiresIn: "1d"
          }
        );

        // Successful login
        return res.send({
          status: true,
          message: "Login Successful",
          role: user.role,
          id: user.staffId,
          token,
          className: user.classTaken
        });

      });
    })
    .catch((error) => {

      console.error("Login error:", error);

      return res.status(500).send({
        status: false,
        message: "Server error"
      });

    });
};

  const deleteStaff = async (req, res) => {
    const { staffId } = req.body;
    const deleteStaff = await staffModel.findOneAndDelete({ staffId });
    if (deleteStaff) {
      res.send({ status: true, message: "Manager Deleted Successfully" });
    } else {
      res.send({ status: false, message: "Cannot Delete Manager" });
    }
  };

  const findStaffByEmail = (req, res) => {
    const { email } = req.body;
    staffModel.find({ email: email }).then((staff) => {
      if (staff) {
        res.send({ status: true, staff });
      } else {
        res.send({ status: false, message: "Not Found!" });
      }
    });
  };

  const findStaffById = (req, res) => {
    const { staffId } = req.params;
    staffModel.findOne({ staffId }).then((staff) => {
      if (staff) {
        res.send({ status: true, staff });
      } else {
        res.send({ status: false, message: "Staff Not found!" });
      }
    });
  };

  const findStaffBySurName = (req, res) => {
    const { lastName } = req.body;
    staffModel.find({ surName: lastName }).then((staff) => {
      if (staff) {
        res.send({ status: true, staff });
      } else {
        res.send({ status: false, message: "Not found!" });
      }
    });
  };

  const getStaffs = async (req, res) => {
    await staffModel.find().then((staffs) => {
      if (staffs) {
        res.send({ status: true, staffs });
      } else {
        res.send({ status: false, message: "This field is empty" });
      }
    });
  };

  const getTeachers = async (req, res) => {
    try {
      const teachers = await staffModel.find({ role: "Teacher" });
      if (teachers && teachers.length > 0) {
        res.send({ status: true, teachers });
      } else {
        res.send({ status: false, message: "Not Found!" });
      }
    } catch (error) {
      res
        .status(500)
        .send({
          status: false,
          message: "An error occurred",
          error: error.message,
        });
    }
  };

  const getStaffsByRole = async (req, res) => {
    try {
      // Fetch all staff members
      const staffs = await staffModel.find();

      // Create a mapping of roles to staffs
      const staffsByRole = {};

      // Iterate over each staff member
      staffs.forEach((staff) => {
        const role = staff.role;
        // Initialize the array for the role if it doesn't exist
        if (!staffsByRole[role]) {
          staffsByRole[role] = [];
        }
        // Add the staff member to the appropriate role
        staffsByRole[role].push(staff);
      });

      // Log the structured data
      // console.log(staffsByRole);

      // Respond with the organized staff data
      res.send({
        status: true,
        message: "Staffs organized by role",
        data: staffsByRole,
      });
    } catch (error) {
      console.error("Error fetching staff members:", error);
      res.send({
        status: false,
        message: "An error occurred while fetching staff members",
        error: error.message,
      });
    }
  };

  const teachersDashboard = async (req, res) => {
    try {
      const { classTeacher } = req.body;

      // Step 1: Get the class assigned to this teacher
      const classDetails = await classModel.findOne({ classTeacher });
      // console.log(classDetails)

      if (!classDetails) {
        return res.send({ status: false, message: "Class not found!!!" });
      }

      // Step 2: Fetch full student records based on IDs
      const studentIds = classDetails.students; // e.g. ['140948', '140949']
      const students = await studentModel.find({
        studentId: { $in: studentIds },
      });

      // Step 3: Add full students back into the class details
      const response = {
        ...classDetails._doc, // spread existing class info
        students,
      };

      // console.log(response);

      res.send({ status: true, classDetails: [response] });
    } catch (error) {
      console.error(error);
      res.send({ status: false, message: "Internal Server Error" });
    }
  };

  const getDashboard = async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    let secret = process.env.SECRET;
    jwt.verify(token, secret, (err, result) => {
      if (err) {
        console.log(err);
        res.send({ status: false, message: "" });
      } else {
        // console.log(result)
        res.send({ status: true, message: "welcome", result });
      }
    });
  };

  module.exports = {
    getDashboard,
    getStaffsByRole,
    getTeachers,
    addStaff,
    getStaffs,
    login,
    updateStaff,
    deleteStaff,
    findStaffByEmail,
    findStaffById,
    findStaffBySurName,
    teachersDashboard,
  };
