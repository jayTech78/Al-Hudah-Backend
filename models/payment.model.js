const mongoose = require('mongoose')
let paymentSchema = mongoose.Schema
({
    paymentRef: {type: String, required: true},
    fullName: {type:String, required:true},
    studentName:{type:String},
    parentId: {type: String, required: true},
    paidFor: {type: String, required:true},
    amountPaid: {type:String,required:true},
    studentId: {type: String},
    datePaid: {type:Date, required: true},
    isApproved:{type:Boolean},
    session: String,
    term: String
})
let paymentModel = mongoose.model("payments", paymentSchema);
module.exports = paymentModel;