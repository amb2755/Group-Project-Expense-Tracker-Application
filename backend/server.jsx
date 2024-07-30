const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Expense = require('./models/Expense');

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

console.log('MONGO_URI:', mongoURI);

let loggedInUserID = -1;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Connect to MongoDB
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
    socketTimeoutMS: 45000
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Could not connect to MongoDB:', error));

// Routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/', authRoutes);
app.use('/', expenseRoutes);

// Serve React build files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
