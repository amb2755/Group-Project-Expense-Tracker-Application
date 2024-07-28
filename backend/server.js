// Import required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Set the port to the environment variable PORT or 3000

const mongoURI = process.env.MONGO_URI; // Ensure the MongoDB URI is set

console.log('MONGO_URI:', mongoURI); // Debug: print the MongoDB URI to ensure it's loaded

let loggedInUserID = -1; // Variable to store the ID of the logged-in user

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, '../frontend/build'))); // Serve static files from the frontend build directory

// Connect to MongoDB using the connection string in the .env file
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Could not connect to MongoDB:', error));

// Define the expense schema
const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    description: { type: String }
});

// Define the user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    expenses: [expenseSchema]
});

// Create models for User and Expense based on the schemas
const User = mongoose.model('User', userSchema);
const Expense = mongoose.model('Expense', expenseSchema);

// Define route handlers

// Serve the frontend application
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Handle login and registration
app.post("/", (req, res) => {
    const newUsername = req.body.usernameInput.toLowerCase();
    const newPassword = req.body.passwordInput;
    const newAccount = typeof req.body.newAccountSwitch !== 'undefined';

    const newUser = new User({ username: newUsername, password: newPassword, expenses: [] });

    User.findOne({ username: newUsername }).then((data) => {
        if (data === null && newAccount) {
            // Register a new user
            loggedInUserID = newUser._id;
            User.insertMany([newUser]);
            res.redirect("/home");
        } else if (data !== null && data.password === newPassword && !newAccount) {
            // Login existing user
            loggedInUserID = data._id;
            res.redirect("/home");
        } else {
            // Invalid login or registration attempt
            res.render('LoginScreen', { loginTitle: "Invalid info, please try again" });
        }
    });
});

// Serve the home page showing the user's expenses
app.get("/home", (req, res) => {
    if (loggedInUserID === -1) {
        res.redirect("/");
    } else {
        User.findOne({ _id: loggedInUserID }).then((data) => {
            const expenses = data.expenses;
            res.render('ExpenseHomeScreen', { expenseArray: expenses });
        });
    }
});

// Handle adding a new expense
app.post("/addExpense", (req, res) => {
    const newExpense = new Expense({
        name: req.body.nameInput,
        category: req.body.categoryInput,
        price: req.body.priceInput,
        date: req.body.dateInput,
        description: req.body.descriptionInput
    });

    User.findOne({ _id: loggedInUserID }).then((data) => {
        data.expenses.push(newExpense);
        data.save();
        res.redirect("/home");
    });
});

// Handle deleting an expense
app.post("/deleteExpense", (req, res) => {
    const expenseID = req.body.deleteEntry;

    User.findOne({ _id: loggedInUserID }).then((data) => {
        data.expenses = data.expenses.filter(expense => expense._id != expenseID);
        data.save().then(() => res.redirect("/home"));
    });
});

// Handle sorting expenses
app.post("/sort", (req, res) => {
    const sortChoice = req.body.sortButton;

    User.findOne({ _id: loggedInUserID }).then((data) => {
        switch (sortChoice) {
            case "name":
                data.expenses.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "category":
                data.expenses.sort((a, b) => b.category.localeCompare(a.category));
                break;
            case "amount":
                data.expenses.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case "date":
                data.expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
                break;
            default:
                console.log("Unknown sort method");
        }
        data.save().then(() => res.redirect("/home"));
    });
});

// Handle user logout
app.post("/menu", (req, res) => {
    loggedInUserID = -1;
    res.redirect("/");
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../front
