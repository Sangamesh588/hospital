// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const patientsRouter = require('./routes/patients');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI missing in .env');
  process.exit(1);
}

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Middlewares
app.use(cors());
app.use(express.json()); // for non-multipart routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/patients', patientsRouter);

// health
app.get('/api/status', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Error handler
app.use(errorHandler);

// Start
const host = process.env.HOST || '0.0.0.0';
app.listen(PORT, host, () => {
  console.log(`Server running on http://${host}:${PORT}`);
});

