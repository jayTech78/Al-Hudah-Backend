const termModel = require("../models/term.model");
const sessionModel = require("../models/session.model");

// Create Term
const createTerm = async (req, res) => {
  try {
    console.log(req.body);

    const { termName, startDate, endDate } = req.body;

    // 1. Validate required fields
    if (!termName || !startDate || !endDate) {
      return res.send({
        status: false,
        message: "Term name, start date and end date are required",
      });
    }

    // 2. Get the active session
    const session = await sessionModel.findOne({
      status: "Active",
    });

    if (!session) {
      return res.send({
        status: false,
        message: "No active session found",
      });
    }

    // 3. Check if this term already exists for the active session
    const existingTerm = await termModel.findOne({
      termName,
      session: session.sessionName,
    });

    if (existingTerm) {
      return res.send({
        status: false,
        message: `${termName} already exists for ${session.sessionName}`,
      });
    }

    // 4. Create the term
    const term = await termModel.create({
      termName,
      startDate,
      endDate,
      session: session.sessionName,
      status: "InActive",
    });

    // 5. Return response
    return res.send({
      status: true,
      message: "Term created successfully",
      term,
    });

  } catch (error) {
    console.error("createTerm error:", error);

    return res.send({
      status: false,
      message: "Server Error",
    });
  }
};

// Get All Terms
const getTerms = async (req, res) => {
  try {
    const terms = await termModel.find().sort({ createdAt: -1 });
    res.send({ status: true, terms });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

// Update Term
const updateTerm = async (req, res) => {
  try {
    const term = await termModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!term) return res.send({ status: false, message: "Term not found" });

    res.send({ status: true, message: "Term updated successfully", term });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

// Delete Term
const deleteTerm = async (req, res) => {
  try {
    const deleted = await termModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.send({ status: false, message: "Term not found" });

    res.send({ status: true, message: "Term deleted successfully" });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

// Set Active Term
const setActiveTerm = async (req, res) => {
  try {
    const { id } = req.params;

    // Set all terms to inactive
    await termModel.updateMany({}, { status: "Inactive" });

    // Set the selected term to active
    const updatedTerm = await termModel.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );

    if (!updatedTerm) {
      return res.send({ status: false, message: "Term not found" });
    }

    res.send({ status: true, message: "Term activated", term: updatedTerm });
  } catch (error) {
    console.error("Error activating term:", error);
    res.send({ status: false, message: "Server error" });
  }
};


// Get Active Term
const getActiveTerm = async (req, res) => {
  try {
    const term = await termModel.findOne({ status: "Active" }).populate("session");
    if (!term) return res.send({ status: false, message: "No active term from here" });

    res.send({ status: true, term });
  } catch (error) {
    res.send({ status: false, message: "Server Error" });
  }
};

module.exports = {
  createTerm,
  getTerms,
  updateTerm,
  deleteTerm,
  setActiveTerm,
  getActiveTerm,
};