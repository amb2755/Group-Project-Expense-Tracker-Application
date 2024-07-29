// Import required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Failed to connect to MongoDB:', err));

// Define the user schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    expenses: [{
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true },
        description: { type: String }
    }]
});
const User = mongoose.model('User', userSchema);

let loggedInUserID = -1;

// Serve the frontend app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle login and registration
app.post("/", (req, res) => {
    const newUsername = req.body.usernameInput.toLowerCase();
    const newPassword = req.body.passwordInput;
    const newAccount = typeof req.body.newAccountSwitch !== 'undefined';

    const newUser = new User({ username: newUsername, password: newPassword, expenses: [] });

    User.findOne({ username: newUsername }).then((data) => {
        if (data === null && newAccount) {
            // Register a new user
            newUser.save((err) => {
                if (err) {
                    res.render('LoginScreen', { loginTitle: "Registration failed, please try again" });
                } else {
                    loggedInUserID = newUser._id;
                    res.redirect("/home");
                }
            });
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

// Serve other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

