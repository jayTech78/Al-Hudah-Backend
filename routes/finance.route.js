const express = require('express')
const router = express.Router()
const {addFinance, getFinances,getFinancesByWithdrawnFor, getFinancesByDate, getAccounts} = require('../controllers/finance.controller')

router.get('/getFinances', getFinances)
router.post('/addFinance', addFinance)
router.post('/getFinancesByWithdrawnFor', getFinancesByWithdrawnFor)
router.post('/getFinancesByDate', getFinancesByDate)
router.get('/getAccounts', getAccounts)
module.exports = router