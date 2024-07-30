import React, { useState } from 'react';
import axios from 'axios';

const LoginScreen = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [newAccount, setNewAccount] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prevCredentials => ({
            ...prevCredentials,
            [name]: value
        }));
    };

    const handleCheckboxChange = () => {
        setNewAccount(prevState => !prevState);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = newAccount ? '/api/auth/register' : '/api/auth/login';
        axios.post(endpoint, {
            usernameInput: credentials.username,
            passwordInput: credentials.password,
            newAccountSwitch: newAccount
        })
            .then(response => {
                if (response.data.message === 'Login successful' || response.data.message === 'Registration successful') {
                    window.location.href = '/';
                } else {
                    setErrorMessage(response.data.message);
                }
            })
            .catch(error => {
                setErrorMessage('An error occurred, please try again later.');
                console.error('Login/Register error:', error);
            });
    };

    return (
        <div>
            <h1>{errorMessage || 'Login'}</h1>
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
                <label>
                    <input
                        type="checkbox"
                        checked={newAccount}
                        onChange={handleCheckboxChange}
                    />
                    Register new account
                </label>
                <button type="submit">{newAccount ? 'Register' : 'Login'}</button>
            </form>
        </div>
    );
};

export default LoginScreen;
