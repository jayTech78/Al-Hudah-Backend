const mongoose = require ("mongoose")
const bcrypt = require("bcryptjs")

let parentSchema = mongoose.Schema
({
    parentId: {type:String, required:true},
    surName: {type:String, required:true},
    otherNames: {type:String, required:true},
    phoneNo:{type:String, required:true},
    email:{type:String, required: true},
    address:{type:String, required: true},
    dateRegistered:{type:Date, default:Date.now()},
    password:{type:String, required:true},
    occupation:{type:String, required:true},
    studentId:String,
    studentIds : [],
    feesToPay : [],
    isEntranceExamDateSent: Boolean,
    isAdmissionletterSent: Boolean,
})
let saltRound = 5
parentSchema.pre("save", function(next)
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
parentSchema.methods.validatePassword = function (password, callback)
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

let parentModel = mongoose.model("parents", parentSchema);
module.exports = parentModel;