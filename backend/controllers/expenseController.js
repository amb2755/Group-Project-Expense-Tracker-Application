const User = require('../models/User'); // Import the User model to interact with the MongoDB collection //
const debug = require('debug')('app:expenses'); // Set up a namespace for debugging //

// Get all expenses for a user //
const getExpenses = async (req, res) => {
    try {
        debug(`Fetching expenses for user: ${req.user._id}`); // Log the user ID for debugging //
        const expenses = await User.findById(req.user._id).select('expenses'); // Fetch expenses for the logged-in user //
        res.json(expenses);
    } catch (error) {
        debug('Error fetching expenses:', error); // Log any errors that occur //
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add a new expense //
const addExpense = async (req, res) => {
    const { userId, name, category, price, date, description } = req.body;
    debug('Received add expense request:', { userId, name, category, price, date, description }); // Log the request details

    try {
        // Find the user by ID //
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Create a new expense object //
        const newExpense = {
            name,
            category,
            price,
            date,
            description
        };

        // Add the new expense to the user's expenses array //
        user.expenses.push(newExpense);
        await user.save(); // Save the updated user document to the database //

        debug('Expense added successfully:', newExpense); // Log the added expense details //
        res.status(201).json(newExpense);
    } catch (error) {
        debug('Error adding expense:', error); // Log any errors that occur //
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update an existing expense
const updateExpense = async (req, res) => {
    const { description, amount, category, date } = req.body; // Destructure the updated expense details from the request body
    try {
        debug(`Updating expense with ID: ${req.params.id}`); // Log the expense ID for debugging //
        const expense = await User.findOneAndUpdate(
            { 'expenses._id': req.params.id },
            {
                $set: {
                    'expenses.$.description': description,
                    'expenses.$.amount': amount,
                    'expenses.$.category': category,
                    'expenses.$.date': date
                }
            },
            { new: true }
        );

        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        debug('Expense updated successfully:', expense); // Log the updated expense details //
        res.json(expense);
    } catch (error) {
        debug('Error updating expense:', error); // Log any errors that occur //
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete an expense
const deleteExpense = async (req, res) => {
    try {
        debug(`Deleting expense with ID: ${req.params.id}`); // Log the expense ID for debugging
        const expense = await User.findOneAndUpdate(
            { 'expenses._id': req.params.id },
            { $pull: { expenses: { _id: req.params.id } } },
            { new: true }
        );

        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        debug('Expense deleted successfully'); // Log successful deletion //
        res.json({ message: 'Expense removed' });
    } catch (error) {
        debug('Error deleting expense:', error); // Log any errors that occur //
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get monthly summary of expenses
const getMonthlySummary = async (req, res) => {
    const { month, year } = req.params; // Extract month and year from the request parameters //
    try {
        debug(`Fetching monthly summary for ${month}/${year} for user: ${req.user._id}`); // Log the month, year, and user ID //
        const expenses = await User.find({
            'expenses.date': {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1)
            },
            user: req.user._id
        }).select('expenses');

        const summary = expenses.reduce((acc, expense) => {
            if (!acc[expense.category]) {
                acc[expense.category] = 0;
            }
            acc[expense.category] += expense.amount; // This Should be able to  Sum expenses by category
            return acc;
        }, {});

        debug('Monthly summary generated successfully:', summary); // Log the generated summary //
        res.json(summary);
    } catch (error) {
        debug('Error fetching monthly summary:', error); // Log any errors that occur //
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense, getMonthlySummary }; // Export the controller functions //
