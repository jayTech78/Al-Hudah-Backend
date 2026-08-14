const mongoose = require ("mongoose")
const bcrypt = require("bcryptjs")

let managerSchema = mongoose.Schema
({
    managerId: {type:String, required:true},
    surName: {type:String, required:true},
    otherNames: {type:String, required:true},
    phoneNo:{type:String, required:true},
    email:{type:String, required: true},
    address:{type:String, required: true},
    password:{type:String, required:true},
    dateRegistered:{type:Date, default:Date.now()},
    role:{type:String, required:true},
})
let saltRound = 5
managerSchema.pre("save", function(next)
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
managerSchema.methods.validatePassword = function (password, callback)
{
    bcrypt.compare(password, this.password,(err,same)=>
    {
        if (err) {
            // console.log('model', err)
        }else{
            callback(err, same);
        }
    })
}

let managerModel = mongoose.model("manager", managerSchema);
module.exports = managerModel;