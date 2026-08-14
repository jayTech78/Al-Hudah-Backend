const feesModel = require('../models/fees.model')
const studentModel = require('../models/student.model')
const addFee = (req, res) => {
    const { fee, price } = req.body
    const feeId = Math.floor(Math.random() * 10e5)
    const feeObj = {
        feeId,
        fee,
        price
    }
    let form = new feesModel(feeObj)
    form.save()
        .then(() => {
            res.send({ status: true, message: 'Fee Added Successfully' })
        })
        .catch((error) => {
            res.send({ status: true, message: 'There was an error' + error })
        })
}
const findFeeById = async (req, res) => {
    const { feeId } = req.body
    const findFee = await feesModel.findOne({ feeId })
    return (findFee)
}
const updateFee = async (req, res) => {
    const {feeId} = req.body
    await feesModel.findOneAndUpdate({feeId},
        {
            fee : req.body.fee,
            price: req.body.price
        }
    )
        .then((fee) => {
            // console.log(fee)
            if (fee) {
                res.send({ status: true, message: 'Update Succesfully' })
            }
            else {
                res.send({ status: false, message: 'Can not Update' })
            }
        }).catch((error) => {
            res.send({ status: true, message: error })
        })
}
const deletefee = async (req, res) => {
    const { feeId } = req.body
   await feesModel.findOneAndDelete({ feeId }).then(() => {
    res.send({ status: true, message: 'Deleted Successfully!!!' })
});
}
const getFees = async (req, res) => {
    const fees = await feesModel.find()
    if (fees) {
        res.send({ status: true, fees })
    }
    else {
        req.send({ status: false, message: 'There was an error' })
    }
}
const getAdmissionFee = async (req, res) => {
    const { parent_Id } = req.body; // Ensure the name here matches what's sent from the frontend
    // console.log("Received parent ID:", parent_Id);
    
    try {
        const students = await studentModel.find({ parentId: parent_Id });
        // console.log("Students found:", students);

        if (students.length === 0) {
            // If no students are found, return only 'Admission Form' fees
            const admissionFees = await feesModel.find({ fee: 'Admission Form' });
            res.send({ fees: admissionFees });
        } else {
            // If students are found, return all fees
            const allFees = await feesModel.find();
            res.send({ fees: allFees });
        }
    } catch (error) {
        console.error("Error fetching fees:", error.message);
        res.status(500).send({ error: "An error occurred while fetching fees." });
    }
};

module.exports = {getAdmissionFee, getFees, addFee, findFeeById, updateFee, deletefee }