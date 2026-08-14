/******************************************************************************
 *
 * promotionService.js
 *
 * Handles automatic promotion after Third Term.
 *
 ******************************************************************************/

const studentModel = require("../models/student.model");
const resultModel = require("../models/result.model");

const classService = require("./classService");

const {
    getNextClass,
    isGraduatingClass
} = require("../utils/promotionUtils");

const graduateStudent = async (student, session) => {

    await studentModel.updateOne(

        {
            studentId: student.studentId
        },

        {
            $set: {
                status: "Graduated"
            },

            $push: {

                promotionHistory: {

                    from: student.classAdmittedTo,

                    to: "Graduated",

                    session,

                    promotedAt: new Date()

                }

            }

        }

    );

    await resultModel.updateMany(

        {
            studentId: student.studentId,
            session
        },

        {
            $set: {

                graduated: true,

                promoted: false,

                promotionProcessed: true

            }

        }

    );

};

const promoteStudent = async (

    student,

    nextClass,

    session

) => {

    await classService.removeStudentFromClass(

        student.classAdmittedTo,

        student.studentId

    );

    await classService.addStudentToClass(

        nextClass,

        student.studentId

    );

    await studentModel.updateOne(

        {

            studentId: student.studentId

        },

        {

            $set: {

                classAdmittedTo: nextClass,

                previousClass: student.classAdmittedTo,

                status: "Admitted"

            },

            $push: {

                promotionHistory: {

                    from: student.classAdmittedTo,

                    to: nextClass,

                    session,

                    promotedAt: new Date()

                }

            }

        }

    );

    await resultModel.updateMany(

        {

            studentId: student.studentId,

            session

        },

        {

            $set: {

                promoted: true,

                promotionProcessed: true

            }

        }

    );

};

const repeatStudent = async (

    student,

    session

) => {

    await studentModel.updateOne(

        {

            studentId: student.studentId

        },

        {

            $set: {

                status: "Admitted"

            },

            $push: {

                promotionHistory: {

                    from: student.classAdmittedTo,

                    to: student.classAdmittedTo,

                    session,

                    promotedAt: new Date(),

                    status: "Repeated"

                }

            }

        }

    );

    await resultModel.updateMany(

        {

            studentId: student.studentId,

            session

        },

        {

            $set: {

                promoted: false,

                promotionProcessed: true

            }

        }

    );

};

const promoteClass = async (

    className,

    session

) => {

    const students = await classService.getStudentsByClassName(

        className

    );

    for (const student of students) {

        const result = await resultModel.findOne({

            studentId: student.studentId,

            session,

            term: "Third Term"

        });

        if (!result) {

            continue;

        }

        if (result.promotionProcessed) {

            continue;

        }

        /******************************************
         * Student failed
         ******************************************/

        if (result.average < 40) {

            await repeatStudent(

                student,

                session

            );

            continue;

        }

        /******************************************
         * SS3 graduates
         ******************************************/

        if (isGraduatingClass(className)) {

            await graduateStudent(

                student,

                session

            );

            continue;

        }

        /******************************************
         * Promote student
         ******************************************/

        const nextClass = getNextClass(className);

        if (!nextClass) {

            throw new Error(

                `No promotion path found for ${className}`

            );

        }

        await promoteStudent(

            student,

            nextClass,

            session

        );

    }

    await classService.updatePromotionHistory(

        className,

        session

    );

};

module.exports = {

    promoteClass

};