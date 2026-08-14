/**************************************************************************
 * FILE: gradeUtils.js
 *
 * PURPOSE
 * -------
 * This file contains helper functions used to calculate students'
 * subject scores.
 *
 * RESPONSIBILITIES
 * ----------------
 * ✔ Calculate Continuous Assessment (CA)
 * ✔ Calculate Total Score
 * ✔ Calculate Grade (A, B2, B3...)
 * ✔ Calculate Teacher's Remark
 *
 * USED BY
 * -------
 * ✔ gradeService.js
 *
 * DOES NOT
 * ---------
 * ✘ Save anything to the database
 * ✘ Know anything about students
 * ✘ Know anything about classes
 * ✘ Know anything about sessions or terms
 *
 * Think of this file as a simple calculator.
 **************************************************************************/

/**************************************************************************
 * FUNCTION: calculateContinuousAssessment()
 *
 * PURPOSE
 * -------
 * Calculates the student's Continuous Assessment (CA).
 *
 * FORMULA
 * -------
 * CA = First CA + Second CA
 *
 * EXAMPLE
 * -------
 * First CA  = 18
 * Second CA = 20
 *
 * Result
 * ------
 * CA = 38
 **************************************************************************/

const calculateContinuousAssessment = (
    firstCa = 0,
    secondCa = 0
) => {

    return Number(firstCa) + Number(secondCa);

};

/**************************************************************************
 * FUNCTION: calculateTotalScore()
 *
 * PURPOSE
 * -------
 * Calculates the student's total score.
 *
 * FORMULA
 * -------
 * Total Score = Continuous Assessment + Exam
 *
 * EXAMPLE
 * -------
 * CA   = 38
 * Exam = 52
 *
 * Result
 * ------
 * Total Score = 90
 **************************************************************************/

const calculateTotalScore = (continuousAssessment = 0, exam = 0) => {

    return Number(continuousAssessment) + Number(exam);

};

/**************************************************************************
 * FUNCTION: calculateGrade()
 *
 * PURPOSE
 * -------
 * Converts a student's total score into a grade.
 *
 * GRADING SCALE
 * -------------
 * 75 - 100 = A
 * 70 - 74  = B2
 * 65 - 69  = B3
 * 60 - 64  = C4
 * 55 - 59  = C5
 * 50 - 54  = C6
 * 45 - 49  = D7
 * 40 - 44  = E8
 *  0 - 39  = F9
 **************************************************************************/

const calculateGrade = (score) => {

    if (score >= 75) return "A";
    if (score >= 70) return "B2";
    if (score >= 65) return "B3";
    if (score >= 60) return "C4";
    if (score >= 55) return "C5";
    if (score >= 50) return "C6";
    if (score >= 45) return "D7";
    if (score >= 40) return "E8";

    return "F9";

};

/**************************************************************************
 * FUNCTION: calculateRemark()
 *
 * PURPOSE
 * -------
 * Converts a student's total score into a teacher's remark.
 *
 * REMARK SCALE
 * ------------
 * A  = Excellent
 * B2 = Very Good
 * B3 = Very Good
 * C4 = Good
 * C5 = Good
 * C6 = Good
 * D7 = Fair
 * E8 = Average
 * F9 = Fail
 **************************************************************************/

const calculateRemark = (score) => {

    if (score >= 75) return "Excellent";
    if (score >= 65) return "Very Good";
    if (score >= 50) return "Good";
    if (score >= 45) return "Fair";
    if (score >= 40) return "Average";

    return "Fail";

};

/**************************************************************************
 * EXPORTS
 **************************************************************************/

module.exports = {
    calculateContinuousAssessment,
    calculateTotalScore,
    calculateGrade,
    calculateRemark
};