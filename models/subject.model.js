const mongoose = require ("mongoose")
let subjectSchema = mongoose.Schema
({
    subjectId: {type:String, required: true},
    subject: {type:String, required: true}
})

let subjectModel = mongoose.model("subject", subjectSchema);
module.exports = subjectModel;