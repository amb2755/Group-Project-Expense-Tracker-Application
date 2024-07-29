// Import required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

console.log('MONGO_URI:', mongoURI);

let loggedInUserID = -1;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
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

// Serve the login page
app.get("/", (req, res) => {
    res.render('LoginScreen', { loginTitle: "Please enter your credentials" });
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

// Serve the monthly report page
app.get("/monthly", (req, res) => {
    res.render('MonthlyReportScreen');
});

// Serve the visual report page
app.get("/visual", (req, res) => {
    res.render('VisualReportScreen');
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
    const choice = req.body.menuButton;
    switch (choice) {
        case 'home':
            res.redirect('/home');
            break;
        case 'visual':
            res.redirect('/visual');
            break;
        case 'monthly':
            res.redirect('/monthly');
            break;
        case 'logout':
            loggedInUserID = -1;
            res.redirect('/');
            break;
        default:
            res.redirect('/');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
