import React, { useState, useContext } from 'react';
import '../CssFiles/RegistrationForm.css';
import { fetchCurrentUser, login } from '../Services/Apis';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';



function LoginForm() {
  const navigate = useNavigate();
  const {currentUser, updateCurrentUserContext } = useContext(UserContext);


  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await login(credentials);
      const { data } = await fetchCurrentUser();
      updateCurrentUserContext(data);
      navigate("/");
      setSuccess('Login successful!');
      setCredentials({ username: '', password: '' });
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your username or password.');
    }

  };

  if (currentUser) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
      <h2>Access Denied</h2>
      <p>You are already logged in. You cannot access the login page again.</p>
    </div>
  );
}

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>

      <input
        type="text"
        name="username"
        placeholder="Username"
        value={credentials.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={credentials.password}
        onChange={handleChange}
        required
      />

      <button type="submit">Login</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}

export default LoginForm;
