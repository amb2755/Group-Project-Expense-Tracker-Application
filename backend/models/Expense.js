const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    description: { type: String }
});

module.exports = expenseSchema;
