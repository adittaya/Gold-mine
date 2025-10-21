import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { rechargeAPI, withdrawAPI } from '../services/api';

const TransactionsContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  border-radius: 5px 5px 0 0;
  margin-right: 5px;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const TransactionList = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TransactionItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.div`
  font-weight: bold;
  color: #333;
`;

const TransactionDate = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-top: 5px;
`;

const TransactionAmount = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${props => props.type === 'credit' ? '#27ae60' : '#e74c3c'};
`;

const TransactionStatus = styled.span`
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  background: ${props => {
    if (props.status === 'approved') return '#d4edda';
    if (props.status === 'pending') return '#fff3cd';
    return '#f8d7da';
  }};
  color: ${props => {
    if (props.status === 'approved') return '#155724';
    if (props.status === 'pending') return '#856404';
    return '#721c24';
  }};
`;

const Message = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState('recharge'); // 'recharge' or 'withdraw'
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    try {
      const [rechargeResponse, withdrawalResponse] = await Promise.all([
        rechargeAPI.getHistory(),
        withdrawAPI.getHistory()
      ]);
      
      setRechargeHistory(rechargeResponse.data);
      setWithdrawalHistory(withdrawalResponse.data);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRechargeHistory = () => {
    if (loading) return <Message>Loading recharge history...</Message>;
    
    if (rechargeHistory.length === 0) {
      return <Message>No recharge history found.</Message>;
    }
    
    return (
      <TransactionList>
        {rechargeHistory.map(transaction => (
          <TransactionItem key={transaction.id}>
            <TransactionInfo>
              <TransactionTitle>Recharge</TransactionTitle>
              <TransactionDate>{formatDate(transaction.requestedAt)}</TransactionDate>
              <TransactionStatus status={transaction.status}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </TransactionStatus>
            </TransactionInfo>
            <TransactionAmount type="credit">
              +₹{transaction.amount?.toLocaleString() || '0.00'}
            </TransactionAmount>
          </TransactionItem>
        ))}
      </TransactionList>
    );
  };

  const renderWithdrawalHistory = () => {
    if (loading) return <Message>Loading withdrawal history...</Message>;
    
    if (withdrawalHistory.length === 0) {
      return <Message>No withdrawal history found.</Message>;
    }
    
    return (
      <TransactionList>
        {withdrawalHistory.map(transaction => (
          <TransactionItem key={transaction.id}>
            <TransactionInfo>
              <TransactionTitle>Withdrawal</TransactionTitle>
              <TransactionDate>{formatDate(transaction.requestedAt)}</TransactionDate>
              <TransactionStatus status={transaction.status}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </TransactionStatus>
            </TransactionInfo>
            <TransactionAmount type="debit">
              -₹{transaction.amount?.toLocaleString() || '0.00'}
            </TransactionAmount>
          </TransactionItem>
        ))}
      </TransactionList>
    );
  };

  return (
    <TransactionsContainer>
      <Title>Transaction History</Title>
      
      <Tabs>
        <Tab 
          active={activeTab === 'recharge'} 
          onClick={() => setActiveTab('recharge')}
        >
          Recharge History
        </Tab>
        <Tab 
          active={activeTab === 'withdraw'} 
          onClick={() => setActiveTab('withdraw')}
        >
          Withdrawal History
        </Tab>
      </Tabs>
      
      {activeTab === 'recharge' ? renderRechargeHistory() : renderWithdrawalHistory()}
    </TransactionsContainer>
  );
};

export default TransactionsPage;