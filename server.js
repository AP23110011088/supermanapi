const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const { validateEnv } = require('./config/env');
const authRoutes = require('./routes/auth');
const superheroRoutes = require('./routes/superhero');
const superheroApiRoutes = require('./routes/superheroApi');

let envConfig;

try {
  envConfig = validateEnv();
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}

envConfig.warnings.forEach((warning) => console.warn(`Warning: ${warning}`));

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

mongoose.connect(envConfig.mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/superheroes', superheroRoutes);
app.use('/api/superhero-api', superheroApiRoutes);
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

const clientBuildDir = path.join(__dirname, 'client', 'build');
if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5MB' : err.message;
    return res.status(400).json({ message });
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
