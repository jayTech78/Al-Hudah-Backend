const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(cors());

// File Upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { upload_Image } = require("./controllers/upload-image.controllers");

// Routes
const parentRouter = require("./routes/parent.route");
const studentRouter = require("./routes/student.route");
const staffRouter = require("./routes/staff.route");
const managerRouter = require("./routes/manager.route");
const paymentRouter = require("./routes/payment.route");
const feesRouter = require("./routes/fees.route");
const bookRouter = require("./routes/book.route");
const roleRouter = require("./routes/roles.route");
const classRouter = require("./routes/class.route");
const subjectRouter = require("./routes/subject.route");
const emailRouter = require("./routes/email.route");
const eventRouter = require("./routes/event.route");
const gradeRouter = require("./routes/grade.route");
const attendanceRouter = require("./routes/attendance.route");
const financeRouter = require("./routes/finance.route");
const auditRouter = require("./routes/audit.route");
const termRouter = require("./routes/term.route");
const sessionRouter = require("./routes/session.route");
const resultRouter = require("./routes/result.route");
const disciplinaryRouter = require("./routes/disciplinary.routes");
const incomeRouter = require("./routes/income.route");
const expenseRouter = require("./routes/expense.route");
const cashbookRouter = require("./routes/cashbook.route");

require("./cron/promotionCron");

// Routes
app.use("/parent", parentRouter);
app.use("/student", studentRouter);
app.use("/disciplinary", disciplinaryRouter);
app.use("/event", eventRouter);
app.use("/staff", staffRouter);
app.use("/manager", managerRouter);
app.use("/payment", paymentRouter);
app.use("/fees", feesRouter);
app.use("/book", bookRouter);

app.post("/upload-image", upload.single("file"), upload_Image);

app.use("/role", roleRouter);
app.use("/class", classRouter);
app.use("/subject", subjectRouter);
app.use("/grades", gradeRouter);
app.use("/email", emailRouter);
app.use("/attendance", attendanceRouter);
app.use("/finance", financeRouter);
app.use("/audit", auditRouter);
app.use("/term", termRouter);
app.use("/session", sessionRouter);
app.use("/result", resultRouter);
app.use("/income", incomeRouter);
app.use("/expense", expenseRouter);
app.use("/cashbook", cashbookRouter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongo Connected Successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`App is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("There was a problem connecting to MongoDB:", err);
    process.exit(1);
  });