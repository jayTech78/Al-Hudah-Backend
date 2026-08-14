const express = require ("express")
const router = express.Router()
const {addManager, managerLogin, updateManager, deleteManager, findManagerByEmail, findManagerById, findManagerBySurName} = require("../controllers/manager.controller")

router.post("/addManager", addManager)
router.post("/managerLogin",managerLogin)
router.post("/updateManager",updateManager)
router.post("/deleteManager",deleteManager)
router.post("/findManagerByEmail",findManagerByEmail)
router.post("/findManagerById",findManagerById)
router.post("/findManagerBySurName",findManagerBySurName)

module.exports = router