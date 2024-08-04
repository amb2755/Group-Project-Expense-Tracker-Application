//include dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const port = process.env.PORT || 3000;
var loggedInUserID = -1;
var activeExpense = -1;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/frontend/views'));
app.use(express.static(__dirname + '/frontend/static'));

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"));

//connects to mongoDB database
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

const emptyExpense = new Expense({
  name: "",
  category: "",
  price: -1,
  date: new Date(),
  description: ""
});

module.exports = User;

app.get("/", function(req, res){
    res.render('LoginScreen', {loginTitle: ""});
});


app.post("/", function(req, res) {
    //gets login information
    var newUsername = (req.body.usernameInput).toLowerCase();
    var newPassword = req.body.passwordInput;
    var newAccount = typeof req.body.newAccountSwitch !== 'undefined';

    const newUser = new User({
      username: newUsername,
      password: newPassword,
      expenses: []
    });

    User.findOne({username: newUsername}).then((data) => {
      //if user tries to make new account
      if (data === null && newAccount)
      {
        loggedInUserID = newUser._id;
        User.insertMany([newUser]);
        res.redirect("/home");

      }
      //if user tries to log into existing account
      else if (data !== null && data.password === newPassword && !newAccount)
      {
        loggedInUserID = data._id;
        res.redirect("/home");
      }
      else
      {
        //renders if login unsuccessful
        res.render('LoginScreen', {loginTitle: "Invalid info, please try again"});
      }
    });
});

app.get("/home", function(req, res) {


    //checks if user is logged in first
    if (loggedInUserID === -1)
    {
      res.redirect("/");
    }

    var sort = sortUpDown == "down" ? '▼' : '▲';

    //gets user and loads there expenses by passing array to ejs
    User.findOne({_id: loggedInUserID}).then((data) => {
        //checks if expense array can be filled
        let expenses = data == [] ? [] : data.expenses;

        if (activeExpense == -1)
        {
          res.render('ExpenseHomeScreen', {expenseArray: expenses, expense: emptyExpense,
            sort: sort, username: data.username});
        }
        else {
          res.render('ExpenseHomeScreen', {expenseArray: expenses, expense: activeExpense,
            sort: sort, username: data.username});
          activeExpense = -1;
        }

    });

});

app.post("/addExpense", function(req, res) {
  //gets new expense values and ensures default values are added if empty
  var name = req.body.nameInput != "" ? req.body.nameInput : "None";
  var category = req.body.categoryInput;
  var price = req.body.priceInput != "" ? req.body.priceInput : 0;
  var date = req.body.dateInput != "" ? req.body.dateInput : new Date();
  var description = req.body.descriptionInput;


  const newExpense = new Expense({
    name: name,
    category: category,
    price: price,
    date: date,
    description: description
  });

  try {
    //adds expense to logined in user
    User.findOne({_id: loggedInUserID}).then((data) => {
      data.expenses.push(newExpense);
      data.save();
      res.redirect("/home");
    });
  } catch (error) {
      res.redirect("/home");
  }



});

//function for editing or deleteing functions
app.post("/editEntry", function(req, res) {
  //expense id to be deleted
  var expenseID = req.body.modifyButton.split(',')[1];
  //determines if it is being edited or delete, 1 is edit 2 is delete
  var editOrDelete = Array.from(req.body.modifyButton)[0];

  //gets user logged in
  User.findOne({_id: loggedInUserID}).then((data) => {

    //goes through expenses arrary and finds expense
    for (expenseIndex = 0; expenseIndex < data.expenses.length; ++expenseIndex)
    {
      //if expense found delete expense
      if (data.expenses[expenseIndex]._id == expenseID)
      {
        if (editOrDelete == 1)
        {
          //adds expense to be edited into input fields
          activeExpense = data.expenses[expenseIndex];
        }
        data.expenses.splice(expenseIndex, 1);
        data.save();
        res.redirect("/home");
      }
    }
  });
});

//var for determining if list should be sorted low -> high or high -> low
var sortUpDown = "down";
app.post("/sort", function(req, res) {
  //gets the button that was clicked
  var sortChoice = req.body.sortButton;


  //finds logged in user
  User.findOne({_id: loggedInUserID}).then((data) => {
      //sorts array by what the user selected from lowest to highest
      switch (sortChoice) {
        case "name":
          if (sortUpDown === "down")
          {
            data.expenses.sort((a, b) => b.name.localeCompare(a.name));
            sortUpDown = "up";
          }
          else {
            data.expenses.sort((b, a) => b.name.localeCompare(a.name));
            sortUpDown = "down";
          }
          break;
        case "category":
          if (sortUpDown === "down")
          {
            data.expenses.sort((a, b) => b.category.localeCompare(a.category));
            sortUpDown = "up";
          }
          else {
            data.expenses.sort((b, a) => b.category.localeCompare(a.category));
            sortUpDown = "down";
          }
          break;
        case "amount":
          if (sortUpDown === "down")
          {
            data.expenses.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            sortUpDown = "up";
          }
          else {
            data.expenses.sort((b, a) => parseFloat(b.price) - parseFloat(a.price));
            sortUpDown = "down";
          }
          break;
        case "date":
          if (sortUpDown === "down")
          {
            data.expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
            sortUpDown = "up";
          }
          else {
            data.expenses.sort((b, a) => b.date.getTime() - a.date.getTime());
            sortUpDown = "down";
          }
          break;
        default:
          console.log("Unknown sort method");
      }
      //saves data and reloads page
      data.save();
      res.redirect("/home");
  });

});

//menu options, navigates between each ejs page
app.post("/menu", function(req, res) {
  var page = req.body.menuButton;

  /*
  home
  visual
  monthly
  logout
  */

  switch (page) {
    case "home":
      res.redirect("/home");
      break;
    case "visual":
      res.redirect("/visual");
      break;
    case "monthly":
      res.redirect("/monthly");
      break;
    case "logout":
      loggedInUserID = -1;
      res.redirect("/");
      break;
    default:
      console.log("Unknown menu clicked");
  }
});

//items user inputted
var reportedDate = "every month";
var reportedCategory = "all";
var chartType = "bar";
app.get("/monthly", function(req, res) {

    //checks if user is logged in first
    if (loggedInUserID === -1)
    {
      res.redirect("/");
    }



    //gets user
    User.findOne({_id: loggedInUserID}).then((data) => {
      //declare varibales to be used such as getting user expenses
      let expenses = data.expenses.sort((a, b) => a.date.getTime() - b.date.getTime());
      //arrays for user categories and months
      let categories = [];
      let months = [];
      //used to sort dates
      let monthsAndYears = [];

      //list that will be displayed to user
      let sortedExpense = [];

      //loops through expenses finding what the user can sort by
      for (var index = 0; index < expenses.length; ++index)
      {
          //checks if category option has been added
          if(categories.indexOf(expenses[index].category) === -1) {
            categories.push(expenses[index].category);
          }

          //checks if date option has been added
          var compareDate = expenses[index].date.getMonth() + ""
            + expenses[index].date.getFullYear()

          if(months.indexOf(expenses[index].date) === -1 &&
            monthsAndYears.indexOf(compareDate) === -1)
          {
            months.push(expenses[index].date);
            monthsAndYears.push(expenses[index].date.getMonth() + "" +
                                  expenses[index].date.getFullYear());
          }

      }

      //changes type depending on if date is entered or not
      if (reportedDate !== "every month") {
        reportedDate = new Date(reportedDate);
      }

      //loops through expenses using user preferences set and load items into sortedExpense
      for (var index = 0; index < expenses.length; ++index)
      {

        if (( reportedDate == "every month" ||
            (expenses[index].date.getMonth() === reportedDate.getMonth()
            && expenses[index].date.getFullYear() === reportedDate.getFullYear())) &&
            (reportedCategory.includes(expenses[index].category) || reportedCategory == "all"))
              {
                sortedExpense.push(expenses[index])
              }

      }

      //sets how date will be displayed in header of report
      let viewDate = "";
      if (reportedDate !== "every month")
      {
        viewDate = ((reportedDate.getMonth() + 1) + "/" + reportedDate.getFullYear());
      }
      else {
        viewDate = reportedDate;
      }

      //variables for additional information
      var mostCommonCategory;
      var leastCommonCategory;
      //Bills, Groceries, Gas
      var categoryAmounts = [0,0,0];
      var categoryExpenseAmounts = [0,0,0];
      var totalExpese = 0;
      var averagePerExpense = 0;

      //loops through expenses and finds amounts of each category
      for (var index = 0; index < sortedExpense.length; ++index)
      {
        switch (sortedExpense[index].category) {
          case "Bills":
            categoryAmounts[0] += 1;
            categoryExpenseAmounts[0] += Math.trunc(sortedExpense[index].price);
            break;
          case "Groceries":
            categoryAmounts[1] += 1;
            categoryExpenseAmounts[1] += Math.trunc(sortedExpense[index].price);
            break;
          case "Gas":
            categoryAmounts[2] += 1;
            categoryExpenseAmounts[2] += Math.trunc(sortedExpense[index].price);
            break;
          default:
            console.log("No category found");
        }
        totalExpese += sortedExpense[index].price
      }

      //gets average amount spent on each expense
      averagePerExpense = (totalExpese / sortedExpense.length).toFixed(2);

      //finds index of most common category
      mostCommonCategory = categoryExpenseAmounts.indexOf(Math.min.apply(null,
        categoryExpenseAmounts.filter(Boolean)));
      leastCommonCategory = categoryExpenseAmounts.indexOf(Math.min.apply(null,
        categoryExpenseAmounts.filter(Boolean)));
      //Sets most Common Category by finding which index
      switch (mostCommonCategory) {
        case 0:
          mostCommonCategory = "Bills"
          break;
        case 1:
          mostCommonCategory = "Groceries"
          break;
        case 2:
          mostCommonCategory = "Gas"
          break;
        default:
          console.log("No Most Common");
      }

      //Sets least Common Category by finding which index
      switch (leastCommonCategory) {
        case 0:
          leastCommonCategory = "Bills"
          break;
        case 1:
          leastCommonCategory = "Groceries"
          break;
        case 2:
          leastCommonCategory = "Gas"
          break;
        default:
          console.log("No least Common");
      }

      //creates info to be passed to front end
      var reportInfo = [mostCommonCategory, leastCommonCategory, totalExpese.toFixed(2), averagePerExpense];

      //render mothly screen with graph
      res.render('MonthlyReportScreen', {expenseArray: sortedExpense,
        categoryArray: categories, monthArray: months,
        selectedCategory: reportedCategory, selectedDate: viewDate,
        reportInfo: reportInfo, chartType: chartType,
        categoryExpenseAmounts: categoryExpenseAmounts,
        reportedDate: reportedDate});
    });

});

app.post("/monthlyReport", function(req, res)
{
  reportedDate = req.body.monthInput;
  reportedCategory = req.body.categoryInput;
  chartType = req.body.graphInput;

  res.redirect("/monthly");
});


app.get("/visual", function(req, res) {

    //checks if user is logged in first
    if (loggedInUserID === -1)
    {
      res.redirect("/");
    }

    //gets user
    User.findOne({_id: loggedInUserID}).then((data) => {
        let expenses = data.expenses;



        res.render('VisualReportScreen');
    });

});

//Says which port to listen to
app.listen(port, function(){
  console.log("Server started");
});
