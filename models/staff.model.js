const mongoose = require ("mongoose")
const bcrypt = require("bcryptjs")

let staffSchema = mongoose.Schema
({
    staffId: {type:String,required:true},
    surName:{type:String, required:true},
    otherNames: {type:String, required:true},
    gender: {type:String, required:true},
    dateOfBirth: {type:String , required:true},
    phoneNo:{type:String, required:true},
    email:{type:String, required: true},
    address:{type:String, required: true},
    password:{type:String, required:true},
    role:{type:String, required:true},
    classTaken:{type:String},
    subjectTaken: String,
    salary: String,
    dateRegistered:{type:Date, default:Date.now()},
})
let saltRound = 5
staffSchema.pre("save", function(next)
{
    bcrypt.hash(this.password, saltRound,(err,hashedPassword)=>
    {
        if(err)
        {
            console.log(err)
        }
        else
        {
            this.password = hashedPassword
            next()
        }
    })
})
staffSchema.methods.validatePassword = function (password, callback)
{
    bcrypt.compare(password, this.password,(err,same)=>
    {
        if (err) {
            console.log('model', err)
        }else{
            callback(err, same);
        }
    })
}

let staffModel = mongoose.model("staffs", staffSchema);
module.exports = staffModel;