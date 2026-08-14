const roleModel = require("../models/roles.model");

const addRole = async (req, res) => {
  const { theRole } = req.body;
  const roleId = Math.floor(Math.random() * 10e5);
  const roleObj = {
    roleId,
    theRole,
  };
  let form = await new roleModel(roleObj);
  form
    .save()
    .then(() => {
      res.send({ status: true, message: "Role Added Successfully" });
    })
    .catch((error) => {
      res.send({ status: true, message: "There was an error" + error });
    });
};
const findRoleById = async (req, res) => {
  const { roleId } = req.body;
  const findRole = await roleModel.findOne({ roleId });
  return findRole;
};
const updateRole = async(req,res)=>
    {
        const {roleId} =  req.body
        // console.log(req.body)
        await roleModel.findOneAndUpdate({roleId},
            {
                theRole: req.body.theRole
            }
        )
        .then((role)=>
        {
            if(role)
            {
                res.send({status:true, message:'Updated Succesfully'})
            }
            else{
                res.send({status:false, message:'Can not Update'})
            }
        }).catch((error)=>
        {
            res.send({status:true, message: error})
        })
    }
const deleteRole = async (req, res) => {
  const { roleId } = req.body;
  // console.log(roleId);
  await roleModel.findOneAndDelete({ roleId }).then(() => {
    res.send({ status: true, message: "Deleted Successfully!!!" });
  });
};
const getRoles = async (req, res) => {
  const roles = await roleModel.find();
  if (roles) {
    res.send({ status: true, roles });
  } else {
    res.send({ status: false, message: "No Role Has Been Added" });
  }
};
module.exports = { addRole, findRoleById, updateRole, deleteRole, getRoles };
