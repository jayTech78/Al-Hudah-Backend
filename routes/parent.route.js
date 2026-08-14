const express = require ("express")
const router = express.Router()
const {getParents, parentSignUp, getDashboard, login,updateParent,deleteParent,findParentByEmail,findParentById,findParentBySurName} = require("../controllers/parent.controller")

router.post("/parentSignUp", parentSignUp)
router.post("/login",login)
router.post("/updateParent",updateParent)
router.post("/deleteParent",deleteParent)
router.post("/findParentById",findParentById)
router.post("/findParentByEmail",findParentByEmail)
router.post("/SearchParentBySurName",findParentBySurName)
router.get("/getParents", getParents)
router.get('/getDashboard', getDashboard)

module.exports = router