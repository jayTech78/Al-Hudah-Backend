const express = require ("express")
const router = express.Router()
const {getAdmissionFee, getFees, addFee,findFeeById,updateFee,deletefee} = require("../controllers/fees.controller")

router.post("/addFee", addFee)
router.post("/findFeeById",findFeeById)
router.post("/updateFee",updateFee)
router.post("/deletefee",deletefee)
router.get('/getFees',getFees)
router.post("/getAdmissionFee",getAdmissionFee)
module.exports = router