const express = require ("express")
const router = express.Router()
const { getIncome, addIncome, deleteIncome,updateIncome, getIncomeByRef,findBySource,findSources } = require("../controllers/income.controller")

router.get('/getIncomes', getIncome);
router.post("/addIncome",addIncome);
router.post("/updateIncome",updateIncome);
router.post("/getIncomeByRef",getIncomeByRef);
router.get('/findBySource', findBySource)
router.get('/findSources', findSources)
module.exports = router