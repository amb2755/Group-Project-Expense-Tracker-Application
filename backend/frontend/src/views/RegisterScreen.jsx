import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterScreen = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prevCredentials => ({
            ...prevCredentials,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/auth/register', credentials)
            .then(response => {
                if (response.data.message === 'Registration successful') {
                    navigate('/login');
                } else {
                    setErrorMessage(response.data.message);
                }
            })
            .catch(error => {
                setErrorMessage('An error occurred, please try again later.');
                console.error('Registration error:', error);
            });
    };

    return (
        <div>
            <h1>Register</h1>
            {errorMessage && <p>{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={handleChange}
                    autoComplete="off"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    autoComplete="off"
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterScreen;
