const mongoose = require('mongoose');
const Expense = require('./Expense').schema; // Import the Expense schema

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    password: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    expenses: [Expense] // Embed the expense schema as an array
});

// Create and export the user model
const User = mongoose.model('User', userSchema);
module.exports = User;

