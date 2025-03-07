require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added to work with static files
const Students = require('./models/Students');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Predetermined admin credentials (for demo only)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Middleware to verify the JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token.' });
    req.user = decoded; // Contains username and role
    next();
  });
}

// Middleware to check for admin role
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin role required.' });
  }
  next();
}

// Login endpoint for admin
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Create a token with admin role
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Timetable endpoints (unchanged)
const Timetable = require('./models/Timetable');

app.get('/api/timetable', async (req, res) => {
  try {
    let timetable = await Timetable.findOne();
    if (!timetable) {
      // Create a default timetable if none exists
      timetable = new Timetable();
      await timetable.save();
    }
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching timetable' });
  }
});

app.put('/api/timetable', verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedData = req.body;
    let timetable = await Timetable.findOne();
    if (!timetable) {
      timetable = new Timetable(updatedData);
    } else {
      // Update timetable fields
      Object.assign(timetable, updatedData);
    }
    await timetable.save();
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: 'Error updating timetable' });
  }
});

// Updated Students endpoints using your Students model

// GET students document (single document containing firstYear, secondYear, etc.)
app.get('/api/students', async (req, res) => {
  try {
    let studentsDoc = await Students.findOne();
    if (!studentsDoc) {
      // Create a default document if none exists
      studentsDoc = new Students();
      await studentsDoc.save();
    }
    res.json(studentsDoc);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// PUT update students document (admin only)
app.put('/api/students', verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedData = req.body;
    let studentsDoc = await Students.findOne();
    if (!studentsDoc) {
      // If no document exists, create one with the provided data
      studentsDoc = new Students(updatedData);
    } else {
      // Update the existing document with the new data
      Object.assign(studentsDoc, updatedData);
    }
    await studentsDoc.save();
    res.json(studentsDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating student records' });
  }
});

// Multer configuration for Learning Material uploads
const multer = require('multer');
const LearningMaterial = require('./models/LearningMaterial');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure the uploads folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('File type not allowed. Only PDF, DOC, DOCX, XLS, XLSX are permitted.'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Upload endpoint (admin only)
app.post('/api/upload', verifyToken, isAdmin, upload.single('file'), async (req, res) => {
  try {
    // Expecting two additional fields in the request body: category and year.
    const { category, year } = req.body;
    // Validate the year value
    const validYears = ['firstYear', 'secondYear', 'thirdYear', 'fourthYear'];
    if (!validYears.includes(year)) {
      return res.status(400).json({ message: 'Invalid year selected.' });
    }

    const materialData = {
      category,
      filePath: req.file.path,
      originalName: req.file.originalname
    };

    // Find the single LearningMaterial document (create one if it doesn't exist)
    let doc = await LearningMaterial.findOne();
    if (!doc) {
      doc = new LearningMaterial();
    }
    // Push the new material into the selected year's array
    doc[year].push(materialData);
    await doc.save();

    res.json({ message: 'File uploaded successfully!', material: materialData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// GET endpoint to list all learning materials (public)
app.get('/api/learning-materials', async (req, res) => {
  try {
    const materials = await LearningMaterial.find();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching learning materials' });
  }
});

const Achievements = require('./models/Achievements');

// GET achievements document (single document grouping data by year)
app.get('/api/achievements', async (req, res) => {
  try {
    let achievementsDoc = await Achievements.findOne();
    if (!achievementsDoc) {
      achievementsDoc = new Achievements();
      await achievementsDoc.save();
    }
    res.json(achievementsDoc);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching achievements' });
  }
});

// PUT update achievements document (admin only)
app.put('/api/achievements', verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedData = req.body;
    let achievementsDoc = await Achievements.findOne();
    if (!achievementsDoc) {
      achievementsDoc = new Achievements(updatedData);
    } else {
      Object.assign(achievementsDoc, updatedData);
    }
    await achievementsDoc.save();
    res.json(achievementsDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating achievements' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
