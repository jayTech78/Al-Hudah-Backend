/******************************************************************************
 *
 * FILE NAME
 * ---------
 * classService.js
 *
 * PURPOSE
 * -------
 * Contains reusable business logic for managing school classes.
 *
 * This service is the single source of truth for all class operations.
 *
 ******************************************************************************/

// ============================================================================
// IMPORTS
// ============================================================================

const classModel = require("../models/class.model");
const studentModel = require("../models/student.model");

// ============================================================================
// CLASS RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * ============================================================================
 * Get a class document.
 * ============================================================================
 */
const getClassByName = async (className) => {
// console.log("getclassByName", className)
    const foundClass = await classModel.findOne({ className });
    // console.log("get Class By Name",foundClass.classSubjects);
    
    if (!foundClass) {
        throw new Error("Class not found.");
    }

    return foundClass;

};

/**
 * ============================================================================
 * Get every student belonging to a class.
 * ============================================================================
 */
const getStudentsByClassName = async (className) => {

    const foundClass = await getClassByName(className);

    return await studentModel.find({
        studentId: {
            $in: foundClass.students
        }
    });

};

/**
 * ============================================================================
 * Get all subjects assigned to a class.
 * ============================================================================
 */
const getSubjectsByClass = async (className) => {

    // console.log("get subject by Class",className)
    const foundClass = await getClassByName(className);
    // console.log(foundClass.classSubjects)
    return foundClass.classSubjects;

};

/**
 * ============================================================================
 * Get number of students in a class.
 * ============================================================================
 */
const getClassSize = async (className) => {

    const foundClass = await getClassByName(className);

    return foundClass.students.length;

};

// ============================================================================
// CLASS UPDATE FUNCTIONS
// ============================================================================

/**
 * ============================================================================
 * Add a student to a class.
 * ============================================================================
 */
const addStudentToClass = async (className, studentId) => {

    return await classModel.findOneAndUpdate(

        { className },

        {
            $addToSet: {
                students: studentId
            }
        },

        { new: true }

    );

};

/**
 * ============================================================================
 * Remove a student from a class.
 * ============================================================================
 */
const removeStudentFromClass = async (className, studentId) => {
    return await classModel.findOneAndUpdate(
        { className },
        {
            $pull: {
                students: studentId
            }
        },
        { new: true }
    );
};

/**
 * ============================================================================
 * Change class teacher.
 * ============================================================================
 */
const updateClassTeacher = async (className, teacherId) => {

    return await classModel.findOneAndUpdate(

        { className },

        {

            classTeacherId: teacherId

        },

        {

            new: true

        }

    );

};

// ============================================================================
// RESULT STATUS FUNCTIONS
// ============================================================================

/**
 * ============================================================================
 * Update result status.
 * ============================================================================
 */
const updateResultStatus = async (
    className,
    term,
    finalized
) => {
    return await classModel.findOneAndUpdate(
        {
            className
        },

        {
            $set: {
                [`resultStatus.${term}.finalized`]: finalized,
                [`resultStatus.${term}.finalizedAt`]: new Date()
            }
        },
        {
            new: true
        }

    );

};

/**
 * ============================================================================
 * Check whether a term has been finalized.
 * ============================================================================
 */
const isResultFinalized = async (
    className,
    term
) => {
    const foundClass = await getClassByName(className);
    return foundClass.resultStatus?.[term]?.finalized || false;

};

// ============================================================================
// PROMOTION FUNCTIONS
// ============================================================================

/**
 * ============================================================================
 * Save promotion information.
 * ============================================================================
 */
const updatePromotionHistory = async (
    className,
    session,
    fromClass,
    toClass
) => {

    return await classModel.findOneAndUpdate(
        {
            className
        },

        {
            $set: {
                "promotion.lastPromotedSession": session,
                "promotion.promotedAt": new Date()
            },

            $push: {
                "promotion.history": {
                    session,
                    fromClass,
                    toClass,
                    promotedAt: new Date()
                }
            }
        },

        {
            new: true
        }
    );
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    getClassByName,
    getStudentsByClassName,
    getSubjectsByClass,
    getClassSize,
    addStudentToClass,
    removeStudentFromClass,
    updateClassTeacher,
    updateResultStatus,
    isResultFinalized,
    updatePromotionHistory
};