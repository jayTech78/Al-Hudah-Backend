const express = require ("express")
const router = express.Router()
const 
{getOutstandingPayment, getPaymentById  , getPayments, paymentHistory, verifyPayment, verifyIfPaid, addPayment, approvePayment, getDebtorsByClass} = require("../controllers/payment.controller")

router.post("/verifyPayment", verifyPayment)
router.post("/verifyIfPaid", verifyIfPaid)
router.post('/getOutstandingPayment',getOutstandingPayment)
router.post("/addPayment",addPayment)
router.post("/paymentHistory",paymentHistory)
router.post("/approvePayment",approvePayment)
router.get('/getPayments',getPayments)
router.post('/getPaymentById',getPaymentById)
router.post("/getDebtorsByClass/:className", getDebtorsByClass);
module.exports = router