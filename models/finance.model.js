const mongoose = require ("mongoose")
let financeSchema = mongoose.Schema
({
    financeId: {type:String, required: true},
    currentBalance: {type:String},
    amountWithdrawn: {type:String},
    withdrawnFor:{type:String},
    dateWithdrawn:{type:Date}
})

let financeModel = mongoose.model("finance", financeSchema);
module.exports = financeModel;