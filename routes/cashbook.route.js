const express = require ("express")
const router = express.Router()
const { getCashbook } = require("../controllers/cashbook.controller")

router.get("/getCashbook", getCashbook)
module.exports = router