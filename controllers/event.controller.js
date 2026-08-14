const sessionModel = require('../models/session.model')
const termModel = require('../models/term.model')
const eventModel = require('../models/event.model')


const getEvents = async (req, res) => {
  // const events = [
  //   { title: "Exam Date", date: "2025-04-10" },
  //   { title: "PTA Meeting", date: "2025-04-15" },
  // ];
  const events = await eventModel.find()
  if (events) {
    return res.status(200).json({ status: true, events });
  }
  else {
    res.send({ status: false, message: 'No event has been created' })
  }
};
const addEvent = async (req, res) => {
  try {
    // console.log(req.body)
    // const { event, eventDate } = req.body

    const activeSession = await sessionModel.findOne({ status: "Active" });
    const activeTerm = await termModel.findOne({ status: "Active" })
    // console.log(activeSession, activeTerm)
    if (!activeTerm || !activeSession) {
      res.send({ message: "No active session or term found" })
    }
    const eventId = Math.floor(Math.random() * 1000)
    const eventObj = {
      eventId,
      event:req.body.event,
      activeSession,
      activeTerm,
      eventDate:req.body.eventDate,
    }
    const form = new eventModel(eventObj)
    await form.save()
    res.send({ status: true, message: 'Event Added Successfully!', event: form.toObject() })
  }
  catch (error) {
    console.log(error);
    res.send({ status: false, message: "There was an error:" + error.message })
  }
}
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.body

    const activeSession = await sessionModel.findOne({ status: "Active" });
    const activeTerm = await termModel.findOne({ status: "Active" })
    // console.log(activeSession, activeTerm)
    if (!activeTerm || !activeSession) {
      res.send({ message: "No active session or term found" })
    }

    const updated = await eventModel.findOneAndUpdate({ eventId },
      {
        event:req.body.event,
        activeSession,
        activeTerm,
        eventDate: req.body.eventDate
      }
    )
    if (updated) {
      res.send({ status: true, message: "Updated Successfully" })
    }
  }
  catch (error) {
    console.log(error.message)
    res.send({ status: false, message: "There was an error:" + error.message })
  }
}
const deleteEvent = async (req, res) => {
  const { eventId } = req.body
  await eventModel.deleteOne({ eventId })
    .then(() => {
      res.send({status:true, message: 'Event Deleted Successfully'})
    }).catch((error)=>
    {
      res.send({status: false, message:'Unable to delete event'})
    })
}
const getEventById = async (req, res) =>
{
  const {eventId} = req.body
  await eventModel.findOne({eventId}).then((eventFound)=>
  {
    if(eventFound)
    {
      res.send({status:true, eventFound})
    }
    else{
      res.send({status:false, message:"Not found!"})
    }
  })
}
module.exports = { getEvents, addEvent, updateEvent, deleteEvent, getEventById }