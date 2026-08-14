# Services Layer

---

## Purpose

The Service Layer contains the **business logic** of the School Management System.

A service is responsible for performing the actual work of the application.

Examples include:

- Recording grades
- Generating results
- Promoting students
- Updating classes
- Validating academic rules

Controllers should never contain business logic.

---

# Responsibilities

The Service Layer is responsible for:

- Reading data from the database
- Updating database records
- Performing calculations
- Enforcing business rules
- Calling utility functions
- Calling other services when necessary

---

# Responsibilities of Each Service

## classService

Responsible for everything related to classes.

Examples:

- Retrieve a class
- Retrieve students in a class
- Retrieve class subjects
- Add a student to a class
- Remove a student from a class
- Lock or unlock result entry

---

## gradeService

Responsible for student grades.

Examples:

- Save teacher scores
- Update scores
- Calculate CA
- Calculate total score
- Calculate grade
- Calculate subject position
- Check class completion

---

## resultService

Responsible for report card generation.

Examples:

- Generate student result
- Calculate averages
- Calculate overall position
- Generate class statistics
- Save report card information

---

## promotionService

Responsible for academic promotion.

Examples:

- Promote students
- Graduate SS3 students
- Update student class
- Move students between classes
- Save promotion history

---

# What Should NOT Be Inside Services?

Services should never:

- Receive Express requests (`req`)
- Send Express responses (`res`)
- Define API routes
- Render pages
- Handle frontend logic

Those responsibilities belong to Controllers.

---

# Service Communication

Services are allowed to call other services.

Example:

gradeService

↓

resultService

↓

promotionService

This avoids duplicating code.

---

# Utility Functions

Services may use utilities.

Example:

gradeService

↓

gradeUtils

↓

positionUtils

Utilities should contain reusable helper functions only.

Utilities should never communicate with MongoDB.

---

# Models

Services communicate directly with Mongoose models.

Example:

gradeService

↓

gradeModel

studentModel

classModel

---

# Error Handling

Services should throw errors.

Example:

throw new Error("Student not found");

Controllers are responsible for catching errors and sending HTTP responses.

---

# Return Values

Services should always return data.

Example:

return updatedStudent;

Never return:

res.send(...)

or

res.status(...)

Those belong to Controllers.

---

# Service Flow

Frontend

↓

Routes

↓

Controllers

↓

Services

↓

Utilities

↓

Models

↓

MongoDB

---

# Naming Convention

Every service function should begin with a verb.

Examples:

getClassByName()

saveGrades()

generateResults()

promoteStudents()

calculateSubjectPosition()

updateStudent()

Never use names like:

grades()

student()

promotion()

---

# Documentation Standard

Every function inside a service must contain:

- Function description
- Purpose
- Business rules
- Parameters
- Return value
- Flow diagram
- Step-by-step comments

This makes the project easier to maintain and understand.

---

# Interview Note

Why use a Service Layer?

Because business logic should be reusable.

The same logic may be needed by:

- Controllers
- Cron Jobs
- Other Services

Keeping business logic inside Services prevents duplication and makes the project easier to test and maintain.

backend
│
├── controllers
│   ├── classController.js
│   ├── gradeController.js
│   ├── resultController.js
│   └── promotionController.js
│
├── services
│   ├── README.md          ✅
│   ├── classService.js    ⏳ Next
│   ├── gradeService.js
│   ├── resultService.js
│   └── promotionService.js
│
├── utils
│   ├── README.md
│   ├── gradeUtils.js
│   ├── promotionUtils.js
│   └── positionUtils.js
│
├── models
│
├── routes
│
├── cron
│
└── server.js