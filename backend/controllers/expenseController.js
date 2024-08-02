const Expense = require('../models/Expense');

// Get all expenses
const getExpenses = async (req, res) => {
    try {
        console.log('Fetching expenses for user:', req.user.id);
        const expenses = await Expense.find({ user: req.user.id });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add a new expense
const addExpense = async (req, res) => {
    const { name, category, price, date, description } = req.body;

    try {
        console.log('Adding expense:', req.body);
        const newExpense = new Expense({
            user: req.user.id,
            name,
            category,
            price,
            date,
            description
        });

        const expense = await newExpense.save();
        res.json(expense);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete an expense
const deleteExpense = async (req, res) => {
    try {
        console.log('Deleting expense with ID:', req.params.id);
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Check if the expense belongs to the user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'User not authorized' });
        }

        await expense.remove();
        res.json({ message: 'Expense removed' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    deleteExpense
};
