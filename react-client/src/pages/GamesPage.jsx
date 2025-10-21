import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { gamesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const GamesContainer = styled.div`
  padding: 20px 0;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const GameCard = styled.div`
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

const GameName = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.4rem;
`;

const GameDescription = styled.p`
  margin: 15px 0;
  color: #666;
  line-height: 1.5;
`;

const BetInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
  margin: 10px 0;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
  }
`;

const PlayButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
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

const ResultCard = styled.div`
  background: ${props => props.win ? '#d4edda' : '#f8d7da'};
  color: ${props => props.win ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.win ? '#c3e6cb' : '#f5c6cb'};
  border-radius: 5px;
  padding: 15px;
  margin: 15px 0;
  text-align: center;
`;

const HistorySection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-top: 30px;
`;

const HistoryTitle = styled.h3`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const HistoryList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

const WinBadge = styled.span`
  padding: 5px 10px;
  border-radius: 15px;
  background: ${props => props.win ? '#d4edda' : '#f8d7da'};
  color: ${props => props.win ? '#155724' : '#721c24'};
  font-size: 0.8rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6a11cb;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const GamesPage = () => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedGame, setSelectedGame] = useState('slot');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { user, updateBalance } = useAuth();

  const games = [
    {
      id: 'slot',
      name: 'Slot Machine',
      description: 'Spin the reels and match 3 symbols to win! Matching all 3 gives 10x your bet, 2 matching gives 2x.',
      odds: 'Medium Risk, Medium Reward'
    },
    {
      id: 'dice',
      name: 'Dice Roll',
      description: 'Roll two dice and get 10 or higher to win! 11-12 gives 3x your bet, exactly 10 gives 2x.',
      odds: 'Medium Risk, Medium Reward'
    },
    {
      id: 'coinflip',
      name: 'Coin Flip',
      description: 'Flip a coin and guess heads or tails. Win 2x your bet if you guess correctly!',
      odds: '50/50 chance, 2x reward'
    },
    {
      id: 'lucky-wheel',
      name: 'Lucky Wheel',
      description: 'Spin the wheel for a chance to win big! Jackpot (10x) has 5% chance, various multipliers available.',
      odds: 'High Risk, High Reward'
    }
  ];

  const loadHistory = async () => {
    if (!user) return;
    
    setHistoryLoading(true);
    try {
      const response = await gamesAPI.getHistory();
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handlePlay = async () => {
    if (!betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(betAmount) > user.balance) {
      alert('Insufficient balance for this bet');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await gamesAPI.play({
        gameType: selectedGame,
        betAmount: parseFloat(betAmount)
      });
      
      setResult(response.data);
      // Update user balance in context
      if (response.data.newBalance !== undefined) {
        // Update the user's balance in the auth context
        updateBalance(response.data.newBalance);
      }
      
      // Refresh history
      loadHistory();
    } catch (error) {
      console.error('Error playing game:', error);
      setResult({
        message: error.response?.data?.error || 'Game play failed',
        win: false,
        winnings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GamesContainer>
      <Title>Test Your Luck - Games & Entertainment</Title>
      
      <GamesGrid>
        {games.map(game => (
          <GameCard key={game.id}>
            <GameName>{game.name}</GameName>
            <p><strong>{game.odds}</strong></p>
            <GameDescription>{game.description}</GameDescription>
            
            <div>
              <label>
                <strong>Bet Amount (₹):</strong>
              </label>
              <BetInput
                type="number"
                value={selectedGame === game.id ? betAmount : ''}
                onChange={(e) => {
                  setBetAmount(e.target.value);
                  setSelectedGame(game.id);
                }}
                placeholder={`Min ₹10 - Your balance: ₹${user?.balance?.toLocaleString() || 0}`}
                min="10"
                max={user?.balance || 1000}
              />
              <PlayButton 
                onClick={() => {
                  setSelectedGame(game.id);
                  handlePlay();
                }}
                disabled={loading}
              >
                {loading && selectedGame === game.id ? 'Spinning...' : `Play ${game.name}`}
              </PlayButton>
            </div>
          </GameCard>
        ))}
      </GamesGrid>

      {result && (
        <ResultCard win={result.win}>
          <h3>{result.win ? '🎉 You Won!' : '😞 Better Luck Next Time!'}</h3>
          <p>{result.message}</p>
          {result.gameResult && (
            <p>
              <strong>Winnings:</strong> ₹{result.gameResult.winnings} | 
              <strong> Bet:</strong> ₹{result.gameResult.betAmount} | 
              <strong> New Balance:</strong> ₹{result.newBalance}
            </p>
          )}
        </ResultCard>
      )}

      <HistorySection>
        <HistoryTitle>Game History</HistoryTitle>
        {historyLoading ? (
          <LoadingSpinner />
        ) : (
          <HistoryList>
            {history.length > 0 ? (
              history.map(game => (
                <HistoryItem key={game.id}>
                  <div>
                    <strong>{game.gameType}</strong> ({new Date(game.playedAt).toLocaleString()})
                    <br />
                    Bet: ₹{game.betAmount} | Won: ₹{game.winnings}
                  </div>
                  <WinBadge win={game.win}>
                    {game.win ? 'Won' : 'Lost'}
                  </WinBadge>
                </HistoryItem>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No games played yet</p>
            )}
          </HistoryList>
        )}
      </HistorySection>
    </GamesContainer>
  );
};

export default GamesPage;