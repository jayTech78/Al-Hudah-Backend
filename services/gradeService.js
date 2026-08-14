/******************************************************************************
 *
 * FILE NAME
 * ---------
 * gradeService.js
 *
 * MODULE
 * ------
 * Academic Management Module
 *
 * PURPOSE
 * -------
 * Handles all operations related to recording, updating and processing
 * students' grades.
 *
 * RESPONSIBILITIES
 * ----------------
 * ✔ Record teacher scores
 * ✔ Calculate CA
 * ✔ Calculate Total Score
 * ✔ Calculate Grade
 * ✔ Calculate Teacher Remark
 * ✔ Save grades
 * ✔ Trigger result generation
 *
 ******************************************************************************/

// ============================================================================
// IMPORTS
// ============================================================================

const gradeModel = require("../models/grade.model");

const {
    getAcademicPeriod
} = require("../utils/academicUtils");

const {
    calculateContinuousAssessment,
    calculateTotalScore,
    calculateGrade,
    calculateRemark
} = require("../utils/gradeUtils");

const classService = require("./classService");

// const resultService = require("./resultService");

/******************************************************************************
 * PRIVATE FUNCTION
 *
 * PURPOSE
 * -------
 * Builds the complete term object before saving.
 ******************************************************************************/

const buildTermData = (firstCa, secondCa, exam, subjectId) => {

    const continuousAssessment =
        calculateContinuousAssessment(
            firstCa,
            secondCa
        );

    const totalScore =
        calculateTotalScore(
            continuousAssessment,
            exam
        );

    const grade =
        calculateGrade(
            totalScore
        );

    const teacherRemark =
        calculateRemark(
            totalScore
        );

    return { firstCa, secondCa, exam, continuousAssessment, totalScore: totalScore, grade, teacherRemark, subjectId };

};

/******************************************************************************
 * PRIVATE FUNCTION
 *
 * PURPOSE
 * -------
 * Creates or updates a student's grade document.
 ******************************************************************************/

const saveGrade = async (studentId, className, session, term, termData,subjectId) => {

    const filter = { studentId, className, session,subjectId };

    let update = {};

    switch (term.toLowerCase()) {

        case "first term":

            update = {

                $set: {

                    firstTerm: termData

                }

            };

            break;

        case "second term":

            update = {

                $set: {

                    secondTerm: termData

                }

            };

            break;

        case "third term":

            update = {

                $set: {

                    thirdTerm: termData

                }

            };

            break;

        default:

            throw new Error("Invalid academic term.");

    }

    return await gradeModel.findOneAndUpdate(filter, update,
        {

            new: true,

            upsert: true

        }

    );

};

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Records grades submitted by teachers.
 ******************************************************************************/

const recordGrades = async (grade) => {

    const { session, term } = await getAcademicPeriod();

    const {
        studentId,
        className,
        subjectId,
        firstCa,
        secondCa,
        exam
    } = grade;

    const termData = buildTermData(
        firstCa,
        secondCa,
        exam,
        subjectId
    );

    const savedGrade = await saveGrade(
        studentId,
        className,
        session.sessionName,
        term.termName,
        termData,
        subjectId
    );

    await calculateSubjectPositions(
        subjectId,
        className,
        subjectId,
        session.sessionName,
        term.termName
    );

    await checkStudentCompletion(
        studentId,
        className,
        session.sessionName,
        term.termName
    );

    return savedGrade;
};

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Updates an already recorded grade.
 *
 * NOTE
 * ----
 * Updating a grade simply calls recordGrades(),
 * since recordGrades() already performs an upsert.
 ******************************************************************************/

const updateGrades = async (gradeData) => {

    return await recordGrades(gradeData);

};

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Returns a student's grades for the current academic period.
 ******************************************************************************/

const getStudentGrades = async (
    studentId,
    session = null
) => {

    if (!session) {
        const academicPeriod = await getAcademicPeriod();
        session = academicPeriod.session.sessionName;
    }

    return await gradeModel.find({
        studentId,
        session
    });

};

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Returns grades for every student in a class
 * for the current academic session.
 ******************************************************************************/

const getClassGrades = async (className, session = null) => {
    if (!session) {
        const academicPeriod = await getAcademicPeriod();
        session = academicPeriod.session.sessionName;
    }

    return await gradeModel.find({
        className,
        session
    });

};

/******************************************************************************
 * PRIVATE FUNCTION
 *
 * PURPOSE
 * -------
 * Calculates subject positions for every student in a class.
 ******************************************************************************/

const calculateSubjectPositions = async (className, subjectId, session, term) => {

    // Determine which term field to use

    let termField = "";

    switch (term.toLowerCase()) {

        case "first term":
            termField = "firstTerm";
            break;

        case "second term":
            termField = "secondTerm";
            break;

        case "third term":
            termField = "thirdTerm";
            break;

    }

    // Retrieve grades

    const grades = await gradeModel.find({
        className, session, [`${termField}.subjectId`]: subjectId

    });

    // Sort descending

    grades.sort((a, b) => b[termField].totalScore - a[termField].totalScore

    );

    // Assign positions

    let currentPosition = 1;

    for (let i = 0; i < grades.length; i++) {

        if (
            i > 0 &&
            grades[i][termField].totalScore !==
            grades[i - 1][termField].totalScore
        ) {
            currentPosition = i + 1;
        }

        grades[i][termField].position = currentPosition;

        await grades[i].save();
    }


};

/******************************************************************************
 * PRIVATE FUNCTION
 *
 * PURPOSE
 * -------
 * Determines whether a student has scores for every subject.
 ******************************************************************************/

const checkStudentCompletion = async (studentId, className, session, term) => {
    // console.log("body",studentId, className,session, term)

    // Subjects assigned to class

    const subjects = await classService.getSubjectsByClass(
        className
    );
    // console.log('checkStudentCompletion', subjects)
    // Student grades

    const grades = await gradeModel.find({

        studentId,
        className,
        session

    });

    let completed = 0;
    // console.log("grades",await gradeModel.find({}))
    for (const grade of grades) {

        let subject = null;

        switch (term.toLowerCase()) {

            case "first term":

                subject = grade.subjectId;
                // console.log("first term subject:", subject)
                break;

            case "second term":

                subject = grade.subjectId;
                // console.log("second term subject:", subject)

                break;

            case "third term":

                subject = grade.subjectId;
                // console.log("3rd term subject:", subject)

                break;

        }

        if (

            subject &&
            subjects.includes(subject)

        ) {

            // console.log(subject)
            completed++;

        }
        // console.log("Grade subject:", grade.subjectId);
        // console.log("Current subject:", subject);
        // console.log("Class subjects:", subjects);
        // console.log("Includes:", subjects.includes(subject));

    }
    // console.log(subjects);
    // console.log(completed);
    // console.log(subjects.length);
    // Student finished?
    // console.log("Grade Service  Student Completion: Student Completed")
    // console.log("Will Generate:", completed === subjects.length);
    if (completed === subjects.length) {

        await triggerResultGeneration(

            studentId,
            className,
            session,
            term

        );

    }

};

/******************************************************************************
 * PRIVATE FUNCTION
 ******************************************************************************/

const triggerResultGeneration = async (studentId, className, session, term) => {
    // console.log(" trigger result got here")
    const resultService = require("./resultService");

    await resultService.generateStudentResult(studentId, className, session, term);

    await checkClassCompletion(
        className,
        session,
        term

    );

};

/******************************************************************************
 * PRIVATE FUNCTION
 ******************************************************************************/

const checkClassCompletion = async (className, session, term) => {

    const resultService = require("./resultService");
    const students = await classService.getStudentsByClassName(
        className
    );

    let completedStudents = 0;

    for (const student of students) {

        const result =
            await resultService.getStudentResult(
                student.studentId,
                session,
                term
            );
        if (result) {
            completedStudents++;
        }
    }

    if (completedStudents === students.length) {
        let termKey;

        await classService.updateResultStatus(
            className,
            termKey,
            true
        );


        switch (term.toLowerCase()) {

            case "first term":
                termKey = "firstTerm";
                break;

            case "second term":
                termKey = "secondTerm";
                break;

            case "third term":
                termKey = "thirdTerm";
                break;
        }

        if (

            term.toLowerCase() ===

            "third term"

        ) {

            const promotionService =

                require("./promotionService");

            await promotionService.promoteClass(

                className,

                session

            );
        }
    }
};

/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Returns grades for a subject using the active session and term.
 ******************************************************************************/

const getGradesBySubject = async (subjectId, className) => {

    const { session, term } = await getAcademicPeriod();

    return await getGradesBySubjectByTerm(

        subjectId,

        className,

        session.sessionName,

        term.termName

    );

};
/******************************************************************************
 * PUBLIC FUNCTION
 *
 * PURPOSE
 * -------
 * Returns grades for a subject for a specific session and term.
 ******************************************************************************/

const getGradesBySubjectByTerm = async (subjectId, className, session, term) => {

    const termField = getTermField(term);

    const grades = await gradeModel.find({
        className,
        session,
        [`${termField}.subjectId`]: subjectId
    });

    if (!grades.length) {

        return [];

    }

    const studentIds = grades.map(g => g.studentId);

    const students = await studentModel.find({

        studentId: {

            $in: studentIds

        }

    });

    const result = grades.map(grade => {

        const subject = grade[termField];

        const student = students.find(

            s => s.studentId === grade.studentId

        );

        return {

            studentId: grade.studentId,

            studentName:

                `${student?.surName || ""} ${student?.otherNames || ""}`.trim(),

            firstCa: subject.firstCa,

            secondCa: subject.secondCa,

            continuousAssessment: subject.continuousAssessment,

            exam: subject.exam,

            total: subject.totalScore,

            grade: subject.grade,

            remark: subject.teacherRemark,

            position: subject.position

        };

    });

    result.sort((a, b) => b.total - a.total);
    // console.log(result)

    return result;

};

module.exports = {
    recordGrades,
    updateGrades,
    getStudentGrades,
    getClassGrades,
    getGradesBySubject,
    getGradesBySubjectByTerm,
};