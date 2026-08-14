const express = require("express");
const {
  createTerm,
  getTerms,
  updateTerm,
  deleteTerm,
  setActiveTerm,
  getActiveTerm,
} = require("../controllers/term.controller");
const {checkActiveSession} = require('../middleware/checkAcademicPeriod')

const router = express.Router();

router.post("/createTerm", checkActiveSession, createTerm);
router.get("/getTerms", getTerms);
router.get("/active", getActiveTerm);
router.post("/updateTerm/:id", updateTerm);
router.delete("/deleteTerm/:id", deleteTerm);
router.post("/:id/activate", setActiveTerm);

module.exports = router;