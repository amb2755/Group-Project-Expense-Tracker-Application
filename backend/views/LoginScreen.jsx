import React, { useState } from 'react';

const LoginScreen = () => {
const [credentials, setCredentials] = useState({ username: '', password: '' });

const handleChange = (e) => {
const { name, value } = e.target;
setCredentials(prevCredentials => ({
...prevCredentials,
[name]: value
}));
};

const handleSubmit = (e) => {
e.preventDefault();
// Login logic
};

return (
<div>
	<h1>Login</h1>
	<form onSubmit={"handleSubmit"}>
		<input
          type="text"
          name="username"
          placeholder="Username"
          value={"credentials.username"
          onChange={"handleChange"
          autoComplete="off"
        />
		<input
          type="password"
          name="password"
          placeholder="Password"
          value={"credentials.password"
          onChange={"handleChange"
          autoComplete="off"
        />
		<button type="submit">Login</button>
	</form>
</div>
);
};

export default LoginScreen;
