import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  
  @media (min-width: 768px) {
    top: 0;
    bottom: auto;
    position: sticky;
    justify-content: flex-end;
    padding: 15px 20px;
  }
`;

const NavItem = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.3);
    font-weight: bold;
  }
  
  @media (min-width: 768px) {
    margin-left: 15px;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  @media (min-width: 768px) {
    margin-left: 15px;
  }
`;

const Navbar = ({ user, onLogout, isAdmin }) => {
  const location = useLocation();
  
  return React.createElement(Nav, null,
    user ? (
      React.createElement(React.Fragment, null,
        React.createElement(NavItem, { 
          to: "/dashboard", 
          className: location.pathname === '/dashboard' ? 'active' : ''
        }, 'Dashboard'),
        React.createElement(NavItem, { 
          to: "/plans", 
          className: location.pathname === '/plans' ? 'active' : ''
        }, 'Plans'),
        React.createElement(NavItem, { 
          to: "/recharge", 
          className: location.pathname === '/recharge' ? 'active' : ''
        }, 'Recharge'),
        React.createElement(NavItem, { 
          to: "/withdraw", 
          className: location.pathname === '/withdraw' ? 'active' : ''
        }, 'Withdraw'),
        React.createElement(NavItem, { 
          to: "/transactions", 
          className: location.pathname === '/transactions' ? 'active' : ''
        }, 'Transactions'),
        React.createElement(NavItem, { 
          to: "/games", 
          className: location.pathname === '/games' ? 'active' : ''
        }, 'Games'),
        isAdmin && React.createElement(NavItem, { 
          to: "/admin", 
          className: location.pathname === '/admin' ? 'active' : ''
        }, 'Admin'),
        React.createElement(LogoutButton, { onClick: onLogout }, 'Logout')
      )
    ) : (
      React.createElement(React.Fragment, null,
        React.createElement(NavItem, { 
          to: "/login", 
          className: location.pathname === '/login' ? 'active' : ''
        }, 'Login'),
        React.createElement(NavItem, { 
          to: "/register", 
          className: location.pathname === '/register' ? 'active' : ''
        }, 'Register')
      )
    )
  );
};

export default Navbar;