const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        classId: {
            type: String,
            required: true,
        },

        className: {
            type: String,
            required: true,
            unique: true,
        },

        classTeacherId: String,

        classTeacher:String,

        students: [String],

        classSubjects: [String],

        classFees: [String],

        classBooks: [String],

        isApproved: {
            type: Boolean,
            default: false,
        },

        resultStatus: {
            firstTerm: {
                finalized: {
                    type: Boolean,
                    default: false,
                },
                finalizedAt: Date
            },

            secondTerm: {
                finalized: {
                    type: Boolean,
                    default: false,
                },
                finalizedAt: Date
            },

            thirdTerm: {
                finalized: {
                    type: Boolean,
                    default: false,
                },
                finalizedAt: Date
            }
        },

        promotion: {

            lastPromotedSession: String,

            promotedAt: Date,

            history: [
                {
                    session: String,

                    fromClass: String,

                    toClass: String,

                    promotedAt: Date
                }
            ]
        }

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Class", classSchema);