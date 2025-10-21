import axios from 'axios';

// Set up axios base URL using environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

// For now, continue using the existing API endpoints
axios.defaults.baseURL = '/api';

// Add request interceptor to include token in headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Supabase headers if needed for direct Supabase integration
    if (SUPABASE_URL && SUPABASE_API_KEY) {
      config.headers['apikey'] = SUPABASE_API_KEY;
      config.headers['Authorization'] = `Bearer ${SUPABASE_API_KEY}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => axios.post('/register', userData),
  login: (loginData) => axios.post('/login', loginData),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => axios.get('/dashboard/stats'),
};

// Plans API
export const plansAPI = {
  getAll: () => axios.get('/plans'),
  purchase: (planId) => axios.post('/purchase', { planId }),
};

// Recharge API
export const rechargeAPI = {
  request: (rechargeData) => axios.post('/recharge', rechargeData),
  getHistory: () => axios.get('/recharge/history'),
};

// Withdraw API
export const withdrawAPI = {
  request: (withdrawData) => axios.post('/withdraw', withdrawData),
  getHistory: () => axios.get('/withdraw/history'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => axios.get('/admin/dashboard'),
  getUsers: () => axios.get('/admin/users'),
  getRecharges: () => axios.get('/admin/recharges'),
  getWithdrawals: () => axios.get('/admin/withdrawals'),
  approveRecharge: (id) => axios.put(`/admin/recharge/${id}`),
  rejectRecharge: (id) => axios.put(`/admin/recharge/${id}/reject`),
  approveWithdrawal: (id) => axios.put(`/admin/withdrawal/${id}`),
  rejectWithdrawal: (id) => axios.put(`/admin/withdrawal/${id}/reject`),
};

// Daily income simulation (for development)
export const incomeAPI = {
  simulateDaily: () => axios.post('/simulate-daily-income'),
};

// Games API
export const gamesAPI = {
  play: (gameData) => axios.post('/play-game', gameData),
  getHistory: () => axios.get('/game-history'),
};