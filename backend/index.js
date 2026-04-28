const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.send('NgoConnect API is running');
});

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/news', require('./routes/news'));
app.use('/api/analytics', require('./routes/analytics'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

