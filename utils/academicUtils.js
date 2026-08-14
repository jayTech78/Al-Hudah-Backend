/******************************************************************************
 * FILE
 * academicUtils.js
 *
 * PURPOSE
 * -------
 * Retrieves the active academic session and term.
 ******************************************************************************/

const sessionModel = require("../models/session.model");
const termModel = require("../models/term.model");

/**
 * Returns the active academic session.
 */
const getActiveSession = async () => {

    const session = await sessionModel.findOne({
        status: "Active"
    });

    if (!session) {
        throw new Error("No active session found.");
    }

    return session;

};

/**
 * Returns the active academic term.
 */
const getActiveTerm = async () => {

    const term = await termModel.findOne({
        status: "Active"
    });

    if (!term) {
        throw new Error("No active term found.");
    }

    return term;

};

/**
 * Returns both active session and term.
 */
const getAcademicPeriod = async () => {

    const session = await getActiveSession();

    const term = await getActiveTerm();

    return {
        session,
        term
    };

};

module.exports = {
    getActiveSession,
    getActiveTerm,
    getAcademicPeriod
};