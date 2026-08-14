const mongoose = require ("mongoose")
let disciplinarySchema = mongoose.Schema
({
    disciplinaryId: {type:String, required:true},
    studentId: {type:String, required:true},
    studentName:{type:String, required: true},
    status:{type:String, required:true},
    offence:{type: String, required: true},
    dateRecorded: {type: Date, required: true}
})

let disciplinaryModel = mongoose.model("disciplinary", disciplinarySchema);
module.exports = disciplinaryModel;