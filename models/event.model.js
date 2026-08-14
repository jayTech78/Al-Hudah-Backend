const mongoose = require ("mongoose")
let eventSchema = mongoose.Schema
({
    eventId: {type:String, required:true},
    event: {type:String, required:true},
    eventDate: {type: Date, required: true}
})

let eventModel = mongoose.model("events", eventSchema);
module.exports = eventModel;