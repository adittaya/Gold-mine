import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RegisterContainer = styled.div`
  max-width: 400px;
  margin: 60px auto;
  padding: 20px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const Form = styled.form`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
`;

const SuccessText = styled.p`
  color: #27ae60;
  text-align: center;
  margin-top: 10px;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const StyledLink = styled(Link)`
  color: #6a11cb;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    referralCode: ''  // Optional referral code
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      const { token, user } = response.data;
      
      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        login(user, token);
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(RegisterContainer, null,
    React.createElement(Title, null, 'Create Your Account'),
    React.createElement(Form, { onSubmit: handleSubmit },
      React.createElement(FormGroup, null,
        React.createElement(Label, { htmlFor: "name" }, 'Full Name'),
        React.createElement(Input, {
          type: "text",
          id: "name",
          name: "name",
          value: formData.name,
          onChange: handleChange,
          placeholder: "Enter your full name",
          required: true
        })
      ),
      
      React.createElement(FormGroup, null,
        React.createElement(Label, { htmlFor: "mobile" }, 'Mobile Number'),
        React.createElement(Input, {
          type: "tel",
          id: "mobile",
          name: "mobile",
          value: formData.mobile,
          onChange: handleChange,
          placeholder: "Enter your mobile number",
          required: true
        })
      ),
      
      React.createElement(FormGroup, null,
        React.createElement(Label, { htmlFor: "password" }, 'Password'),
        React.createElement(Input, {
          type: "password",
          id: "password",
          name: "password",
          value: formData.password,
          onChange: handleChange,
          placeholder: "Enter your password",
          required: true
        })
      ),
      
      React.createElement(FormGroup, null,
        React.createElement(Label, { htmlFor: "confirmPassword" }, 'Confirm Password'),
        React.createElement(Input, {
          type: "password",
          id: "confirmPassword",
          name: "confirmPassword",
          value: formData.confirmPassword,
          onChange: handleChange,
          placeholder: "Confirm your password",
          required: true
        })
      ),
      
      React.createElement(FormGroup, null,
        React.createElement(Label, { htmlFor: "referralCode" }, 'Referral Code (Optional)'),
        React.createElement(Input, {
          type: "text",
          id: "referralCode",
          name: "referralCode",
          value: formData.referralCode,
          onChange: handleChange,
          placeholder: "Enter referral code (if any)"
        })
      ),
      
      error && React.createElement(ErrorText, null, error),
      success && React.createElement(SuccessText, null, success),
      
      React.createElement(Button, { type: "submit", disabled: loading },
        loading ? 'Creating Account...' : 'Register'
      )
    ),
    
    React.createElement(LinkContainer, null,
      React.createElement('p', null,
        'Already have an account? ',
        React.createElement(StyledLink, { to: "/login" }, 'Login now')
      )
    )
  );
};

export default RegisterPage;