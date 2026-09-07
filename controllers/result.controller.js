/******************************************************************************
 *
 * FILE NAME
 * ---------
 * resultController.js
 *
 * PURPOSE
 * -------
 * Handles requests related to students' report cards.
 *
 ******************************************************************************/

// ============================================================================
// IMPORTS
// ============================================================================

const resultService = require("../services/resultService");

/******************************************************************************
 * Get Student Result
 ******************************************************************************/

const getStudentResult = async (req, res) => {

    try {
        const { studentId, session,term } = req.body;
        
        // console.log(req)
        const result = await resultService.getStudentResult(studentId, session, term);

        res.send({
            status: true,
            result
        });
    }

    catch (error) {
        console.error(error);
        res.send({
            status: false,
            message: error.message
        });
    }
};

/******************************************************************************
 * Get Student Result By Session & Term
 ******************************************************************************/

const getStudentResultByTerm = async (req, res) => {

    try {

        const { studentId, session, term } = req.body;

        const result = await resultService.getStudentResult(
            studentId,
            session,
            term
        );

        res.send({
            status: true,
            result
        });
    }

    catch (error) {
        console.error(error);
        res.send({
            status: false,
            message: error.message
        });
    }
};

/******************************************************************************
 * Get Class Results
 ******************************************************************************/

const getClassResults = async (req, res) => {

    try {
        const { className } = req.params;
        const results = await resultService.getClassResults(className);

        res.send({
            status: true,
            results
        });
    }

    catch (error) {
        console.error(error);
        res.send({
            status: false,
            message: error.message
        });
    }
};

/******************************************************************************
 * Get Class Results By Session & Term
 ******************************************************************************/

const getClassResultsByTerm = async (req, res) => {

    try {

        const {
            className,
            session,
            term
        } = req.body;

        const results = await resultService.getClassResults(
            className,
            session,
            term
        );

        res.status(200).send({
            status: true,
            results
        });
    }

    catch (error) {
        console.error(error);
        res.send({
            status: false,
            message: error.message
        });
    }
};

module.exports = {
    getStudentResult,
    getStudentResultByTerm,
    getClassResults,
    getClassResultsByTerm
};