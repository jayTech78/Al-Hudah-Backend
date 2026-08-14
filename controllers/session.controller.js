const Session = require("../models/session.model");
const Term = require("../models/term.model");

// Create Session
const createSession = async (req, res) => {
  try {
    const { sessionName, startDate, endDate, status } = req.body;

    const exists = await Session.findOne({ sessionName });
    if (exists) {
      return res.status(400).json({ status: false, message: "Session already exists" });
    }

    const session = await Session.create({
      sessionName,
      startDate,
      endDate,
      status: status || "Inactive",
    });

    res.send({ status: true, message: "Session created successfully", session });
  } catch (error) {
    console.error("createSession error:", error);
    res.send({ status: false, message: "Server Error" });
  }
};

// Get All Sessions
// controllers/session.controller.js
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    return res.send({ status: true, sessions });
  } catch (error) {
    console.error("getSessions error:", error);              // <— see it in terminal
    return res.send({ status: false, message: error.message || "Server Error" });
  }
};

// Get Session by ID
const getSessionById = async (req, res) => {
  try {

    const session = await Session.findById(req.params.id);
    if (!session) return res.send({ status: false, message: "Session not found" });

    res.send({ status: true, session });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

// Update Session
const updateSession = async (req, res) => {
  try {
    const updated = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.send({ status: false, message: "Session not found" });

    res.send({ status: true, message: "Session updated successfully", session: updated });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

// Delete Session
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    await Term.deleteMany({ session: id });
    const deleted = await Session.findByIdAndDelete(id);
    if (!deleted) return res.status({ status: false, message: "Session not found" });

    res.send({ status: true, message: "Session deleted successfully" });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

// Set Active Session
const setActiveSession = async (req, res) => {
  try {
    const { id } = req.params;
    await Session.updateMany({}, { status: "Inactive" });
    const active = await Session.findByIdAndUpdate(id, { status: "Active" }, { new: true });
    if (!active) return res.send({ status: false, message: "Session not found" });

    res.send({ status: true, message: "Active session set successfully", session: active });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

// Get Active Session
const getActiveSession = async (_req, res) => {
  try {
    const session = await Session.findOne({ status: "Active" });
    if (!session) return res.json({ status: false, message: "No active session" });

    res.json({ status: true, session });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  setActiveSession,
  getActiveSession,
};
