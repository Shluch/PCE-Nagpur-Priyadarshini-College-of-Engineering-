const mongoose = require('mongoose');

const LearningMaterialSchema = new mongoose.Schema({
  category: { type: String, required: true },
  filePath: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const LearningMaterial = new mongoose.Schema({
  firstYear: { type: [LearningMaterialSchema], default: [] },
  secondYear: { type: [LearningMaterialSchema], default: [] },
  thirdYear: { type: [LearningMaterialSchema], default: [] },
  fourthYear: { type: [LearningMaterialSchema], default: [] }
});

module.exports = mongoose.model('LearningMaterial', LearningMaterial);
