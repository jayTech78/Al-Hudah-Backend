const financeModel = require("../models/finance.model");
const paymentModel = require("../models/payment.model");

const addFinance = async (req, res) => {
  const { amountWithdrawn, withdrawnFor } = req.body;
  const financeId = Math.floor(Math.random() * 10e5);
  
  const financeObj = {
    financeId,
    amountWithdrawn,
    withdrawnFor,
    dateWithdrawn: Date.now(),
  };
  let form = await new financeModel(financeObj);
  form
    .save(form)
    .then(() => {
      res.send({ status: true, message: "Fianance Added Successfully!!!" });
    })
    .catch((err) => {
      res.send({
        status: false,
        message: "There was an error" + err,
      });
    });
};
const getFinances = async (req, res) => {
  const finances = await financeModel.find();
  if (finances) {
    res.send({ status: true, finances });
  } else {
    res.send({ status: false, message: "Empty Finanaces" });
  }
};
const getFinancesByDate = async (req, res) => {
  try {
    const { dateWithdrawn } = req.body;
    const finances = await financeModel.find({ dateWithdrawn });
    if (finances) {
      res.send({ status: true, finances });
    }
  } catch (error) {}
};
const getFinancesByWithdrawnFor = async (req, res) => {
  const { withdrawnFor } = req.body;
  const finances = await financeModel.find({ withdrawnFor });
  return finances;
};
const getAccounts = async (req, res) => {
    try {
      const result = await paymentModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: {
                $toDouble: "$amountPaid" // Convert string to number
              }
            }
          }
        }
      ]);
  
      const totalAmount = result[0]?.totalAmount || 0;
  
      const withdrawals = await financeModel.find();
      const currentBalance = totalAmount - withdrawals.reduce((sum, item) => sum + Number(item.amountWithdrawn), 0);
      const totalWithdrawals = withdrawals.reduce(
        (sum, item) => sum + Number(item.amountWithdrawn), // Ensure conversion here too
        0
      );
  
      res.send({ status: true, currentBalance, totalWithdrawals });
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).send({ status: false, message: "Server Error" });
    }
  };
  
  
  
module.exports = {
  addFinance,
  getFinances,
  getFinancesByWithdrawnFor,
  getFinancesByDate,
  getAccounts,
};
