const incomeModel = require('../models/income.model')
const getAcademicPeriod = require('../utils/academicUtils')
const cashbookModel = require('../models/cashbook.model')

const getIncome = async (req, res) => {
    try {
        const getIncomes = await incomeModel.find().sort({ date: -1 });
        res.send({ status: true, getIncomes });
    } catch (error) {
        req.send({
            status: false,
            message: error.message
        })
    }
}

const addIncome = async (req, res) => {
    try {
        const {
            source,
            description,
            amount,
            paymentMethod,
            recordedBy,
            account
        } = req.body;

        // console.log(req.body)

        // const { session, term } = await getAcademicPeriod();

        const amountNumber = Number(amount);
        // console.log(amountNumber)
        if (isNaN(amountNumber) || amountNumber <= 0) {
            return res.send({
                status: false,
                message: "Invalid amount"
            });
        }

        // Get the latest cashbook record
        const lastRecord = await cashbookModel
            .findOne()
            .sort({ createdAt: -1 });

        const lastBalance = lastRecord ? Number(lastRecord.balance) : 0;

        // Income increases the balance
        const newBalance = lastBalance + amountNumber;

        const incomeRef = `INC-${Date.now()}`;

        const incomeObj = {
            incomeRef,
            source,
            description,
            amount: amountNumber,
            paymentMethod,
            recordedBy,
            dateReceived: new Date()
        };

        // Save income
        const form = new incomeModel(incomeObj);
        await form.save();

        // Save cashbook transaction
        const cashbookObj = {
            date: new Date(),
            description,
            reference: incomeRef,
            account: source,
            type: "Income",
            credit: amountNumber,
            balance: newBalance,
            paymentMethod,
            recordedBy
        };
        // console.log('',amountNumber);
        
        const cashbookForm = new cashbookModel(cashbookObj);
        await cashbookForm.save();

         // 6. Get ALL cashbook records in chronological order(relating to the establishment of dates of past events:)
        const cashbooks = await cashbookModel
            .find()
            .sort({ date: 1, _id: 1 });

        // 7. Recalculate all balances
        let runningBalance = 0;

        for (const record of cashbooks) {

            // Opening balance before this transaction
            record.openingBalance = runningBalance;

            // Income adds money
            if (record.type === "Income") {
                runningBalance += Number(record.credit || 0);
            }

            // Expense removes money
            else if (record.type === "Expense") {
                runningBalance -= Number(record.debit || 0);
            }

            // Balance after this transaction
            record.balance = runningBalance;

            console.log('record after saving cashbook',record.balance)

            await record.save();
        }

        res.send({
            status: true,
            message: "Income Added Successfully"
        });

    } catch (error) {
        console.log(error);

        res.send({
            status: false,
            message: error.message
        });
    }
};
const deleteIncome = async (req, res) => {
    try {
        const { incomeRef } = req.params;
        await incomeModel.deleteOne({ incomeRef }).then(() => {
            res.send({ status: true, message: 'Income Deleted Successfully' });
        })
    } catch (error) {
        res.send({ status: false, message: error.message });
    }
}
const updateIncome = async (req, res) => {
    try {
        const {
            incomeRef,
            source,
            description,
            amount,
            paymentMethod,
        } = req.body;

        // console.log(req.body)
        // Get the academic period
        // const { session, term } = await getAcademicPeriod();

        // 1. Find the income record
        const income = await incomeModel.findOne({ incomeRef });
        // console.log(income)
        if (!income) {
            return res.send({
                status: false,
                message: "Income record not found"
            });
        }

        // 2. Get old and new amounts
        const oldAmount = Number(income.amount);
        const newAmount = Number(amount);

        if (isNaN(newAmount) || newAmount < 0) {
            return res.status(400).send({
                status: false,
                message: "Invalid amount"
            });
        }

        // 3. Find the corresponding cashbook transaction
        const cashbook = await cashbookModel.findOne({
            reference: incomeRef,
            type: "Income"
        });

        if (!cashbook) {
            return res.status(404).send({
                status: false,
                message: "Cashbook record not found"
            });
        }

        // 4. Update the income record
        income.source = source;
        income.description = description;
        income.amount = newAmount;
        income.paymentMethod = paymentMethod;
        // income.recordedBy = recordedBy;
        // income.account = account;
        // income.session = session;
        // income.term = term;

        await income.save();

        // 5. Update the cashbook transaction
        cashbook.description = description;
        // cashbook.account = account;
        cashbook.credit = newAmount;
        cashbook.debit = 0;
        cashbook.paymentMethod = paymentMethod;
        // cashbook.recordedBy = recordedBy;

        await cashbook.save();

        // 6. Get ALL cashbook records in chronological order(relating to the establishment of dates of past events:)
        const cashbooks = await cashbookModel
            .find()
            .sort({ date: 1, _id: 1 });

        // 7. Recalculate all balances
        let runningBalance = 0;

        for (const record of cashbooks) {

            // Opening balance before this transaction
            record.openingBalance = runningBalance;

            // Income adds money
            if (record.type === "Income") {
                runningBalance += Number(record.debit || 0);
            }

            // Expense removes money
            else if (record.type === "Expense") {
                runningBalance -= Number(record.credit || 0);
            }

            // Balance after this transaction
            record.balance = runningBalance;

            await record.save();
        }

        return res.status(200).send({
            status: true,
            message: "Income updated successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
};

const getIncomeByRef = async (req, res) => {
    const { incomeRef } = req.params;
    const income = await incomeModel.findOne({ incomeRef });
    if (income) {
        res.send({ status: true, income })
    }
    else {
        res.send({ status: false, message: 'Not Found' })
    }
}
const findBySource = async (req, res) => {
    const { source } = req.query;

    const incomes = await incomeModel.find({ source });

    res.send({
        status: true,
        incomes
    })
}
const findSources = async (req, res) => {
    try {
        const incomes = await incomeModel.find();

        const sourcesArray = [
            ...new Set(incomes.map(income => income.source))
        ]

        // console.log(sourcesArray)

        res.send({
            status: true,
            sources: sourcesArray
        })

    } catch (error) {
        res.send({
            status: false,
            message: error.message
        })
    }
}
module.exports = {
    getIncome,
    addIncome,
    deleteIncome,
    updateIncome,
    getIncomeByRef,
    findBySource,
    findSources
}
