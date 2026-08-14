const paymentModel = require('../models/payment.model')
  // Get Transactions By Student ID
const getTransactionByStudentId = async (req, res) => {
    try {
      const { studentId } = req.body;
  
      if (!studentId) {
        return res.status(400).send({ status: false, message: "Student ID is required" });
      }
  
      const transactions = await paymentModel.find({ studentId });
  
      if (transactions.length === 0) {
        return res.send({ status: false, message: "No transactions found for this student" });
      }
      // console.log(transactions)
      res.send({ status: true, transactions });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({ status: false, message: "Server Error" });
    }
};
  
module.exports={
    getTransactionByStudentId
}