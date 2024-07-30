const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middlewares/authMiddleware');

// Get all expenses for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('expenses');
        res.json(user.expenses);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching expenses', error });
    }
});

// Add a new expense
router.post('/', authenticateToken, async (req, res) => {
    const { name, category, price, date, description } = req.body;
    const newExpense = { name, category, price, date, description };

    try {
        const user = await User.findById(req.user.userId);
        user.expenses.push(newExpense);
        await user.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ message: 'Error adding expense', error });
    }
});

// Edit an existing expense
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, category, price, date, description } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        const expense = user.expenses.id(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        expense.name = name;
        expense.category = category;
        expense.price = price;
        expense.date = date;
        expense.description = description;
        await user.save();
        res.json(expense);
    } catch (error) {
        res.status(400).json({ message: 'Error updating expense', error });
    }
});

// Delete an expense
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.expenses.id(req.params.id).remove();
        await user.save();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting expense', error });
    }
});

module.exports = router;
