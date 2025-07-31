import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CssFiles/RegistrationForm.css';
import { register } from '../Services/Apis';





function RegistrationForm() {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    role: 'USER',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    register(formData)
      .then((res) => {
        alert('User registered successfully!');
         navigate('/login'); 
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          address: '',
          username: '',
          password: '',
          role: 'USER',
        });
      })
      .catch((err) => {
        console.error(err);
        alert('Registration failed!');
      });
      
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>

      <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
      <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
      <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
      <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

    
      <input type="text" name="role" value={formData.role} readOnly />

      <button type="submit">Register</button>
    </form>
  );
}

export default RegistrationForm;
