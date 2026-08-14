const express = require ("express")
const router = express.Router()
const {addRole,findRoleById,updateRole,deleteRole, getRoles} = require("../controllers/role.controller")

router.post("/addRole", addRole)
router.post("/findRoleById",findRoleById)
router.post("/updateRole",updateRole)
router.post("/deleteRole",deleteRole)
router.get('/getRoles',getRoles)

module.exports = router