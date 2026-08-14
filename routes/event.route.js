const express = require ("express")
const router = express.Router()
const {getEvents,addEvent, updateEvent, deleteEvent, getEventById} = require("../controllers/event.controller")

router.get("/getEvents",getEvents)
router.post("/addEvent",addEvent)
router.post("/updateEvent", updateEvent)
router.post("/deleteEvent", deleteEvent)
router.post("/getEventById", getEventById)

module.exports = router