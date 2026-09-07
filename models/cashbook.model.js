const mongoose = require("mongoose");

const cashbookSchema = new mongoose.Schema({
    date:{
        type:Date,
        default: Date.now
    },
    description:{
        type: String,
        required:true
    },
    reference:{
        type: String
    },
    account:{
        type: String,
        required: true
    },
    type:{
        type: String,
        enum: ['Income', 'Expense'],
        required: true
    },
    debit:{
        type:Number,
        default: 0
    },
    credit:{
        type:Number,
        default:0
    },
    balance: {
        type:Number,
        default: 0
    },
    paymentMethod:{
        type:String,
        enum: ['Cash','Bank', 'Transfer', 'Card', 'Online']
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    openingBalance:{
        type:Number,
    },
},
{
    timestamp: true
}
);

const Cashbook = mongoose.model('Cashbook', cashbookSchema)
module.exports = Cashbook