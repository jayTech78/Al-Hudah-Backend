// period.middleware.js
const sessionModel = require("../models/session.model");
const termModel = require("../models/term.model");

const checkActiveSessionAndTerm = async (req, res, next) => {
  try {
    const session = await sessionModel.findOne({ status: "Active" });
    if (!session) {
      return res.status(400).json({ status: false, message: "No active session found" });
    }

    const term = await termModel.findOne({ session: session._id, status: "Active" });
    if (!term) {
      return res.status(400).json({ status: false, message: "No active term found for the session" });
    }

    req.activeSession = session;
    req.activeTerm = term;
    next();
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
};
const addActiveSessionAndTerm = async (req, res, next) => {
  try {
    const session = await sessionModel.findOne({ status: "Active" });
    if (!session) {
      return res.status(400).json({ status: false, message: "No active session found" });
    }

    const term = await termModel.findOne({ session: session._id, status: "Active" });
    if (!term) {
      return res.status(400).json({ status: false, message: "No active term found for the session" });
    }

    req.activeSession = session.sessionName; // ✅ store in req instead of req.body
    req.activeTerm = term.termName;
    next();
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
};

const checkActiveSession = async (req, res, next)=>
{
    try {
        const session = await sessionModel.findOne({ status: "Active" });
        if (!session) {
          return res.status(400).json({ status: false, message: "No active session found" });
        }
        req.body.session = session.sessionName;
        next();
      } catch (err) {
        res.status(500).json({ status: false, message: "Server error" });
      }
}
module.exports = {checkActiveSessionAndTerm,checkActiveSession, addActiveSessionAndTerm};