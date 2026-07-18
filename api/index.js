const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const annotationRoutes = require('../server/routes/annotationRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection helper with connection caching
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB (Cached)');
  return cachedConnection;
};

// Middleware to ensure database is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/annotations', annotationRoutes);

module.exports = app;
