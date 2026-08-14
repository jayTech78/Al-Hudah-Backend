const gradeModel = require("../models/grade.model");
const studentModel = require("../models/student.model");
const sessionModel = require("../models/session.model");
const termModel = require("../models/term.model");
const parentService = require("../services/parentService");
const gradeService = require("../services/gradeService")

/******************************************************************************
 * Record Student Grades
 ******************************************************************************/

const recordGrades = async (req, res) => {
  try {
    // console.log(req.body[0]);
    const studentsGrades = req.body;
    const grades = [];
    for (const studentsGrade of studentsGrades) {
      const grade = await gradeService.recordGrades(studentsGrade);
      grades.push(grade)
      // console.log("grades",grades)
    }
    res.send({
      status: true,
      message: "Grades recorded successfully.",
      grades
    });

  }

  catch (error) {
    console.error(error);

    res.send({
      status: false,
      message: error.message
    });
  }
};

/******************************************************************************
 * Update Student Grades
 ******************************************************************************/

const updateGrades = async (req, res) => {
  try {
    const grades = await gradeService.updateGrades(req.body);

    res.send({
      status: true,
      message: "Grades updated successfully.",
      grades
    });
  }

  catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error.message
    });
  }
};

const getStudentGrade = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { session, term } = req.query;

    const student = await studentModel.findById(studentId);
    if (!student)
      return res.send({ status: false, message: "Student Not Found" });

    const studentClassId = student.classTo;
    const classmates = await studentModel.find({ classTo: studentClassId });

    const resultLists = [];

    for (let classmate of classmates) {
      const grades = await gradeModel.find({
        studentId: classmate.studentId,
        session,
      });

      let total = 0;
      let subjectCount = 0;
      let studentTermResults = [];

      grades.forEach((record) => {
        const termData = record[term];
        if (termData) {
          studentTermResults.push({
            subject: record.subjectName || "Unknown Subject",
            weightedAverage: termData.weightedAverage ?? "N/A",
            test1: termData.continuousAssesment ?? "N/A",
            exam: termData.exam ?? "N/A",
            grade: termData.grade ?? "N/A",
            teacherRemarks: termData.teacherRemarks ?? "N/A",
          });

          if (termData.weightedAverage != null) {
            total += termData.weightedAverage;
            subjectCount++;
          }
        }
      });

      // Optional: sort results by subject name
      studentTermResults.sort((a, b) => a.subject.localeCompare(b.subject));

      const overallTotal = subjectCount * 100;
      const percentage = subjectCount > 0 ? (total / overallTotal) * 100 : 0;

      resultLists.push({
        studentId: classmate.studentId,
        name: `${classmate.surName} ${classmate.otherNames}`,
        totalMarkObtained: total,
        percentage: Number(percentage.toFixed(2)),
        overallTotal,
        studentTermResults,
      });
    }

    resultLists.sort((a, b) => b.percentage - a.percentage);

    resultLists.forEach((record, index) => {
      record.position = `${index + 1}${getOrdinalSuffix(index + 1)}`;
    });

    const studentResult = resultLists.find((r) => r.studentId === studentId);
    if (!studentResult) {
      return res.send({
        status: false,
        message: "Result not found for student",
      });
    }

    return res.send({ status: true, message: studentResult });
  } catch (error) {
    console.error(error);
    return res.send({ status: false, message: "Server Error" });
  }
};

// Get grades by subjectId
const getGradesBySubject = async (req, res) => {
  const { subjectId, term, session, className } = req.body;

  try {
    const termKey = `${term}PerSubject`; // e.g., "firstTermPerSubject"

    // Step 1: Get all grades matching subject
    const grades = await gradeModel.find({
      session,
      className,
      [`${termKey}.subjectId`]: subjectId,
    });

    if (!grades.length) {
      return res.send({
        status: false,
        message: "No grades found for this subject.",
      });
    }

    // Step 2: Extract studentIds and fetch students manually
    const studentIds = grades.map((g) => g.studentId);
    const students = await studentModel.find({
      studentId: { $in: studentIds },
    });

    // Step 3: Combine grades with student names
    const scoresWithNames = grades.map((grade) => {
      const subjectData = grade[termKey];
      const student = students.find((s) => s.studentId === grade.studentId);
      const fullName = `${student?.surName || ""} ${student?.otherNames || ""
        }`.trim();
      const total =
        (subjectData.continuousAssesment || 0) + (subjectData.exam || 0);

      return {
        studentId: grade.studentId,
        name: fullName,
        ca: subjectData.continuousAssesment,
        exam: subjectData.exam,
        total,
      };
    });

    // Step 4: Sort by total score
    scoresWithNames.sort((a, b) => b.total - a.total);

    // Step 5: Assign positions
    const withPosition = scoresWithNames.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    return res.send({ status: true, data: withPosition });
  } catch (error) {
    console.error(error);
    return res.send({ status: false, message: "Server error", error });
  }
};

/******************************************************************************
 * Get Grades For Entire Class
 ******************************************************************************/

const getClassGrades = async (req, res) => {
  try {
    const { className } = req.params;
    // console.log(className);

    const session = await sessionModel.findOne({ status: "Active" });

    // console.log("Active Session",session);

    const getGrades = await gradeModel.findOne();
    // console.log("All Grades",getGrades)

    const grades = await gradeService.getClassGrades(
      className,
      session
    );

    // console.log(grades)
    res.send({
      status: true,
      grades
    });
  }

  catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error.message
    });
  }
};

const getStudentsResultsByParentId = async (req, res) => {
  try {

    const { parentId } = req.params;
    // console.log(parentId);
    const studentsResult = await parentService.getStudentsResults(parentId);

    // console.log(studentsResult)

    if (!studentsResult.length) {

      return res.send({
        status: false,
        message: "No student found for this parent."
      });
    }

    res.send({
      status: true,
      studentsResult
    });
  }

  catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error.message
    });
  }
};

module.exports = {
  recordGrades,
  updateGrades,
  getStudentGrade,
  getGradesBySubject,
  getClassGrades,
  getStudentsResultsByParentId
};