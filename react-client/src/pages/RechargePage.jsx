import React, { useState } from 'react';
import styled from 'styled-components';
import { rechargeAPI } from '../services/api';

const RechargeContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const UpiInfo = styled.div`
  background: #e3f2fd;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  text-align: center;
`;

const UpiId = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin: 10px 0;
  color: #1976d2;
`;

const CopyButton = styled.button`
  background: #1976d2;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const RechargeForm = styled.div`
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

const RechargePage = () => {
  const [formData, setFormData] = useState({
    amount: '',
    utr: ''
  });
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const suggestedAmounts = [1000, 2000, 5000, 10000, 25000, 50000];

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText('7047571829@upi')
      .then(() => alert('UPI ID copied to clipboard!'))
      .catch(err => console.error('Failed to copy UPI ID:', err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Basic validation
    if (!formData.amount || !formData.utr) {
      setMessage('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setMessage('Please enter a valid amount');
      setLoading(false);
      return;
    }
    
    try {
      const response = await rechargeAPI.request(formData);
      setMessage('Recharge request submitted successfully! It will be processed shortly.');
      setFormData({ amount: '', utr: '' });
      setSelectedAmount(null);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Recharge request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RechargeContainer>
      <Title>Recharge Wallet</Title>
      
      <UpiInfo>
        <h3>Payment Instructions</h3>
        <p>Transfer money to the following UPI ID:</p>
        <UpiId>7047571829@upi</UpiId>
        <CopyButton onClick={copyToClipboard}>Copy UPI ID</CopyButton>
        <p>After making the payment, enter the UTR (Unique Transaction Reference) number below</p>
      </UpiInfo>
      
      <RechargeForm>
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
            placeholder="Enter custom amount"
            min="1"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>UTR Number</Label>
          <Input
            type="text"
            name="utr"
            value={formData.utr}
            onChange={handleChange}
            placeholder="Enter UTR number from your payment app"
          />
        </FormGroup>
        
        <SubmitButton 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Submit Recharge Request'}
        </SubmitButton>
        
        {message && (
          <Message type={message.includes('successfully') ? 'success' : 'error'}>
            {message}
          </Message>
        )}
      </RechargeForm>
    </RechargeContainer>
  );
};

export default RechargePage;