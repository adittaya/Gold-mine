import React, { useState } from 'react';
import styled from 'styled-components';
import { withdrawAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const WithdrawContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const BalanceInfo = styled.div`
  background: #e8f5e9;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
`;

const BalanceAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2e7d32;
`;

const WithdrawForm = styled.div`
  background: white;
  padding: 25px;
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

const Select = styled.select`
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

const AmountButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin: 15px 0;
`;

const AmountButton = styled.button`
  padding: 10px;
  background: ${props => props.selected ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : '#f5f5f5'};
  color: ${props => props.selected ? 'white' : '#333'};
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  text-align: center;
  padding: 15px;
  margin-top: 20px;
  border-radius: 5px;
  color: ${props => props.type === 'success' ? '#27ae60' : '#e74c3c'};
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`;

const WithdrawPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    method: 'upi', // Default to UPI
    details: '' // Account number for bank, UPI ID for UPI
  });
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const suggestedAmounts = [1000, 2000, 5000, 10000];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear the selected amount when user types in amount field
    if (e.target.name === 'amount') {
      setSelectedAmount(null);
    }
    
    setMessage(''); // Clear message when form changes
  };

  const handleAmountSelect = (amount) => {
    setFormData({
      ...formData,
      amount: amount.toString()
    });
    setSelectedAmount(amount);
    setMessage(''); // Clear message when amount is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Basic validation
    if (!formData.amount || !formData.method || !formData.details) {
      setMessage('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setMessage('Please enter a valid amount');
      setLoading(false);
      return;
    }
    
    // Validate against user's balance
    if (user && parseFloat(formData.amount) > user.balance) {
      setMessage('Insufficient balance for this withdrawal');
      setLoading(false);
      return;
    }
    
    try {
      const response = await withdrawAPI.request(formData);
      setMessage(`Withdrawal request submitted successfully! After 3% GST, you'll receive ₹${response.data.withdrawal.netAmount}. It will be processed within 24 hours.`);
      setFormData({ amount: '', method: 'upi', details: '' });
      setSelectedAmount(null);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Withdrawal request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithdrawContainer>
      <Title>Withdraw Funds</Title>
      
      <BalanceInfo>
        <p>Your current balance:</p>
        <BalanceAmount>₹{user?.balance?.toLocaleString() || '0.00'}</BalanceAmount>
        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Note: Only one withdrawal allowed per 24 hours</p>
      </BalanceInfo>
      
      <WithdrawForm>
        <FormGroup>
          <Label>Amount (₹)</Label>
          <AmountButtons>
            {suggestedAmounts.map(amount => (
              <AmountButton
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                selected={selectedAmount === amount}
              >
                ₹{amount}
              </AmountButton>
            ))}
          </AmountButtons>
          <Input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter withdrawal amount"
            min="1"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Withdrawal Method</Label>
          <Select
            name="method"
            value={formData.method}
            onChange={handleChange}
          >
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          {formData.method === 'upi' ? (
            <>
              <Label>UPI ID</Label>
              <Input
                type="text"
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Enter UPI ID (e.g., yourupi@bank)"
              />
            </>
          ) : (
            <>
              <Label>Bank Details</Label>
              <Input
                type="text"
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Enter account number"
              />
            </>
          )}
        </FormGroup>
        
        <SubmitButton 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Submit Withdrawal Request'}
        </SubmitButton>
        
        {message && (
          <Message type={message.includes('successfully') ? 'success' : 'error'}>
            {message}
          </Message>
        )}
      </WithdrawForm>
    </WithdrawContainer>
  );
};

export default WithdrawPage;