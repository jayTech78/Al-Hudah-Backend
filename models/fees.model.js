const mongoose = require ("mongoose")
let feesSchema = mongoose.Schema
({
    feeId: {type:String, required: true},
    price: {type:String, required: true},
    fee: {type:String, required: true}
})

let feesModel = mongoose.model("fees", feesSchema);
module.exports = feesModel;