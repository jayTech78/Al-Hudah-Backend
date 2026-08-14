const nodemailer = require('nodemailer');
require('dotenv').config();
const parentModel = require('../models/parent.model');
const studentModel = require('../models/student.model');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const {addStudentToClass} = require('./class.controller')
const classModel = require('../models/class.model')
// Configure nodemailer (only once)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Email from your environment file
    pass: process.env.EMAIL_PASS,  // Password from your environment file
  },
});

// Function to generate an admission letter PDF
const generateAdmissionLetter = (studentName, parentName, className, logoPath, resumptionDate, entranceExamScore) => {
  const doc = new PDFDocument();
  
  // Create the file path for the PDF
  const pdfPath = path.join(__dirname, `admission_letter_${studentName}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

  // Add School Logo
  doc.image(logoPath, 50, 50, { width: 100 });

  // Add the title and letter content
  doc
    .fontSize(24)
    .text("Al-Hudah Group Of School", { align: 'center' })
    .moveDown(2)
    .fontSize(16)
    .text(`Dear ${parentName},`, { align: 'left' })
    .moveDown()
    .fontSize(14)
    .text(`We are pleased to inform you that your child, ${studentName}, has been admitted to the class ${className} with score ${entranceExamScore}.`, { align: 'left' })
    .moveDown(2)
    .text(`Resumption Date: ${resumptionDate}`, { align: 'left' })
    .moveDown(2)
    .text("Please find more details regarding the school year and onboarding process enclosed.", { align: 'left' })
    .moveDown(3)
    .text("We look forward to welcoming you and your child to our school community.", { align: 'left' })
    .moveDown(2)
    .text("Sincerely,", { align: 'left' })
    .moveDown(1)
    .text("School Management", { align: 'left' });

  // Finalize the PDF and end the stream
  doc.end();

  return pdfPath;
};

// Function to send an email with an optional attachment
const sendEmail = async (parentEmail, subject, body, attachmentPath = null) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'okikiolalawal18@gmail.com',
    subject,
    html: body,
    attachments: attachmentPath
      ? [{
          filename: path.basename(attachmentPath),
          path: attachmentPath,
        }]
      : [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Function to handle the complete email process
const sendEntranceExamDate = async (req, res) => {
  try {
    const { entranceExamDate, parentName, studentName, parentEmail, } = req.body;

    // Fetch the parent information by email or other identifier
    const parent = await parentModel.findOne({ email: parentEmail });
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Generate the entrance exam date letter PDF
    const className = 'Grade 5';  // Example class, should be dynamic
    const logoPath = path.join(__dirname, '../logo-removebg-preview.png');
    const pdfPath = generateAdmissionLetter(studentName, parentName, className, logoPath);

    // Prepare the email content
    const subject = 'Entrance Exam Date & Admission Letter';
    const body = `
      <h1>Entrance Exam Notification</h1>
      <p>Dear ${parentName},</p>
      <p>We are pleased to inform you that the entrance exam date for your child, ${studentName}, has been scheduled on ${entranceExamDate}.</p>
      <p>Please ensure that your child is prepared and arrives on time.</p>
      <p>We have also attached an official admission letter with more details.</p>
      <p>Best Regards,<br/>School Administration</p>
    `;

    // Send the email with the admission letter attached
    await sendEmail(parentEmail, subject, body, pdfPath);

    // Mark email as sent in the parent record
    parent.isEntranceExamDateSent = true;
    await parent.save();

    res.send({ status: true, message: 'Entrance exam date and admission letter sent successfully!' });
  } catch (error) {
    console.error('Error sending entrance exam date and admission letter:', error);
    res.status(500).json({ error: 'Failed to send entrance exam date and admission letter' });
  }
};
const sendAdmissionLetter = async (req, res) => {
  try {
    const { entranceExamScore, parentName, studentName, parentEmail, classAdmittedTo, resumptionDate, studentId } = req.body;
    // console.log(entranceExamScore,resumptionDate)
    // console.log(req.body)
    // Fetch the student information
    const student = await studentModel.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch the class information
    const classData = await classModel.findOne({ className: classAdmittedTo });
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Mark the student as admitted
    student.status = 'Admitted';
    student.classAdmittedTo = classAdmittedTo;
    student.dateAdmitted = Date.now()
    // Add the student to the class
    classData.students.push(studentId); // Assuming there's a `students` array in `classModel`
    await classData.save(); // Save the class changes

    // Save the updated student record
    await student.save(); // Save the student changes

    // Fetch the parent information
    const parent = await parentModel.findOne({ email: parentEmail });
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Generate the admission letter PDF
    const logoPath = path.resolve(__dirname, '../logo-removebg-preview.png'); // Use path.resolve for correct file path
    const pdfPath = generateAdmissionLetter(studentName, parentName, classAdmittedTo, logoPath, resumptionDate, entranceExamScore);

    // Prepare the email content
    const subject = 'Admission Letter';
    const body = `
      <h1>Admission Letter</h1>
      <p>Dear ${parentName},</p>
      <p>We are pleased to inform you that your ward, ${studentName}, has been admitted to ${classAdmittedTo}. The attached file is the Admission letter with full details.</p>
      <p>Best Regards,<br/>School Management</p>
    `;

    // Send the email with the admission letter attached
    await sendEmail(parentEmail, subject, body, pdfPath);

    // Mark email as sent in the parent record
    parent.isAdmissionLetterSent = true;
    await parent.save(); // Save the parent changes

    // Optionally, delete the PDF after sending the email to save storage space
    // fs.unlinkSync(pdfPath); // Uncomment this line if you want to delete the PDF file

    res.send({ status: true, message: 'Admission letter sent, student admitted, and added to class successfully!' });
  } catch (error) {
    console.error('Error sending admission letter:', error);
    res.status(500).json({ error: 'Failed to send admission letter' });
  }
};


// module.exports = sendAdmissionLetter;

module.exports = { sendEntranceExamDate, sendAdmissionLetter };