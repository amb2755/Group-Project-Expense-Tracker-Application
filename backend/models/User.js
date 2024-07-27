const mongoose = require('mongoose');

// Define the expense schema //
const expenseSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    category: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    price: {
        type: Number,
        required: [true, "Check entry, ensure all fields complete"],
        min: 0
    },
    date: {
        type: Date,
        required: [true, "Check entry, ensure all fields complete"]
    },
    description: {
        type: String
    }
});

// Define the user schema //
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    password: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    expenses: [expenseSchema] // Embed the expense schema as an array
});

// Create the user model //
const User = mongoose.model('User', userSchema);

module.exports = User;
