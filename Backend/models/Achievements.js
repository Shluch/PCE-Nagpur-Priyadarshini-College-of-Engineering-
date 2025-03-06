const mongoose = require('mongoose');

const YearDataSchema = new mongoose.Schema({
  achievements: { type: [String], default: [] },
  topperRollList: { type: [String], default: [] }
});

const AchievementsSchema = new mongoose.Schema({
  firstYear: { type: YearDataSchema, default: {} },
  secondYear: { type: YearDataSchema, default: {} },
  thirdYear: { type: YearDataSchema, default: {} },
  fourthYear: { type: YearDataSchema, default: {} }
});

module.exports = mongoose.model('Achievements', AchievementsSchema);
