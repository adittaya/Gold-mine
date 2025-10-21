import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlansPage from './pages/PlansPage';
import RechargePage from './pages/RechargePage';
import WithdrawPage from './pages/WithdrawPage';
import TransactionsPage from './pages/TransactionsPage';
import AdminPage from './pages/AdminPage';
import GamesPage from './pages/GamesPage';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Set up axios base URL
axios.defaults.baseURL = '/api';

// Global styles
const GlobalContainer = styled.div`
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 80px; /* Space for bottom nav on mobile */
`;

const AppContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return React.createElement(Navigate, { to: "/login", replace: true });
  }
  
  if (adminOnly && !isAdmin) {
    return React.createElement(Navigate, { to: "/dashboard", replace: true });
  }
  
  return children;
};

// Main App Component
function App() {
  return React.createElement(AuthProvider, null,
    React.createElement(AppWithAuth, null)
  );
}

function AppWithAuth() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Prevent rendering until auth check is complete
  if (loading) {
    return React.createElement('div', null, 'Loading...');
  }

  return React.createElement(GlobalContainer, null,
    React.createElement(Navbar, { user: user, onLogout: logout, isAdmin: isAdmin }),
    React.createElement(AppContent, null,
      React.createElement(Routes, null,
        React.createElement(Route, { path: "/", element: React.createElement(HomePage, null) }),
        React.createElement(Route, { path: "/login", element: !isAuthenticated ? React.createElement(LoginPage, null) : React.createElement(Navigate, { to: "/dashboard", replace: true }) }),
        React.createElement(Route, { path: "/register", element: !isAuthenticated ? React.createElement(RegisterPage, null) : React.createElement(Navigate, { to: "/dashboard", replace: true }) }),
        React.createElement(Route, { path: "/dashboard", element: React.createElement(ProtectedRoute, null,
          React.createElement(DashboardPage, { user: user })
        )}),
        React.createElement(Route, { path: "/plans", element: React.createElement(ProtectedRoute, null,
          React.createElement(PlansPage, null)
        )}),
        React.createElement(Route, { path: "/recharge", element: React.createElement(ProtectedRoute, null,
          React.createElement(RechargePage, null)
        )}),
        React.createElement(Route, { path: "/withdraw", element: React.createElement(ProtectedRoute, null,
          React.createElement(WithdrawPage, null)
        )}),
        React.createElement(Route, { path: "/transactions", element: React.createElement(ProtectedRoute, null,
          React.createElement(TransactionsPage, null)
        )}),
        React.createElement(Route, { path: "/admin", element: React.createElement(ProtectedRoute, { adminOnly: true }, 
          React.createElement(AdminPage, null)
        )}),
        React.createElement(Route, { path: "/games", element: React.createElement(ProtectedRoute, null,
          React.createElement(GamesPage, null)
        )}),
        
        // Catch-all route
        React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: "/", replace: true }) })
      )
    ),
    React.createElement(Footer, null)
  );
}

export default App;