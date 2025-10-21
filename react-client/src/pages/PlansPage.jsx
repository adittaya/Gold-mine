import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { plansAPI } from '../services/api';

const PlansContainer = styled.div`
  padding: 20px 0;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const PlanCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const PlanName = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.4rem;
`;

const PlanPrice = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #6a11cb;
  margin: 15px 0;
`;

const PlanFeature = styled.div`
  margin: 10px 0;
  color: #555;
`;

const PurchaseButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 15px;
  width: 100%;
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
  padding: 20px;
  color: #666;
`;

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPlan, setPurchasingPlan] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getAll();
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setMessage('Failed to load plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId) => {
    setPurchasingPlan(planId);
    setMessage('');
    
    try {
      await plansAPI.purchase(planId);
      setMessage('Plan purchased successfully!');
      // In a real app, you might want to update the UI to reflect the purchase
    } catch (error) {
      setMessage(error.response?.data?.error || 'Purchase failed. Please try again.');
    } finally {
      setPurchasingPlan(null);
    }
  };

  if (loading) {
    return <Message>Loading plans...</Message>;
  }

  if (message && !plans.length) {
    return <Message>{message}</Message>;
  }

  return (
    <PlansContainer>
      <Title>Investment Plans</Title>
      
      {message && (
        <Message style={{ color: message.includes('successfully') ? '#27ae60' : '#e74c3c' }}>
          {message}
        </Message>
      )}
      
      <PlansGrid>
        {plans.map(plan => (
          <PlanCard key={plan.id}>
            <PlanName>{plan.name}</PlanName>
            <PlanPrice>₹{plan.price.toLocaleString()}</PlanPrice>
            <PlanFeature>🎯 Daily Income: ₹{plan.dailyIncome.toLocaleString()}</PlanFeature>
            <PlanFeature>💰 Total Return: ₹{plan.totalReturn.toLocaleString()}</PlanFeature>
            <PlanFeature>⏱️ Duration: {plan.duration} days</PlanFeature>
            <PurchaseButton 
              onClick={() => handlePurchase(plan.id)}
              disabled={purchasingPlan === plan.id}
            >
              {purchasingPlan === plan.id ? 'Processing...' : 'Buy Plan'}
            </PurchaseButton>
          </PlanCard>
        ))}
      </PlansGrid>
    </PlansContainer>
  );
};

export default PlansPage;