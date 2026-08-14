const managerModel = require("../models/manager.model")
const jwt = require("jsonwebtoken");

const addManager = (req, res) => {
  const managerId = Math.floor(Math.random() * 10e5)
  // console.log(req.body)
  const {surName, otherNames, phoneNo, email, address,password} = req.body
  const staffObj =
  {
    managerId,
    surName,
    otherNames,
    phoneNo,
    email,
    address,
    password,
    dateRegistered: Date.now(),
    role: 'manager'
  }
  let form = new managerModel(staffObj)
  form.save().then(() => {
    res.send({ status: true, message: "Registered Successfully" })
  }).catch((error) => {
    console.log(error)
    res.send({ status: false, message: "There was an error" + error })
  })
};

const managerLogin = (req, res) => {
  let { email, password } = req.body
  managerModel.findOne({ email })
    .then((user) => {
      if (!user) {
        res.send({ status: false, message: "User Not Found" })
      }
      else {
        let secret = process.env.SECRET;
        user.validatePassword(password, (err, same) => {
          if (err) {
            res.send({ status: false, message: "Invalid Password" });
          } else {
            let token = jwt.sign({ email }, secret, { expiresIn: "1d" });
            res.send({
              status: true,
              message: "Correct Password",
              role: user.role,
              token,
            });
            // console.log(user.role);
          }
        });
      }
    })
}
const updateManager = async (req, res) => {
  const { managerId } = req.body
  const updateManager = await managerModel.findByIdAndUpdate(managerId, {
    // all the manager info
  });
  if (updateManager) {
    res.send({ status: true, message: 'Updated Successfully' })
  }
  else {
    res.send({ status: true, message: 'Cannot Update Parent' })
  }
}
const deleteManager = async (req, res) => {
  const { managerId } = req.body
  const deletemanager = await managerModel.deleteOne({ managerId })
  if (deletemanager) {
    res.send({ status: true, message: 'Manager Deleted Successfully' })
  }
  else {
    res.send({ status: false, message: 'Cannot Delete Manager' })
  }
}
const findManagerByEmail = (req, res) => {
  const { email } = req.body
  staffModel.findOne({ email: email }).
    then((staff) => {
      if (staff) {
        res.send({ status: true, staff })
      }
      else {
        res.send({ status: false, message: 'Not Found!' })
      }
    })
}
const findManagerById = (req, res) => {
  const { managerId } = req.body
  staffModel.find({ managerId }).
    then((staff) => {
      if (staff) {
        res.send({ status: true, staff })
      }
      else {
        res.send({ status: false, message: 'Not found!' })
      }
    })
}
const findManagerBySurName = (req, res) => {
  const { lastName } = req.body
  staffModel.find({ surName: lastName })
    .then((staff) => {
      if (staff) {
        res.send({ status: true, staff })
      }
      else {
        res.send({ status: false, message: 'Not found!' })
      }
    })
}
module.exports = { addManager, managerLogin, updateManager, deleteManager, findManagerByEmail, findManagerById, findManagerBySurName }