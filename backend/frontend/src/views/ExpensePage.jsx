import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExpensePage = () => {
    const [expenses, setExpenses] = useState([]);
    const [expense, setExpense] = useState({ name: '', category: '', price: '', date: '', description: '' });
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = () => {
        const token = localStorage.getItem('token');
        axios.get('/api/expenses', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setExpenses(response.data);
            })
            .catch(error => {
                setErrorMessage('An error occurred while fetching expenses.');
                console.error('Error fetching expenses:', error);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense(prevExpense => ({
            ...prevExpense,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const endpoint = editMode ? `/api/expenses/${editId}` : '/api/expenses';
        const method = editMode ? 'put' : 'post';

        axios({
            method,
            url: endpoint,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: expense
        })
            .then(response => {
                setEditMode(false);
                setExpense({ name: '', category: '', price: '', date: '', description: '' });
                fetchExpenses();
            })
            .catch(error => {
                setErrorMessage('An error occurred while saving the expense.');
                console.error('Error saving expense:', error);
            });
    };

    const handleEdit = (expense) => {
        setEditMode(true);
        setEditId(expense._id);
        setExpense({
            name: expense.name,
            category: expense.category,
            price: expense.price,
            date: new Date(expense.date).toISOString().split('T')[0],
            description: expense.description
        });
    };

    const handleDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.delete(`/api/expenses/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                fetchExpenses();
            })
            .catch(error => {
                setErrorMessage('An error occurred while deleting the expense.');
                console.error('Error deleting expense:', error);
            });
    };

    return (
        <div>
            <h1>Expenses</h1>
            {errorMessage && <p>{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={expense.name}
                    onChange={handleChange}
                    required
                />
                <select
                    name="category"
                    value={expense.category}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Gas">Gas</option>
                    <option value="Bills">Bills</option>
                </select>
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={expense.price}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="date"
                    value={expense.date}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={expense.description}
                    onChange={handleChange}
                />
                <button type="submit">{editMode ? 'Update' : 'Add'} Expense</button>
            </form>
            <ul>
                {expenses.map(expense => (
                    <li key={expense._id}>
                        {expense.name}: ${expense.price} - {new Date(expense.date).toLocaleDateString()} - {expense.description}
                        <button onClick={() => handleEdit(expense)}>Edit</button>
                        <button onClick={() => handleDelete(expense._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExpensePage;
