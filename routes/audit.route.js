const express = require ("express")
const router = express.Router()
const { getTransactionByStudentId } = require("../controllers/audit.controller")

router.post("/getTransactionByStudentId",getTransactionByStudentId)

module.exports = router