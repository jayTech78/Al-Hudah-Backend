const cashbookModel = require('../models/cashbook.model')

const getCashbook = async (req, res) => {
    try {
        const entries = await cashbookModel.find()
        // .sort({ date: -1 });
        // console.log(entries)
        res.send({
            status: true, entries
        })
    } catch (error) {
        res.send({
            status: false,
            message: error.message
        });
    }
}
module.exports={
    getCashbook
}