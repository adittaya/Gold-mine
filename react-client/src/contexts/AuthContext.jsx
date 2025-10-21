import React, { createContext, useContext, useReducer } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAdmin: action.payload.user.is_admin,
        isAuthenticated: true
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAdmin: false,
        isAuthenticated: false
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        user: {
          ...state.user,
          balance: action.payload
        }
      };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAdmin: false,
    isAuthenticated: false
  });

  // Check for token in localStorage on initial load
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        dispatch({
          type: 'LOGIN',
          payload: {
            user: userData,
            token: token
          }
        });
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
      }
    }
  }, []);

  // Save to localStorage when state changes
  React.useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.token, state.user]);

  const login = (userData, token) => {
    dispatch({
      type: 'LOGIN',
      payload: {
        user: userData,
        token: token
      }
    });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateBalance = (newBalance) => {
    if (state.user) {
      dispatch({
        type: 'UPDATE_BALANCE',
        payload: newBalance
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};