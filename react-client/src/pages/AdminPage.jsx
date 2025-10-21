import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminAPI } from '../services/api';

const AdminContainer = styled.div`
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
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
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #6a11cb;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
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

const ActionButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 0.8rem;
  
  &.approve {
    background: #27ae60;
    color: white;
  }
  
  &.reject {
    background: #e74c3c;
    color: white;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
`;

const TableHeader = styled.th`
  padding: 12px;
  background: #f8f9fa;
  text-align: left;
  font-weight: bold;
  color: #333;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

const Message = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'recharges', 'withdrawals', 'users'
  const [dashboardData, setDashboardData] = useState({});
  const [recharges, setRecharges] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const response = await adminAPI.getDashboard();
        setDashboardData(response.data);
      } else if (activeTab === 'recharges') {
        const response = await adminAPI.getRecharges();
        setRecharges(response.data);
      } else if (activeTab === 'withdrawals') {
        const response = await adminAPI.getWithdrawals();
        setWithdrawals(response.data);
      } else if (activeTab === 'users') {
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      }
    } catch (error) {
      setMessage('Error fetching data. Please try again.');
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecharge = async (id) => {
    try {
      await adminAPI.approveRecharge(id);
      setMessage('Recharge approved successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage('Error approving recharge. Please try again.');
    }
  };

  const handleRejectRecharge = async (id) => {
    try {
      await adminAPI.rejectRecharge(id);
      setMessage('Recharge rejected successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage('Error rejecting recharge. Please try again.');
    }
  };

  const handleApproveWithdrawal = async (id) => {
    try {
      await adminAPI.approveWithdrawal(id);
      setMessage('Withdrawal approved successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage('Error approving withdrawal. Please try again.');
    }
  };

  const handleRejectWithdrawal = async (id) => {
    try {
      await adminAPI.rejectWithdrawal(id);
      setMessage('Withdrawal rejected successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage('Error rejecting withdrawal. Please try again.');
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

  const renderDashboard = () => {
    if (loading) return <Message>Loading dashboard data...</Message>;
    
    return (
      <>
        {message && <Message style={{ color: '#27ae60' }}>{message}</Message>}
        <StatsGrid>
          <StatCard>
            <StatValue>{dashboardData.totalUsers || 0}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{dashboardData.totalPurchases || 0}</StatValue>
            <StatLabel>Total Purchases</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{dashboardData.totalRecharges || 0}</StatValue>
            <StatLabel>Total Recharges</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{dashboardData.totalWithdrawals || 0}</StatValue>
            <StatLabel>Total Withdrawals</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{dashboardData.pendingRecharges || 0}</StatValue>
            <StatLabel>Pending Recharges</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{dashboardData.pendingWithdrawals || 0}</StatValue>
            <StatLabel>Pending Withdrawals</StatLabel>
          </StatCard>
        </StatsGrid>
      </>
    );
  };

  const renderRecharges = () => {
    if (loading) return <Message>Loading recharge requests...</Message>;
    
    if (recharges.length === 0) {
      return <Message>No recharge requests found.</Message>;
    }
    
    return (
      <>
        {message && <Message style={{ color: message.includes('successfully') ? '#27ae60' : '#e74c3c' }}>{message}</Message>}
        <Table>
          <thead>
            <tr>
              <TableHeader>User ID</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>UTR</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {recharges.map(recharge => (
              <TableRow key={recharge.id}>
                <TableCell>{recharge.userId}</TableCell>
                <TableCell>₹{recharge.amount?.toLocaleString() || '0.00'}</TableCell>
                <TableCell>{recharge.utr}</TableCell>
                <TableCell>{formatDate(recharge.requestedAt)}</TableCell>
                <TableCell>
                  <span style={{ 
                    padding: '5px 10px', 
                    borderRadius: '15px',
                    backgroundColor: recharge.status === 'approved' ? '#d4edda' : 
                                   recharge.status === 'pending' ? '#fff3cd' : '#f8d7da',
                    color: recharge.status === 'approved' ? '#155724' : 
                          recharge.status === 'pending' ? '#856404' : '#721c24'
                  }}>
                    {recharge.status.charAt(0).toUpperCase() + recharge.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {recharge.status === 'pending' && (
                    <>
                      <ActionButton 
                        className="approve" 
                        onClick={() => handleApproveRecharge(recharge.id)}
                      >
                        Approve
                      </ActionButton>
                      <ActionButton 
                        className="reject" 
                        onClick={() => handleRejectRecharge(recharge.id)}
                      >
                        Reject
                      </ActionButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  const renderWithdrawals = () => {
    if (loading) return <Message>Loading withdrawal requests...</Message>;
    
    if (withdrawals.length === 0) {
      return <Message>No withdrawal requests found.</Message>;
    }
    
    return (
      <>
        {message && <Message style={{ color: message.includes('successfully') ? '#27ae60' : '#e74c3c' }}>{message}</Message>}
        <Table>
          <thead>
            <tr>
              <TableHeader>User ID</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Method</TableHeader>
              <TableHeader>Details</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(withdrawal => (
              <TableRow key={withdrawal.id}>
                <TableCell>{withdrawal.userId}</TableCell>
                <TableCell>₹{withdrawal.amount?.toLocaleString() || '0.00'}</TableCell>
                <TableCell>{withdrawal.method?.toUpperCase()}</TableCell>
                <TableCell>{withdrawal.details}</TableCell>
                <TableCell>{formatDate(withdrawal.requestedAt)}</TableCell>
                <TableCell>
                  <span style={{ 
                    padding: '5px 10px', 
                    borderRadius: '15px',
                    backgroundColor: withdrawal.status === 'approved' ? '#d4edda' : 
                                   withdrawal.status === 'pending' ? '#fff3cd' : '#f8d7da',
                    color: withdrawal.status === 'approved' ? '#155724' : 
                          withdrawal.status === 'pending' ? '#856404' : '#721c24'
                  }}>
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {withdrawal.status === 'pending' && (
                    <>
                      <ActionButton 
                        className="approve" 
                        onClick={() => handleApproveWithdrawal(withdrawal.id)}
                      >
                        Approve
                      </ActionButton>
                      <ActionButton 
                        className="reject" 
                        onClick={() => handleRejectWithdrawal(withdrawal.id)}
                      >
                        Reject
                      </ActionButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  const renderUsers = () => {
    if (loading) return <Message>Loading users...</Message>;
    
    if (users.length === 0) {
      return <Message>No users found.</Message>;
    }
    
    return (
      <>
        {message && <Message style={{ color: '#27ae60' }}>{message}</Message>}
        <Table>
          <thead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Mobile</TableHeader>
              <TableHeader>Balance</TableHeader>
              <TableHeader>Total Invested</TableHeader>
              <TableHeader>Total Withdrawn</TableHeader>
              <TableHeader>Joined</TableHeader>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>₹{user.balance?.toLocaleString() || '0.00'}</TableCell>
                <TableCell>₹{user.totalInvested?.toLocaleString() || '0.00'}</TableCell>
                <TableCell>₹{user.totalWithdrawn?.toLocaleString() || '0.00'}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  return (
    <AdminContainer>
      <Title>Admin Dashboard</Title>
      
      <Tabs>
        <Tab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </Tab>
        <Tab active={activeTab === 'recharges'} onClick={() => setActiveTab('recharges')}>
          Recharges
        </Tab>
        <Tab active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')}>
          Withdrawals
        </Tab>
        <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          Users
        </Tab>
      </Tabs>
      
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'recharges' && renderRecharges()}
      {activeTab === 'withdrawals' && renderWithdrawals()}
      {activeTab === 'users' && renderUsers()}
    </AdminContainer>
  );
};

export default AdminPage;