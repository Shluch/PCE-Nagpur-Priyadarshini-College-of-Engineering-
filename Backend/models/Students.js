// models/Students.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  name: { type: String, required: true },
  studentId: { type: String, required: true }
});

const StudentsSchema = new mongoose.Schema({
  firstYear: { type: [StudentSchema], default: [] },
  secondYear: { type: [StudentSchema], default: [] },
  thirdYear: { type: [StudentSchema], default: [] },
  fourthYear: { type: [StudentSchema], default: [] }
});

module.exports = mongoose.model('Students', StudentsSchema);
// const Students = require('./models/Students');
