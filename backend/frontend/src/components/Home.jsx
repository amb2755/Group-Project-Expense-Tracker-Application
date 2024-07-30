import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Import the CSS file for styling

const Home = () => {
    return (
        <div className="home-container">
            <h1>Welcome to the Expense Tracker</h1>
            <nav>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link to="/monthly-reports">Monthly Reports</Link>
                <Link to="/visual-reports">Visual Reports</Link>
            </nav>
        </div>
    );
}

export default Home;

