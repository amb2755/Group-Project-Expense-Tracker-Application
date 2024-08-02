const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');

// Use authMiddleware to protect routes
router.get('/', authMiddleware, getExpenses);
router.post('/', authMiddleware, addExpense);
router.delete('/:id', authMiddleware, deleteExpense);

module.exports = router;

