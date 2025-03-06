const mongoose = require('mongoose');

// Define a schema for a single class entry
const ClassSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  faculty: { type: String, default: '' }
});

// Define a day schedule schema (for Monday-Friday)
const DayScheduleSchema = new mongoose.Schema({
  monday: { type: [ClassSchema], default: [] },
  tuesday: { type: [ClassSchema], default: [] },
  wednesday: { type: [ClassSchema], default: [] },
  thursday: { type: [ClassSchema], default: [] },
  friday: { type: [ClassSchema], default: [] },
});

// Timetable schema with separate timetables for each year
const TimetableSchema = new mongoose.Schema({
  firstYear: { type: DayScheduleSchema, default: {} },
  secondYear: { type: DayScheduleSchema, default: {} },
  thirdYear: { type: DayScheduleSchema, default: {} },
  fourthYear: { type: DayScheduleSchema, default: {} },
});

module.exports = mongoose.model('Timetable', TimetableSchema);
