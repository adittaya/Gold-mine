import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { dashboardAPI } from '../services/api';

const DashboardContainer = styled.div`
  padding: 20px 0;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const ActionButton = styled(Link)`
  display: block;
  background: white;
  color: #333;
  padding: 15px;
  text-align: center;
  text-decoration: none;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  &:nth-child(1) {
    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  }
  
  &:nth-child(2) {
    background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  }
  
  &:nth-child(3) {
    background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
  }
  
  &:nth-child(4) {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  }
  
  &:nth-child(5) {
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  }
`;

const ShareSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

const ShareButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState({
    balance: 0,
    totalInvested: 0,
    totalWithdrawn: 0,
    totalEarnings: 0,
    activePlans: 0,
    referralLink: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(stats.referralLink)
      .then(() => alert('Referral link copied to clipboard!'))
      .catch(err => console.error('Failed to copy referral link:', err));
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      
      <StatsGrid>
        <StatCard>
          <StatValue>₹{stats.balance.toLocaleString()}</StatValue>
          <StatLabel>Wallet Balance</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>₹{stats.totalInvested.toLocaleString()}</StatValue>
          <StatLabel>Total Invested</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>₹{stats.totalEarnings.toLocaleString()}</StatValue>
          <StatLabel>Total Earnings</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.activePlans}</StatValue>
          <StatLabel>Active Plans</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <QuickActions>
        <ActionButton to="/plans">
          <div>💼</div>
          <div>Buy Plans</div>
        </ActionButton>
        <ActionButton to="/recharge">
          <div>💰</div>
          <div>Recharge</div>
        </ActionButton>
        <ActionButton to="/withdraw">
          <div>💸</div>
          <div>Withdraw</div>
        </ActionButton>
        <ActionButton to="/transactions">
          <div>📊</div>
          <div>Transactions</div>
        </ActionButton>
      </QuickActions>
      
      <ShareSection>
        <h3>Share & Earn</h3>
        <p>Share your referral link and earn when others join!</p>
        <p><strong>Your Referral Link:</strong> {stats.referralLink}</p>
        <ShareButton onClick={copyReferralLink}>Copy Referral Link</ShareButton>
      </ShareSection>
    </DashboardContainer>
  );
};

export default DashboardPage;