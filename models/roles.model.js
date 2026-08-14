const mongoose = require ("mongoose")
let roleSchema = mongoose.Schema
({
    roleId: {type:String, required: true},
    theRole: {type:String, required: true}
})

let roleModel = mongoose.model("role", roleSchema);
module.exports = roleModel;