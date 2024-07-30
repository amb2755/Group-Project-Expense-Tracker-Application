import React, { useState, useEffect } from 'react';

const ExpenseHomeScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [expense, setExpense] = useState({
    name: '',
    category: 'Groceries',
    price: '',
    date: '',
    description: ''
  });

  useEffect(() => {
    // Fetch expenses from the server
    fetch('/api/expenses')
      .then(response => response.json())
      .then(data => setExpenses(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prevExpense => ({
      ...prevExpense,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add expense logic
  };

  return (
    <div>
      <h3>Hello User</h3>

      <form onSubmit={handleSubmit}>
        <div className="entry">
          <input
            name="name"
            placeholder="Name"
            value={expense.name}
            onChange={handleChange}
            autoComplete="off"
          />
          <select
            name="category"
            value={expense.category}
            onChange={handleChange}
          >
            <option value="Groceries">Groceries</option>
            <option value="Gas">Gas</option>
            <option value="Bills">Bills</option>
          </select>
          <input
            name="price"
            placeholder="$0.00"
            value={expense.price}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            name="date"
            type="date"
            value={expense.date}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            name="description"
            placeholder="Description"
            value={expense.description}
            onChange={handleChange}
            autoComplete="off"
          />
          <button type="submit">Add Expense</button>
        </div>
      </form>

      <table className="entryTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
            <th>Edit/Delete</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, index) => (
            <tr key={index}>
              <td>{exp.name}</td>
              <td>{exp.category}</td>
              <td>{exp.price}</td>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>{exp.description}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseHomeScreen;
