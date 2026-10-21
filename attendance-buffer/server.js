require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const subjectRoutes = require('./routes/subjects');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method}  ${req.url}`);
  next();
});

app.use('/api/subjects', subjectRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_buffer';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
