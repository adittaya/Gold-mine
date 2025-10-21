const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('react-client/dist'));

// In-memory storage (would use database in production)
const users = {};
// Add default admin user
users['admin'] = {
  id: 'admin123',
  name: 'Admin User',
  mobile: 'admin',
  password: '$2a$10$enNsuw6waZgLxWdOYFd9z.gp6vv8bWgYYjsAlLCgDUlbQLPpv.wcO', // bcrypt hash of 'admin123'
  balance: 0,
  totalInvested: 0,
  totalWithdrawn: 0,
  totalEarnings: 0,
  is_admin: true,
  createdAt: new Date()
};
const plans = [
  { id: 1, name: 'Basic Plan', price: 1000, dailyIncome: 50, totalReturn: 1200, duration: 24 },
  { id: 2, name: 'Silver Plan', price: 5000, dailyIncome: 250, totalReturn: 6000, duration: 24 },
  { id: 3, name: 'Gold Plan', price: 10000, dailyIncome: 500, totalReturn: 12000, duration: 24 },
  { id: 4, name: 'Platinum Plan', price: 25000, dailyIncome: 1250, totalReturn: 30000, duration: 24 }
];
const purchases = {};
const withdrawals = {};
const recharges = {};
const dailyIncome = {};
const referralLinks = {};
const games = {}; // Store game results

// Generate referral link for a user
const generateReferralLink = (userId) => {
  return `https://goldmine-pro.com/register?ref=${userId}`;
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, mobile: user.mobile, is_admin: user.is_admin },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '7d' }
  );
};

// Authenticate token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin authentication
const adminAuth = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, mobile, password, referralCode } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ error: 'Name, mobile, and password are required' });
    }

    if (users[mobile]) {
      return res.status(400).json({ error: 'User already exists with this mobile number' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    
    const newUser = {
      id: userId,
      name,
      mobile,
      password: hashedPassword,
      balance: 0,
      totalInvested: 0,
      totalWithdrawn: 0,
      totalEarnings: 0,
      is_admin: false,
      createdAt: new Date()
    };

    users[mobile] = newUser;
    
    // Handle referral
    if (referralCode && users[referralCode]) {
      // Add referral commission to referrer
      users[referralCode].balance += 50; // Example referral bonus
      users[referralCode].totalEarnings += 50;
    }

    const token = generateToken(newUser);
    const referralLink = generateReferralLink(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        mobile: newUser.mobile,
        balance: newUser.balance,
        referralLink
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ error: 'Mobile and password are required' });
    }

    const user = users[mobile];
    if (!user) {
      return res.status(400).json({ error: 'Invalid mobile or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid mobile or password' });
    }

    const token = generateToken(user);
    const referralLink = generateReferralLink(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        balance: user.balance,
        is_admin: user.is_admin,
        referralLink
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all investment plans
app.get('/api/plans', authenticateToken, (req, res) => {
  res.json(plans);
});

// Purchase an investment plan
app.post('/api/purchase', authenticateToken, (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    // Find user by iterating through users object
    let user = null;
    for (const mobile in users) {
      if (users[mobile].id === userId) {
        user = users[mobile];
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plan = plans.find(p => p.id === parseInt(planId));
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (user.balance < plan.price) {
      return res.status(400).json({ error: 'Insufficient balance to purchase this plan' });
    }

    // Check if user already has an active plan this month (one plan per month rule)
    const userPurchases = Object.values(purchases).filter(p => p.userId === userId);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    for (const purchase of userPurchases) {
      const purchaseDate = new Date(purchase.purchasedAt);
      if (purchaseDate.getMonth() === currentMonth && 
          purchaseDate.getFullYear() === currentYear && 
          purchase.status === 'active') {
        return res.status(400).json({ error: 'You can only purchase one plan per month' });
      }
    }

    // Deduct plan price from user balance
    user.balance -= plan.price;
    user.totalInvested += plan.price;

    const purchaseId = Date.now().toString();
    const newPurchase = {
      id: purchaseId,
      userId,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      dailyIncome: plan.dailyIncome,
      totalReturn: plan.totalReturn,
      purchasedAt: new Date(),
      status: 'active',
      duration: plan.duration, // in days
      dailyIncomeReceived: 0
    };

    purchases[purchaseId] = newPurchase;

    res.json({
      message: 'Plan purchased successfully',
      purchase: newPurchase
    });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Recharge wallet
app.post('/api/recharge', authenticateToken, (req, res) => {
  try {
    const { amount, utr } = req.body;
    const userId = req.user.id;

    // Find user by iterating through users object
    let user = null;
    for (const mobile in users) {
      if (users[mobile].id === userId) {
        user = users[mobile];
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!amount || !utr) {
      return res.status(400).json({ error: 'Amount and UTR are required' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const rechargeId = Date.now().toString();
    const newRecharge = {
      id: rechargeId,
      userId,
      amount: parseFloat(amount),
      utr,
      status: 'pending',
      requestedAt: new Date(),
      processedAt: null
    };

    recharges[rechargeId] = newRecharge;

    res.status(201).json({
      message: 'Recharge request submitted successfully',
      recharge: newRecharge
    });
  } catch (error) {
    res.status(500).json({ error: 'Recharge request failed' });
  }
});

// Get recharge history
app.get('/api/recharge/history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userRecharges = Object.values(recharges).filter(r => r.userId === userId);
  res.json(userRecharges);
});

// Withdraw money
app.post('/api/withdraw', authenticateToken, (req, res) => {
  try {
    const { amount, method, details } = req.body;  // method: 'bank' or 'upi', details: account info or UPI
    const userId = req.user.id;

    // Find user by iterating through users object
    let user = null;
    for (const mobile in users) {
      if (users[mobile].id === userId) {
        user = users[mobile];
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!amount || !method || !details) {
      return res.status(400).json({ error: 'Amount, method, and details are required' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance for withdrawal' });
    }

    // Check if user has made a withdrawal in the last 24 hours
    const userWithdrawals = Object.values(withdrawals).filter(w => w.userId === userId);
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    
    for (const withdrawal of userWithdrawals) {
      const withdrawalDate = new Date(withdrawal.requestedAt);
      if (withdrawalDate > yesterday && withdrawal.status === 'pending') {
        return res.status(400).json({ error: 'You can only make one withdrawal request every 24 hours' });
      }
    }

    // Calculate GST (let's say 3% for example)
    const gst = amount * 0.03;
    const netAmount = amount - gst;

    const withdrawalId = Date.now().toString();
    const newWithdrawal = {
      id: withdrawalId,
      userId,
      amount: parseFloat(amount),
      netAmount: parseFloat(netAmount),
      gst: parseFloat(gst),
      method,
      details,
      status: 'pending',
      requestedAt: new Date(),
      processedAt: null
    };

    withdrawals[withdrawalId] = newWithdrawal;

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: newWithdrawal
    });
  } catch (error) {
    res.status(500).json({ error: 'Withdrawal request failed' });
  }
});

// Get withdrawal history
app.get('/api/withdraw/history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userWithdrawals = Object.values(withdrawals).filter(w => w.userId === userId);
  res.json(userWithdrawals);
});

// Play a game of chance
app.post('/api/play-game', authenticateToken, (req, res) => {
  try {
    const { gameType, betAmount } = req.body;
    const userId = req.user.id;

    // Find user by iterating through users object
    let user = null;
    for (const mobile in users) {
      if (users[mobile].id === userId) {
        user = users[mobile];
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!gameType || !betAmount) {
      return res.status(400).json({ error: 'Game type and bet amount are required' });
    }

    if (isNaN(betAmount) || betAmount <= 0) {
      return res.status(400).json({ error: 'Valid bet amount is required' });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance for this bet' });
    }

    // Process different game types
    let result = { win: false, winnings: 0, message: '' };

    switch (gameType.toLowerCase()) {
      case 'slot':
        result = playSlotMachine(betAmount);
        break;
      case 'dice':
        result = playDice(betAmount);
        break;
      case 'coinflip':
        result = playCoinFlip(betAmount);
        break;
      case 'lucky-wheel':
        result = playLuckyWheel(betAmount);
        break;
      default:
        return res.status(400).json({ error: 'Invalid game type. Available games: slot, dice, coinflip, lucky-wheel' });
    }

    // Deduct bet amount from user balance
    user.balance -= betAmount;

    if (result.win) {
      // Add winnings to user balance
      user.balance += result.winnings;
      user.totalEarnings += result.winnings - betAmount; // Record net earnings
    }

    // Create game record
    const gameId = Date.now().toString();
    const gameRecord = {
      id: gameId,
      userId,
      gameType,
      betAmount,
      winnings: result.winnings,
      win: result.win,
      result: result.result || '',
      playedAt: new Date()
    };

    games[gameId] = gameRecord;

    res.json({
      message: result.message,
      gameResult: gameRecord,
      newBalance: user.balance,
      win: result.win,
      winnings: result.winnings
    });

  } catch (error) {
    console.error('Error playing game:', error);
    res.status(500).json({ error: 'Game play failed' });
  }
});

// Get user's game history
app.get('/api/game-history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userGames = Object.values(games).filter(g => g.userId === userId);
  res.json(userGames);
});

// Helper functions for different games
function playSlotMachine(betAmount) {
  // Simulate slot machine: 3 symbols
  const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '7️⃣'];
  const result = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  let win = false;
  let winnings = 0;
  let message = '';

  // Check for winning combinations
  if (result[0] === result[1] && result[1] === result[2]) {
    // All three match - big win
    win = true;
    winnings = betAmount * 10; // 10x multiplier
    message = `🎉 Jackpot! You got ${result[0]} ${result[1]} ${result[2]} - Won ₹${winnings}!`;
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    // Two match - small win
    win = true;
    winnings = betAmount * 2; // 2x multiplier
    message = `🎉 Two symbols match! You got ${result[0]} ${result[1]} ${result[2]} - Won ₹${winnings}!`;
  } else {
    // No match
    win = false;
    winnings = 0;
    message = `😞 No match. You got ${result[0]} ${result[1]} ${result[2]}. Better luck next time!`;
  }

  return {
    win,
    winnings,
    message,
    result: result.join(' ')
  };
}

function playDice(betAmount) {
  // Roll two dice (1-6 each)
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2;

  let win = false;
  let winnings = 0;
  let message = '';

  if (total >= 10) {
    // Higher numbers win more
    win = true;
    if (total >= 11) {
      winnings = betAmount * 3; // 3x for 11-12
      message = `🎲 You rolled ${dice1} + ${dice2} = ${total} - Big win! Won ₹${winnings}!`;
    } else {
      winnings = betAmount * 2; // 2x for 10
      message = `🎲 You rolled ${dice1} + ${dice2} = ${total} - Nice win! Won ₹${winnings}!`;
    }
  } else {
    win = false;
    winnings = 0;
    message = `🎲 You rolled ${dice1} + ${dice2} = ${total} - Not quite. Better luck next time!`;
  }

  return {
    win,
    winnings,
    message,
    result: `${dice1} + ${dice2} = ${total}`
  };
}

function playCoinFlip(betAmount) {
  // Coin flip: heads or tails
  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const userChoice = Math.random() < 0.5 ? 'heads' : 'tails'; // Random choice for demo
  const win = result === userChoice;

  let winnings = 0;
  let message = '';

  if (win) {
    winnings = betAmount * 2; // 2x for winning
    message = `🪙 It's ${result.toUpperCase()}! You win ₹${winnings}!`;
  } else {
    winnings = 0;
    message = `🪙 It's ${result.toUpperCase()}. You chose ${userChoice.toUpperCase()}. Better luck next time!`;
  }

  return {
    win,
    winnings,
    message,
    result: `Coin landed on ${result}`
  };
}

function playLuckyWheel(betAmount) {
  // Lucky wheel with different sectors
  const sectors = [
    { label: '10x', multiplier: 10, chance: 0.05 }, // 5% chance
    { label: '5x', multiplier: 5, chance: 0.10 },  // 10% chance
    { label: '3x', multiplier: 3, chance: 0.15 },  // 15% chance
    { label: '2x', multiplier: 2, chance: 0.20 },  // 20% chance
    { label: '1.5x', multiplier: 1.5, chance: 0.25 }, // 25% chance
    { label: '0.5x', multiplier: 0.5, chance: 0.20 }, // 20% chance
    { label: '0x', multiplier: 0, chance: 0.05 }   // 5% chance
  ];

  // Determine the winning sector based on cumulative probabilities
  let random = Math.random();
  let cumulativeChance = 0;
  let selectedSector = sectors[0];

  for (const sector of sectors) {
    cumulativeChance += sector.chance;
    if (random <= cumulativeChance) {
      selectedSector = sector;
      break;
    }
  }

  const winnings = betAmount * selectedSector.multiplier;
  const win = selectedSector.multiplier > 0;

  let message = '';
  if (win) {
    message = `🎡 Lucky wheel landed on ${selectedSector.label} - Won ₹${winnings}!`;
  } else {
    message = `🎡 Lucky wheel landed on ${selectedSector.label} - Lost ₹${betAmount}. Better luck next time!`;
  }

  return {
    win,
    winnings,
    message,
    result: `Lucky wheel: ${selectedSector.label}`
  };
}

// Get user dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Find user by iterating through users object
  let user = null;
  for (const mobile in users) {
    if (users[mobile].id === userId) {
      user = users[mobile];
      break;
    }
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userPurchases = Object.values(purchases).filter(p => p.userId === userId);
  const activePurchases = userPurchases.filter(p => p.status === 'active');
  const totalInvested = activePurchases.reduce((sum, p) => sum + p.price, 0);

  res.json({
    balance: user.balance,
    totalInvested: user.totalInvested,
    totalWithdrawn: user.totalWithdrawn,
    totalEarnings: user.totalEarnings,
    activePlans: activePurchases.length,
    referralLink: generateReferralLink(userId)
  });
});

// Admin: Get dashboard data
app.get('/api/admin/dashboard', authenticateToken, adminAuth, (req, res) => {
  const totalUsers = Object.keys(users).length;
  const totalPurchases = Object.keys(purchases).length;
  const totalWithdrawals = Object.keys(withdrawals).length;
  const totalRecharges = Object.keys(recharges).length;
  const pendingRecharges = Object.values(recharges).filter(r => r.status === 'pending').length;
  const pendingWithdrawals = Object.values(withdrawals).filter(w => w.status === 'pending').length;

  res.json({
    totalUsers,
    totalPurchases,
    totalWithdrawals,
    totalRecharges,
    pendingRecharges,
    pendingWithdrawals
  });
});

// Admin: Approve recharge
app.put('/api/admin/recharge/:id', authenticateToken, adminAuth, (req, res) => {
  const rechargeId = req.params.id;
  const recharge = recharges[rechargeId];

  if (!recharge) {
    return res.status(404).json({ error: 'Recharge not found' });
  }

  // Find user by recharge userId
  let user = null;
  for (const mobile in users) {
    if (users[mobile].id === recharge.userId) {
      user = users[mobile];
      break;
    }
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update recharge status
  recharge.status = 'approved';
  recharge.processedAt = new Date();

  // Add amount to user's balance
  user.balance += recharge.amount;

  res.json({
    message: 'Recharge approved successfully',
    recharge
  });
});

// Admin: Reject recharge
app.put('/api/admin/recharge/:id/reject', authenticateToken, adminAuth, (req, res) => {
  const rechargeId = req.params.id;
  const recharge = recharges[rechargeId];

  if (!recharge) {
    return res.status(404).json({ error: 'Recharge not found' });
  }

  recharge.status = 'rejected';
  recharge.processedAt = new Date();

  res.json({
    message: 'Recharge rejected successfully',
    recharge
  });
});

// Admin: Approve withdrawal
app.put('/api/admin/withdrawal/:id', authenticateToken, adminAuth, (req, res) => {
  const withdrawalId = req.params.id;
  const withdrawal = withdrawals[withdrawalId];

  if (!withdrawal) {
    return res.status(404).json({ error: 'Withdrawal not found' });
  }

  // Find user by withdrawal userId
  let user = null;
  for (const mobile in users) {
    if (users[mobile].id === withdrawal.userId) {
      user = users[mobile];
      break;
    }
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update withdrawal status
  withdrawal.status = 'approved';
  withdrawal.processedAt = new Date();

  // Deduct amount from user's balance
  user.balance -= withdrawal.amount;
  user.totalWithdrawn += withdrawal.amount;

  res.json({
    message: 'Withdrawal approved successfully',
    withdrawal
  });
});

// Admin: Reject withdrawal
app.put('/api/admin/withdrawal/:id/reject', authenticateToken, adminAuth, (req, res) => {
  const withdrawalId = req.params.id;
  const withdrawal = withdrawals[withdrawalId];

  if (!withdrawal) {
    return res.status(404).json({ error: 'Withdrawal not found' });
  }

  withdrawal.status = 'rejected';
  withdrawal.processedAt = new Date();

  res.json({
    message: 'Withdrawal rejected successfully',
    withdrawal
  });
});

// Admin: Get all users
app.get('/api/admin/users', authenticateToken, adminAuth, (req, res) => {
  const userList = Object.values(users).map(user => ({
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    balance: user.balance,
    totalInvested: user.totalInvested,
    totalWithdrawn: user.totalWithdrawn,
    totalEarnings: user.totalEarnings,
    createdAt: user.createdAt
  }));

  res.json(userList);
});

// Admin: Get all recharges
app.get('/api/admin/recharges', authenticateToken, adminAuth, (req, res) => {
  const allRecharges = Object.values(recharges);
  res.json(allRecharges);
});

// Admin: Get all withdrawals
app.get('/api/admin/withdrawals', authenticateToken, adminAuth, (req, res) => {
  const allWithdrawals = Object.values(withdrawals);
  res.json(allWithdrawals);
});

// Simulate daily income (in a real app, this would run as a cron job)
// For now, we'll simulate it with an endpoint to simplify development
app.post('/api/simulate-daily-income', (req, res) => {
  // This endpoint is for development purposes to simulate daily income
  for (const purchaseId in purchases) {
    const purchase = purchases[purchaseId];
    
    if (purchase.status === 'active') {
      // Find user by purchase userId
      let user = null;
      for (const mobile in users) {
        if (users[mobile].id === purchase.userId) {
          user = users[mobile];
          break;
        }
      }

      if (user) {
        // Add daily income to user's balance
        user.balance += purchase.dailyIncome;
        user.totalEarnings += purchase.dailyIncome;
        
        // Update daily income received
        purchase.dailyIncomeReceived += purchase.dailyIncome;
        
        // Check if total return is reached
        if (purchase.dailyIncomeReceived >= purchase.totalReturn) {
          purchase.status = 'completed';
        }
      }
    }
  }
  
  res.json({ message: 'Daily income distributed to active plans' });
});

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'react-client', 'dist')));

// Catch-all handler for frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react-client', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});