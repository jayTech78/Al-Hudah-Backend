/**************************************************************************
 * FILE: positionUtils.js
 *
 * PURPOSE
 * -------
 * Calculates ranking/positions based on scores.
 *
 * RESPONSIBILITIES
 * ----------------
 * ✔ Subject Position
 * ✔ Overall Position
 *
 * USED BY
 * -------
 * ✔ gradeService.js
 * ✔ resultService.js
 *
 * DOES NOT
 * ---------
 * ✘ Save positions to the database
 *
 * This utility only calculates rankings.
 **************************************************************************/

/**************************************************************************
 * FUNCTION FLOW
 *
 * Students
 *
 *      │
 *      ▼
 *
 * Sort Highest → Lowest
 *
 *      │
 *      ▼
 *
 * Handle Equal Scores (Tie)
 *
 *      │
 *      ▼
 *
 * Assign Positions
 *
 *      │
 *      ▼
 *
 * Return Updated Array
 **************************************************************************/

/**************************************************************************
 * FUNCTION: calculatePositions()
 *
 * PARAMETERS
 * ----------
 * students   : Array
 * scoreField : String
 *
 * EXAMPLE
 * -------
 * students
 *
 * [
 *   { name: "John", score: 95 },
 *   { name: "Mary", score: 95 },
 *   { name: "David", score: 90 }
 * ]
 *
 * RESULT
 * ------
 * John   -> 1
 * Mary   -> 1
 * David  -> 3
 **************************************************************************/

const calculatePositions = (students, scoreField) => {

    /**********************************************************************
     * STEP 1
     * Sort students from highest score to lowest score.
     **********************************************************************/

    students.sort(

        (a, b) => b[scoreField] - a[scoreField]

    );

    /**********************************************************************
     * STEP 2
     * Start assigning positions.
     **********************************************************************/

    let currentPosition = 1;

    /**********************************************************************
     * STEP 3
     * Loop through every student.
     **********************************************************************/

    for (let i = 0; i < students.length; i++) {

        /******************************************************************
         * If the current student's score is different from the previous
         * student's score, assign a new position.
         *
         * If the scores are equal, both students share the same position.
         ******************************************************************/

        if (

            i > 0 &&

            students[i][scoreField] !== students[i - 1][scoreField]

        ) {

            currentPosition = i + 1;

        }

        /******************************************************************
         * Save the calculated position.
         ******************************************************************/

        students[i].position = currentPosition;

    }

    /**********************************************************************
     * STEP 4
     * Return the updated student list.
     **********************************************************************/

    return students;

};

/**************************************************************************
 * EXPORTS
 **************************************************************************/

module.exports = {

    calculatePositions

};