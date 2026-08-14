const express = require("express");
const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  setActiveSession,
  getActiveSession,
} = require("../controllers/session.controller");

const router = express.Router();

router.post("/createSession", createSession);
router.get("/getSessions", getSessions);
router.get("/active", getActiveSession);
router.get("/getSessionById/:id", getSessionById);
router.post("/updateSession/:id", updateSession);
router.delete("/deleteSession/:id", deleteSession);
router.post("/:id/activate", setActiveSession);

module.exports = router;
