const expenseModel = require('../models/expense.model')
const getAcademicPeriod = require('../utils/academicUtils')
const cashbookModel = require('../models/cashbook.model')

const getExpense = async (req, res) => {
    try {
        const getExpenses = await expenseModel.find().sort({ date: -1 });
        res.send({ status: true, getExpenses });
    } catch (error) {
        req.send({
            status: false,
            message: error.message
        })
    }
}

const addExpense = async (req, res) => {
    try {
        const { description, amount, paymentMethod, category, recordedBy } = req.body

        const amountNumber = Number(amount);
        // console.log(amountNumber)
        if (isNaN(amountNumber) || amountNumber <= 0) {
            return res.send({
                status: false,
                message: "Invalid amount"
            });
        }

        const lastRecord = await cashbookModel.findOne().sort({ createdAt: -1 });

        const lastBalance = lastRecord ? Number(lastRecord.balance) : 0;

        const newBalance = lastBalance - amountNumber;

        const expenseRef = Math.floor(Math.random() * 1000);

        const expenseObj = {
            expenseRef,
            category,
            description,
            amount,
            date: new Date(),
            paymentMethod,
            // recordedBy,
            // approvedBy,
        }

        const form = new expenseModel(expenseObj)
        await form.save()

        const cashbookObj = {
            date: new Date(),
            description,
            reference: expenseRef,
            type: 'Expense',
            account: category.trim(),
            debit: amount,
            balance: newBalance,
            paymentMethod,
            recordedBy
        }
        const cashbookForm = new cashbookModel(cashbookObj)
        await cashbookForm.save();

        // 6. Get ALL cashbook records in chronological order(relating to the establishment of dates of past events:)
        const cashbooks = await cashbookModel
            .find()
            .sort({ date: 1, _id: 1 });

        // 7. Recalculate all balances
        let runningBalance = 0;

        for (const record of cashbooks) {
            if(record.openingBalance === 0)
            {
                record.openingBalance = Number(runningBalance - amountNumber)
            }
            record.openingBalance = runningBalance;
            // Money coming in
            if (record.type === "Income") {
                runningBalance += Number(record.credit || 0);
            }

            // Money going out
            if (record.type === "Expense") {
                runningBalance -= Number(record.debit || 0);
            }

            record.balance = runningBalance;

            await record.save();
        }

        res.send({ status: true, message: 'Expense Added Successfully' });

    } catch (error) {
        console.log(error);
        res.send({ status: false, message: error.message });
    }
}
const deleteExpense = async (req, res) => {
    try {
        const { expenseRef } = req.params;
        await expenseModel.deleteOne({ expenseRef }).then(() => {
            res.send({ status: true, message: 'Expense Deleted Successfully' });
        })
    } catch (error) {
        res.send({ status: false, message: error.message });
    }
}
const updateExpense = async (req, res) => {
    try {
        const { expenseRef, description, amount, paymentMethod, category, recordedBy } = req.body

        // Get the academic period
        // const { session, term } = await getAcademicPeriod();

        // 1. Find the expense record
        const expense = await expenseModel.findOne({ expenseRef });
        // console.log(req.body)
        if (!expense) {
            return res.send({
                status: false,
                message: "Expense record not found"
            });
        }

        // 2. Get old and new amounts
        const oldAmount = Number(expense.amount);
        const newAmount = Number(amount);

        if (isNaN(newAmount) || newAmount < 0) {
            return res.send({
                status: false,
                message: "Invalid amount"
            });
        }

        // 3. Find the corresponding cashbook transaction
        const cashbook = await cashbookModel.findOne({
            reference: expenseRef,
            type: "Expense"
        });

        if (!cashbook) {
            return res.send({
                status: false,
                message: "Cashbook record not found"
            });
        }

        // { description, amount, paymentMethod, category, recordedBy } = req.body

        // 4. Update the expense record
        expense.category = category;
        expense.description = description;
        expense.amount = newAmount;
        expense.paymentMethod = paymentMethod;
        expense.recordedBy = recordedBy;

        await expense.save();

        // 5. Update the cashbook transaction
        cashbook.description = description;
        cashbook.account = category;
        cashbook.debit = newAmount;
        cashbook.credit = 0;
        cashbook.paymentMethod = paymentMethod;
        cashbook.recordedBy = recordedBy;

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

            // Expense adds money
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
            message: "Expense updated successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}
const getExpenseByRef = async (req, res) => {
    const { expenseRef } = req.params;
    const expense = await expenseModel.findOne({ expenseRef });
    if (expense) {
        res.send({ status: true, expense })
    }
    else {
        res.send({ status: false, message: 'Not Found' })
    }
}
const findByCategory = async (req, res) => {
    try {
        // console.log(req.query);

        const { category } = req.query;

        // console.log("Category:", category);

        const expenses = await expenseModel
            .find({ category })

        // console.log(expenses)
        res.send({
            status: true,
            expenses
        });

    } catch (error) {
        console.log(error);

        res.send({
            status: false,
            message: error.message
        });
    }
};
const findCategories = async (req, res) => {
    try {
        const expenses = await expenseModel.find();

        const categoryArray = [
            ...new Set(expenses.map(expense => expense.category))
        ];

        // console.log(categoryArray);

        res.send({
            status: true,
            categories: categoryArray
        });

    } catch (error) {
        console.log(error);

        res.send({
            status: false,
            message: error.message
        });
    }
};

module.exports = {
    getExpense,
    addExpense,
    deleteExpense,
    updateExpense,
    getExpenseByRef,
    findByCategory,
    findCategories
}
