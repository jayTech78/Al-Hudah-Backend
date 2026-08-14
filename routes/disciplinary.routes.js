const express = require("express");
const router = express.Router()
const {add, update, searchStudent, get} = require("../controllers/disciplinary.controller");

router.post("/add", add);
router.put("/update", update);
router.post("/searchStudent/", searchStudent);
router.get("/get", get);

module.exports = router