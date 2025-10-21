import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
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

const LoginPage = () => {
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      
      login(user, token);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Title>Login to Your Account</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter your mobile number"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </FormGroup>
        
        {error && <ErrorText>{error}</ErrorText>}
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
      
      <LinkContainer>
        <p>
          Don't have an account? <StyledLink to="/register">Register now</StyledLink>
        </p>
      </LinkContainer>
    </LoginContainer>
  );
};

export default LoginPage;