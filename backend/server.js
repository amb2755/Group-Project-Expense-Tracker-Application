//include dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');

const port = process.env.PORT || 3001;
var loggedInUserID = -1;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/expenseDB", {useNewUrlParser: true});

// Define the expense schema //
const expenseSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    category: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    price: {
        type: Number,
        required: [true, "Check entry, ensure all fields complete"],
        min: 0
    },
    date: {
        type: Date,
        required: [true, "Check entry, ensure all fields complete"]
    },
    description: {
        type: String
    }
});

// Define the user schema //
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    password: {
        type: String,
        required: [true, "Check entry, ensure all fields complete"]
    },
    expenses: [expenseSchema] // Embed the expense schema as an array
});

// Create the user model //
const User = mongoose.model('User', userSchema);
//create expense model
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = User;

app.get("/", function(req, res){
    // res.sendFile(__dirname + "/frontend/EjsScreens/LoginScreen.ejs");
    res.render('LoginScreen', {loginTitle: ""});
});

//adds new item to list
app.post("/", function(req, res) {
    var newUsername = (req.body.usernameInput).toLowerCase();
    var newPassword = req.body.passwordInput;
    var newAccount = typeof req.body.newAccountSwitch !== 'undefined';

    const newUser = new User({
      username: newUsername,
      password: newPassword,
      expenses: []
    });

    User.findOne({username: newUsername}).then((data) => {
      if (data === null && newAccount)
      {
        loggedInUserID = newUser._id;
        User.insertMany([newUser]);
        res.redirect("/home");

      }
      else if (data !== null && data.password === newPassword && !newAccount)
      {
        loggedInUserID = data._id;
        res.redirect("/home");
      }
      else
      {
        //renders lists of items todo
        res.render('LoginScreen', {loginTitle: "Invalid info, please try again"});
      }
    });
});

app.get("/home", function(req, res) {

    if (loggedInUserID === -1)
    {
      res.redirect("/");
    }

    let expenses = [];

    User.findOne({_id: loggedInUserID}).then((data) => {
        expenses = data.expenses;

        res.render('ExpenseHomeScreen', {expenseArray: expenses});
    });

});

app.post("/addExpense", function(req, res) {
  //implement home button functionality
  var name = req.body.nameInput;
  var category = req.body.categoryInput;
  var price = req.body.priceInput;
  var date = req.body.dateInput;
  var description = req.body.descriptionInput;

  const newExpense = new Expense({
    name: name,
    category: category,
    price: price,
    date: date,
    description: description
  });

  //adds expense to logined in user
  User.findOne({_id: loggedInUserID}).then((data) => {
    data.expenses.push(newExpense);
    data.save();
  });

  res.redirect("/home");

});

app.post("/deleteExpense", function(req, res) {
  //expense id to be deleted
  var expenseID = req.body.deleteEntry;

  //gets user logged in
  User.findOne({_id: loggedInUserID}).then((data) => {

    //goes through expenses arrary and finds expense
    for (expenseIndex = 0; expenseIndex < data.expenses.length; ++expenseIndex)
    {
      //if expense found delete expense
      if (data.expenses[expenseIndex]._id == expenseID)
      {
        data.expenses.splice(expenseIndex, 1);
        data.save();
        res.redirect("/home");
      }
    }
    console.log("Failed to delete");
  });
});

app.post("/sort", function(req, res) {
  var sortChoice = req.body.sortButton;
  /*
  name
  category
  amount
  date
  */

  console.log(sortChoice);
  User.findOne({_id: loggedInUserID}).then((data) => {
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
          data.expenses.sort((a, b) => a.date.getTime() - b.date.getTime());
          break;
        default:
          console.log("Unknown sort method");
      }

      data.save();
      res.redirect("/home");
  });

});

//Says which port to listen to
app.listen(3000, function(){
  console.log("Server started");
});
