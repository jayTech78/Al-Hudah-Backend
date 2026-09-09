const paymentModel = require("../models/payment.model");
const financeModel = require("../models/finance.model");
const studentModel = require("../models/student.model");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const path = require("path");
const axios = require("axios"); // Import axios
require("dotenv").config();
const classModel = require("../models/class.model");
const feesModel = require("../models/fees.model");
const bookModel = require("../models/book.model");
const termModel = require("../models/term.model");
const sessionModel = require("../models/session.model");
const cashbookModel = require("../models/cashbook.model");

// Helper function to generate random string
const get_random_string = (length) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
// Verify payment using Paystack
const verifyPayment = async (req, response) => {
  const { reference } = req.body;
  // console.log(reference);

  try {
    const res = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    if (res.status === 200 && res.data.data.status === "success") {
      let ref = get_random_string(6); // Generate bookingRef here
      // console.log("Booking Reference:", ref);

      response.send({ status: true, message: "Transaction Verified", ref });
    } else {
      response.send({ status: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error in verification:", error.message);
    response.send({
      status: false,
      message: "Error verifying payment: " + error.message,
    });
  }
};

// Add payment to the database and send a receipt
const addPayment = async (req, res) => {
  try {
    const {
      Price,
      email,
      fullName,
      parentId,
      studentName,
      studentId,
      selectedItems,
    } = req.body;
    let studentId = ''
    // console.log(req.body);
    if (!parentId || !Price || !selectedItems || selectedItems.length === 0) {
      return res.send({
        status: false,
        message: "Missing required fields",
      });
    }

    // // gets the student with the parentId and the student name
    // const foundStudent = await studentModel.findOne({
    //   parentId, studentName
    // })

    // if(!foundStudent)
    // {
    //   res.send({status:false, message: 'student nt found'})
    // }
    
    // foundStudent.studentId = studentId;

    const lastRecord = await cashbookModel.findOne().sort({ createdAt: -1 });

    const lastBalance = lastRecord ? Number(lastRecord.balance) : 0;

    // Income increases the balance
    const newBalance = lastBalance + Price;

    // Active session & term
    const sessionAndTerm = await termModel.findOne({ status: "Active" });

    // One receipt reference for the whole transaction
    const bookingRef = get_random_string(6);

    // const studentId = await generateId();

    // Save every selected item as its own payment document
    for (const item of selectedItems) {
      console.log(item)
      const paymentObj = {
        paymentRef: bookingRef,
        amountPaid: Number(item.price),
        email,
        paidFor: item.name || item.paidFor,
        fullName,
        studentName,
        parentId,
        studentId,
        datePaid: new Date(),
        isApproved: false,
        term: sessionAndTerm?.termName,
        session: sessionAndTerm?.session,
      };

      // Save cashbook transaction
      const cashbookObj = {
        date: new Date(),
        description: item.name,
        reference: bookingRef,
        account: "payments",
        type: "Income",
        credit: item.price,
        debit: 0,
        balance: newBalance,
        paymentMethod: 'Online',
        recordedBy: 'Parent',
      };

      console.log(paymentObj);

      const cashbookForm = new cashbookModel(cashbookObj);
      await cashbookForm.save();

      // 6. Get ALL cashbook records in chronological order(relating to the establishment of dates of past events:)
      const cashbooks = await cashbookModel.find().sort({ date: 1, _id: 1 });

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

        await record.save();
      }

      const payment = new paymentModel(paymentObj);
      await payment.save();
    }

    // Receipt for the whole transaction
    const receiptObj = {
      paymentRef: bookingRef,
      amountPaid: Price,
      email,
      fullName,
      studentName,
      parentId,
      studentId,
      items: selectedItems,
      datePaid: new Date(),
      term: sessionAndTerm?.termName,
      session: sessionAndTerm?.session,
    };

    const receiptPath = generateReceipt(receiptObj);
    await sendReceiptEmail(receiptObj, receiptPath);

    return res.send({
      status: true,
      bookingRef,
      message: "Payment Successful! Receipt has been sent to your e-mail",
    });
  } catch (error) {
    console.error(error);

    return res.send({
      status: false,
      message: error.message,
    });
  }
};

// Generate PDF receipt
const generateReceipt = (paymentObj) => {
  const doc = new PDFDocument();
  const receiptDir = path.join(__dirname, "receipts");

  if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir);
  }

  const receiptPath = path.join(
    receiptDir,
    `receipt_${paymentObj.paymentRef}.pdf`,
  );

  // Path to the school's logo image (customize this path)
  const logoPath = path.join(__dirname, "../logo-removebg-preview.png");

  // Pipe the PDF into the file
  doc.pipe(fs.createWriteStream(receiptPath));

  // Styling and layout for receipt
  // Add the school's logo at the top
  doc.image(logoPath, {
    fit: [80, 80], // Adjust logo size
    align: "center",
  });

  // Add school name
  doc.fontSize(22).text("Al-Hudah Group Of Schools", { align: "center" });

  // Add a subtitle (e.g., Checkout Receipt)
  doc.moveDown(0.5);
  doc.fontSize(18).text("Payment Receipt", { align: "center" });

  // Add line separator (for a cleaner design)
  doc.moveDown(0.5);
  doc
    .strokeColor("#4CAF50")
    .lineWidth(2)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  // Add transaction information similar to the checkout page
  doc.moveDown(1);

  // Receipt Information (formatted like the checkout page)
  const receiptFields = [
    { label: "Name", value: paymentObj.fullName },
    { label: "Email", value: paymentObj.email },
    { label: "Paying For/Description", value: paymentObj.paidFor },
    { label: "Amount", value: `₦${paymentObj.amountPaid}` },
    { label: "Date", value: new Date(paymentObj.datePaid).toLocaleString() },
    { label: "Transaction Reference", value: paymentObj.paymentRef },
  ];

  receiptFields.forEach((field) => {
    doc
      .fontSize(14)
      .text(`${field.label}:`, { continued: true, width: 150 })
      .font("Helvetica-Bold")
      .text(field.value);
    doc.moveDown(0.5);
  });

  // Final separator line
  doc.moveDown(1);
  doc
    .strokeColor("#4CAF50")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  // Footer message (customized)
  doc.moveDown(1.5);
  doc.fontSize(12).text("Thank you for your payment!", { align: "center" });
  doc.text("For any inquiries, please contact the school administration.", {
    align: "center",
  });
  doc.text("Phone: 123-456-7890 | Email: info@school.com", { align: "center" });

  // End and finalize the document
  doc.end();

  return receiptPath;
};
// Send receipt via email
const sendReceiptEmail = async (paymentObj, receiptPath) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable
        pass: process.env.EMAIL_PASS, // Use environment variable
      },
    });

    let info = await transporter.sendMail({
      from: "Al-Hudah Group Of Schools",
      to: paymentObj.email, // Use the payer's email
      subject: "Payment Receipt",
      text: "Thank you for your payment. Please find your receipt attached.",
      attachments: [
        {
          filename: `receipt_${paymentObj.paymentRef}.pdf`,
          path: receiptPath,
        },
      ],
    });

    // console.log("Receipt email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
// Verify if payment is completed
const verifyIfPaid = async (req, res) => {
  const { parent_Id } = req.body;

  try {
    const students = await studentModel.find({ parentId: parent_Id });
    const count = students.length;

    const filteredPayments = await paymentModel.find({ parentId: parent_Id });
    const admittedStudents = await studentModel.find({
      parentId: parent_Id,
      status: "Admitted",
    });

    if (filteredPayments.length >= count) {
      return res.send({ status: true });
    }

    res.send({ status: false });
  } catch (err) {
    console.error("Error verifying payments:", err);
    res.status(500).send({ status: false, message: "Server Error" });
  }
};
const approvePayment = async (req, res) => {
  const { paymentRef } = req.body;
  // console.log(paymentRef)
  try {
    // Find the payment using the payment reference
    const payment = await paymentModel.findOne({ paymentRef });
    // console.log(payment)
    if (payment) {
      // If payment is found, mark it as approved
      payment.isApproved = true;
      await payment.save(); // Ensure save() is awaited

      // Send a success response
      res.send({ status: true, message: "Approved Successfully!" });
    } else {
      // If payment is not found, send a not found response
      res.status(404).send({ status: false, message: "Payment not found" });
    }
  } catch (error) {
    // Catch and log any errors
    console.error("Error approving payment:", error);

    // Send an error response
    res.send({
      status: false,
      message: "An error occurred while approving payment",
    });
  }
};
const paymentHistory = async (req, res) => {
  const { parent_Id } = req.body;
  const payments = await paymentModel.find({ parentId: parent_Id });
  if (payments) {
    res.send({ status: true, payments });
  } else {
    res.send({ status: false, message: "No payments has been made" });
  }
};
const getPayments = async (req, res) => {
  try {
    const payments = await paymentModel.find();
    if (!payments.length) {
      res.send({ status: false, message: "No payments found" });
    }
    const studentIds = [...new Set(payments.map((p) => p.studentId))];
    const students = await studentModel.find({
      studentId: { $in: studentIds },
    });

    const studentMap = {};
    students.forEach((s) => {
      studentMap[s.studentId] = `${s.surName} ${s.otherNames}`;
    });
    const studentIdMap = {};
    studentIds.forEach((s) => {
      studentIdMap[s.studentId] = `${s.studentId}`;
    });
    const formatted = payments.map((p) => ({
      fullName: studentMap[p.studentId] || "Unknown Student",
      studentIdMap: studentIdMap[p.studentId],
      paymentRef: p.paymentRef,
      amountPaid: p.amountPaid,
      datePaid: p.datePaid,
      description: p.paidFor,
    }));
    res.send({ status: true, payments: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: "Server Error:", error });
  }
};
const getDebtorsByClass = async (req, res) => {
  try {
    const { className } = req.params;

    const foundClass = await classModel.findOne({ className });

    if (!foundClass) {
      return res.send({
        status: false,
        message: "Class not found",
      });
    }

    //------------------------------------
    // CLASS FEES
    //------------------------------------

    const feeDetails = [];
    let totalFees = 0;

    for (const feeName of foundClass.classFees) {
      const fee = await feesModel.findOne({
        fee: feeName,
      });

      if (!fee) continue;

      feeDetails.push({
        description: fee.fee,
        price: Number(fee.price),
      });

      totalFees += Number(fee.price);
    }

    //------------------------------------
    // CLASS BOOKS
    //------------------------------------

    const bookDetails = [];
    let totalBooks = 0;

    for (const bookName of foundClass.classBooks) {
      const book = await bookModel.findOne({
        name: bookName,
      });

      if (!book) continue;

      bookDetails.push({
        bookName: book.name,
        price: Number(book.price),
      });

      totalBooks += Number(book.price);
    }

    //------------------------------------
    // GRAND TOTAL
    //------------------------------------

    const totalRequired = totalFees + totalBooks;

    const debtors = [];

    //------------------------------------
    // STUDENTS
    //------------------------------------

    for (const studentId of foundClass.students) {
      const student = await studentModel.findOne({ studentId });

      if (!student) continue;

      const payments = await paymentModel.find({
        studentId,
      });

      //------------------------------------
      // Ignore admission fee completely
      //------------------------------------

      const validPayments = payments.filter(
        (p) => p.paidFor !== "Admission Fee",
      );

      // console.log(validPayments)

      //------------------------------------
      // TOTAL MONEY PAID
      //------------------------------------

      const totalPaid = validPayments.reduce(
        (sum, payment) => sum + Number(payment.amountPaid),
        0,
      );

      //------------------------------------
      // FEES
      //------------------------------------

      let paidFeeItems = [];
      let paidFeesTotal = 0;

      for (const payment of validPayments) {
        const fee = feeDetails.find((f) => f.description === payment.paidFor);

        if (fee) {
          paidFeeItems.push({
            description: payment.paidFor,
            amountPaid: Number(payment.amountPaid),
          });

          paidFeesTotal += Number(payment.amountPaid);
        }
      }

      // old system
      if (paidFeeItems.length === 0) {
        paidFeesTotal = validPayments
          .filter((p) => p.paidFor === "Part Payment For Fees")
          .reduce((sum, p) => sum + Number(p.amountPaid), 0);
      }

      const unpaidFees = feeDetails.filter(
        (fee) =>
          !paidFeeItems.some((paid) => paid.description === fee.description),
      );

      //------------------------------------
      // BOOKS
      //------------------------------------

      let paidBookItems = [];
      let paidBooksTotal = 0;

      for (const payment of validPayments) {
        const book = bookDetails.find((b) => b.bookName === payment.paidFor);

        if (book) {
          paidBookItems.push({
            bookName: payment.paidFor,
            amountPaid: Number(payment.amountPaid),
          });

          paidBooksTotal += Number(payment.amountPaid);
        }
      }

      if (paidBookItems.length === 0) {
        paidBooksTotal = validPayments
          .filter((p) => p.paidFor === "Part Payment For Books")
          .reduce((sum, p) => sum + Number(p.amountPaid), 0);
      }

      const unpaidBooks = bookDetails.filter(
        (book) =>
          !paidBookItems.some((paid) => paid.bookName === book.bookName),
      );

      //------------------------------------
      // DEBTS
      //------------------------------------

      const feeDebt = Math.max(totalFees - paidFeesTotal, 0);

      const bookDebt = Math.max(totalBooks - paidBooksTotal, 0);

      const totalDebt = Math.max(totalRequired - totalPaid, 0);

      //------------------------------------
      // ONLY RETURN DEBTORS
      //------------------------------------

      if (totalDebt > 0) {
        debtors.push({
          studentId,

          studentName: `${student.surName} ${student.otherNames}`,

          totalPaid,

          totalDebt,

          fees: {
            total: totalFees,
            paid: paidFeesTotal,
            debt: feeDebt,
            paidItems: paidFeeItems,
            unpaidItems: unpaidFees,
          },

          books: {
            total: totalBooks,
            paid: paidBooksTotal,
            debt: bookDebt,
            paidItems: paidBookItems,
            unpaidItems: unpaidBooks,
          },
        });
      }
    }

    return res.send({
      status: true,
      className,
      totalDebtors: debtors.length,
      students: debtors,
    });
  } catch (err) {
    console.log(err);

    return res.send({
      status: false,
      message: err.message,
    });
  }
};

const getOutstandingPayment = async (req, res) => {
  try {
    const { parent_Id } = req.body;
    // console.log('got here')
    const parentChildren = await studentModel.find({ parent_Id }); // await here

    let totalOutstanding = 0;

    for (const student of parentChildren) {
      const studentClass = await classModel
        .findById(student.classTo)
        .populate("classFees")
        .populate("classBooks");

      if (!studentClass) continue;

      // Calculate total amount expected (sum of fees and books)
      const totalFees = studentClass.fees.reduce(
        (sum, fee) => sum + fee.amount,
        0,
      );
      const totalBooks = studentClass.books.reduce(
        (sum, book) => sum + book.amount,
        0,
      );

      const totalExpected = totalFees + totalBooks;

      // Assuming `student.amountPaid` holds the amount this student has paid
      const paid = student.amountPaid || 0;

      const outstanding = totalExpected - paid;
      totalOutstanding += outstanding;
    }

    return res.status(200).json({ totalOutstanding });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getPaymentById = async (req, res) => {
  const { paymentRef } = req.body;
  const payment = await paymentModel.findOne({ paymentRef });
  if (payment) {
    res.send({ status: true, payment });
  } else {
    res.send({ status: false, message: "Not Found!!!" });
  }
};

module.exports = {
  getPayments,
  approvePayment,
  verifyPayment,
  verifyIfPaid,
  addPayment,
  paymentHistory,
  getOutstandingPayment,
  getPaymentById,
  getDebtorsByClass,
};
