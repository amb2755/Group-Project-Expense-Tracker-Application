import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import LoginScreen from './views/LoginScreen';
import RegisterScreen from './views/RegisterScreen';
import MonthlyReportsScreen from './views/MonthlyReportsScreen';
import VisualReportScreen from './views/VisualReportScreen';
import ExpensePage from './views/ExpensePage';

const App = () => {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link to="/expenses">Expenses</Link>
                <Link to="/monthly-reports">Monthly Reports</Link>
                <Link to="/visual-reports">Visual Reports</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
                <Route path="/expenses" element={<ExpensePage />} />
                <Route path="/monthly-reports" element={<MonthlyReportsScreen />} />
                <Route path="/visual-reports" element={<VisualReportScreen />} />
            </Routes>
        </Router>
    );
}

export default App;
