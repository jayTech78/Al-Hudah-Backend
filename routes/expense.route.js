const express = require ("express")
const router = express.Router()
const { getExpense, addExpense, updateExpense, getExpenseByRef, findByCategory, findCategories } = require("../controllers/expense.controller")

router.get('/getExpenses', getExpense);
router.get('/findCategories', findCategories);
router.post("/addExpense",addExpense);

router.post("/updateExpense",updateExpense);
router.post("/getExpenseByRef",getExpenseByRef);
router.get('/findByCategory',findByCategory )

module.exports = router