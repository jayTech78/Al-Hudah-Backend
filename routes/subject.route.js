const express = require ("express")
const router = express.Router()
const {getSubjects, addSubject,findSubjectById,updateSubject,deleteSubject} = require("../controllers/subject.controller")

router.get("/getSubjects", getSubjects)
router.post("/addSubject",addSubject)
router.post("/findSubjectById",findSubjectById)
router.post("/updateSubject",updateSubject)
router.post('/deleteSubject',deleteSubject)
module.exports = router