const mongoose =  require("mongoose")
const bcrypt = require ("bcryptjs")

let principalSchema = mongoose.Schema
({
    firstname:{type:String, required:true},
    middlename:{type:String, required},
    lastname:{type:String, required:true},
    phoneNo:{type:String, required:true},
    email:{type:String, required: true},
    dateOfBirth:{type:String, required:true},
    address:{type:String, required},
    dateRegistered:{type:Date, default:Date.now()},
    password:{type:String, required:true},
    role:{type:String, required:true}
})
let saltRound = 5

principalSchema.pre("save",function(next)
{
    bcrypt.hash(this.password,saltRound,(err,hashedPassWord)=>
    {
        if(err)
        {
            // console.log(err)
        }else
        {
            this.password = hashedPassWord
        }
    })
})
principalSchema.methods.validatePassword = function(password,callback)
{
    bcrypt.compare(password, this,password,(err,same)=>
    {
        if(err)
        {
            next()
        }
        callback(err,same)
    })
}
let principalModel = mongoose.model("teacher",principalSchema);
model.exports = principalModel;