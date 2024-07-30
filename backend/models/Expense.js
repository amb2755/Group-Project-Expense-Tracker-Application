const mongoose = require('mongoose');

// Define the expense schema
const expenseSchema = new mongoose.Schema({
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
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    }
});

// Create and export the expense model
const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
