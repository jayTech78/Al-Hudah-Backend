const express = require ("express")
const router = express.Router()
const { sendEntranceExamDate, sendAdmissionLetter } = require("../controllers/emailService")

router.post("/sendEntranceExamDate", sendEntranceExamDate)
router.post("/sendAdmissionLetter",sendAdmissionLetter)

module.exports = router