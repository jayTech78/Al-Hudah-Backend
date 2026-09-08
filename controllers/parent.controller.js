const parentModel = require("../models/parent.model");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/student.model");
// cloudinary.config({
//   cloud_name: 'dmyvk5qyq',
//   api_key: '817443962198346',
//   api_secret: 'YqUWDjBlyz2lZ7ckeDDWKiwOx54'
// })

const generateId = async () => {
  const prefix = "P";
  const year = new Date().getFullYear();

  const parents = await parentModel.find({
    parentId: {
      $regex: `^${prefix}/${year}/`,
    },
  });

  let highest = 0;

  parents.forEach((parent) => {
    if (!parent.parentId) return;

    const number = Number(parent.parentId.split("/")[2]);

    if (number > highest) {
      highest = number;
    }
  });

  const nextNumber = highest + 1;

  return `${prefix}/${year}/${String(nextNumber).padStart(4, "0")}`;
};

const parentSignUp = async (req, res) => {
  try {
    // Get data from frontend
    const {
      surName,
      otherNames,
      phoneNo,
      email,
      address,
      password,
      occupation,
      studentIds,
    } = req.body;

    // Validate required fields
    if (!surName || !otherNames || !phoneNo || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }

    // Check if email already exists
    const existingParent = await parentModel.findOne({ email });

    if (existingParent) {
      return res.status(400).json({
        status: false,
        message: "Email already registered",
      });
    }

    // Generate parent ID
    const parentId = await generateId();

    console.log("This is the parentId:", parentId);

    // Create parent object
    const parentObj = {
      parentId,
      surName,
      otherNames,
      phoneNo,
      email,
      address,
      password,
      occupation,
      studentIds: Array.isArray(studentIds) ? studentIds : [],
      isEntranceExamDateSent: false,
      isAdmissionletterSent: false,
    };

    // Save parent
    const newParent = new parentModel(parentObj);

    await newParent.save();

    console.log("Parent registered:", parentId);

    return res.status(201).json({
      status: true,
      message: "Registered Successfully",
      parent: parentObj,
    });

  } catch (error) {
    console.error("Error registering parent:", error);

    return res.status(500).json({
      status: false,
      message: "There was an error: " + error.message,
    });
  }
};

const login = (req, res) => {
  let { email, password } = req.body;
  parentModel.findOne({ email }).then((user) => {
    if (!user) {
      res.send({ status: false, message: "User Not Found" });
    } else {
      let secret = process.env.SECRET;
      user.validatePassword(req.body.password, (err, same) => {
        if (err) {
          res.send({ status: false, message: "Invalid Password" });
        } else {
          let token = jwt.sign({ email }, secret, { expiresIn: "1H" });
          res.send({
            status: true,
            message: "Correct Password",
            parentId: user.parentId,
            role: "parent",
            token,
          });
          // console.log(user.parentId)
        }
      });
    }
  });
};
const updateParent = async (req, res) => {
  try {
    const { parentId, ...updateData } = req.body; // parentId + other fields
    // console.log("Updating Parent:", parentId, updateData);

    if (!parentId) {
      return res
        .status(400)
        .json({ status: false, message: "parentId is required" });
    }

    // Ensure studentIds is an array if provided
    if (updateData.studentIds && !Array.isArray(updateData.studentIds)) {
      return res
        .status(400)
        .json({ status: false, message: "studentIds must be an array" });
    }

    // Find and update parent
    const updatedParent = await parentModel.findOneAndUpdate(
      { parentId }, // filter by parentId
      { $set: updateData }, // update fields
      { new: true } // return updated document
    );

    if (!updatedParent) {
      return res
        .status(404)
        .json({ status: false, message: "Parent not found" });
    }

    res.status(200).json({
      status: true,
      message: "Parent updated successfully",
      parent: updatedParent,
    });
  } catch (error) {
    console.error("Error updating parent:", error);
    res
      .status(500)
      .json({ status: false, message: "There was an error: " + error.message });
  }
};
const deleteParent = async (req, res) => {
  const { parentId } = req.body;
  const deleteparent = await parentModel.deleteOne({ parentId });
  if (deleteparent) {
    res.send({ status: true, message: "Parent Deleted Successfully" });
  } else {
    res.send({ status: false, message: "Can not Delete Parent" });
  }
};
const findParentByEmail = () => {
  const { email } = req.body;
  parentModel.find({ email: email }).then((parent) => {
    if (parent) {
      res.send({ status: true, parent });
    } else {
      res.send({ status: false, message: "Not found!" });
    }
  });
};
const findParentById = (req, res) => {
  const { id } = req.body;
  // console.log(id)
  parentModel.find({ parentId: id }).then((parent) => {
    if (parent) {
      res.send({ status: true, parent });
    } else {
      res.send({ status: false, message: "Not found!" });
    }
  });
};
const findParentBySurName = () => {
  const { lastName } = req.body;
  parentModel.find({ surName: lastName }).then((parent) => {
    if (parent) {
      res.send({ status: true, parent });
    } else {
      res.send({ status: false, message: "Not found!" });
    }
  });
};
const getParents = async (req, res) => {
  try {
    // Step 1: Fetch all parents
    const parents = await parentModel.find().lean();
    // console.log(parents);
    const allStudents = await studentModel.find().lean();
    // console.log(allStudents);
    if (!parents || parents.length === 0) {
      return res.send({ status: false, message: "No parents found" });
    }

    // Step 2: Collect all studentIds from parents
    const allStudentIds = parents.flatMap((p) => p.studentIds || []);
    console.log(allStudentIds);
    // Step 3: Fetch all matching students in one query
    const students = await studentModel
      .find({ studentId: { $in: allStudentIds } })
      .lean();
    // Step 4: Attach students to each parent
    const parentsWithStudents = parents.map((parent) => {
      const parentStudents = students.filter((s) =>
        parent.studentIds.includes(s.studentId)
      );
      return {
        ...parent,
        students: parentStudents,
      };
    });
    // console.log(parentsWithStudents)
    res.status(200).json({ status: true, parents: parentsWithStudents });
  } catch (error) {
    console.error("Error fetching parents:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
const getDashboard = async (req, res) => {
  // console.log('Headers:', req.headers.authorization)
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
  getParents,
  parentSignUp,
  login,
  updateParent,
  deleteParent,
  findParentByEmail,
  findParentById,
  findParentBySurName,
  getDashboard,
};
