const Expense = require('../models/Expense');

exports.getAllExpenses = async (req, res) => {
    const expenses = await Expense.find({ userId: req.user.userId });
    res.json(expenses);
};

exports.addExpense = async (req, res) => {
    const { name, category, price, date, description } = req.body;
    const newExpense = new Expense({ userId: req.user.userId, name, category, price, date, description });

    try {
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ message: 'Error adding expense', error });
    }
};

exports.editExpense = async (req, res) => {
    const { name, category, price, date, description } = req.body;
    const expenseId = req.params.id;

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(expenseId, { name, category, price, date, description }, { new: true });
        res.json(updatedExpense);
    } catch (error) {
        res.status(400).json({ message: 'Error updating expense', error });
    }
};

exports.deleteExpense = async (req, res) => {
    const expenseId = req.params.id;

    try {
        await Expense.findByIdAndDelete(expenseId);
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting expense', error });
    }
};
