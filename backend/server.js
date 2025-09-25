const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Storage for uploaded files and session data
const uploads = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploads);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploads);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'));
    }
  }
});

// In-memory storage for session data (in production, use Redis or database)
const sessions = new Map();

// Generate sample CSV data
const generateSampleData = (count = 10000) => {
  const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Science', 'Philosophy'];
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  const titles = [
    'The Great Adventure', 'Mysteries of Time', 'Love in the City', 'The Last Journey', 'Beyond the Stars',
    'Whispers in the Dark', 'The Secret Garden', 'Chronicles of Tomorrow', 'Dancing with Shadows', 'The Golden Path',
    'Echoes of the Past', 'The Silent Storm', 'Bridges to Nowhere', 'The Forgotten Kingdom', 'Tales of Wonder',
    'The Endless Night', 'Rivers of Dreams', 'The Burning Sky', 'Secrets of the Deep', 'The Crystal Palace'
  ];

  const data = [];
  
  for (let i = 0; i < count; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)] + (Math.random() > 0.7 ? ` ${i + 1}` : '');
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const author = `${firstName} ${lastName}`;
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const publishedYear = Math.floor(Math.random() * 70) + 1954; // 1954-2023
    const isbn = `978-${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}-${Math.floor(Math.random() * 9)}`;
    
    data.push({
      Title: title,
      Author: author,
      Genre: genre,
      PublishedYear: publishedYear,
      ISBN: isbn
    });
  }
  
  return data;
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Generate sample data endpoint
app.get('/api/generate-sample', (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10000;
    const data = generateSampleData(count);
    const csv = Papa.unparse(data);
    
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      originalData: data,
      currentData: [...data],
      filename: `sample-books-${count}.csv`
    });
    
    res.json({
      sessionId,
      data,
      message: `Generated ${count} sample book records`
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    res.status(500).json({ error: 'Failed to generate sample data' });
  }
});

// Upload CSV file
app.post('/api/upload', upload.single('csvFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const csvContent = fs.readFileSync(filePath, 'utf8');
    
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim()
    });
    
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing warnings:', parseResult.errors);
    }
    
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      originalData: parseResult.data,
      currentData: [...parseResult.data],
      filename: req.file.originalname
    });
    
    // Clean up uploaded file
    fs.remove(filePath);
    
    res.json({
      sessionId,
      data: parseResult.data,
      message: `Successfully parsed ${parseResult.data.length} records`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

// Get data for session
app.get('/api/data/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    data: session.currentData,
    filename: session.filename
  });
});

// Update data
app.put('/api/data/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.currentData = req.body.data;
  res.json({ message: 'Data updated successfully' });
});

// Reset data to original
app.post('/api/reset/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.currentData = [...session.originalData];
  res.json({
    data: session.currentData,
    message: 'Data reset to original'
  });
});

// Download CSV
app.get('/api/download/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const csv = Papa.unparse(session.currentData);
  const filename = `edited-${session.filename}`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
