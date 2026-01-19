require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Mock Data (Moved to routes/tasks.js for simplicity in this demo structure)
// let tasks = ...


// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Listener
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
