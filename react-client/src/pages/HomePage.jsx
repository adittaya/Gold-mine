import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
`;

const FeatureSection = styled.div`
  margin: 40px 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const FeatureDesc = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const HomePage = () => {
  return React.createElement(HomeContainer, null,
    React.createElement(Title, null, 'Goldmine Pro'),
    React.createElement(Subtitle, null, 'Your Gateway to Smart Investments'),
    
    React.createElement('div', null,
      React.createElement(CTAButton, { to: "/register" }, 'Get Started Now'),
      React.createElement(CTAButton, { to: "/login" }, 'Login to Account')
    ),
    
    React.createElement(FeatureSection, null,
      React.createElement('h2', null, 'Why Choose Goldmine Pro?'),
      React.createElement(FeatureGrid, null,
        React.createElement(FeatureCard, null,
          React.createElement(FeatureTitle, null, '🔒 Secure & Trusted'),
          React.createElement(FeatureDesc, null, 'Safe and secure transactions with top-notch protection for your investments')
        ),
        React.createElement(FeatureCard, null,
          React.createElement(FeatureTitle, null, '💰 Daily Income'),
          React.createElement(FeatureDesc, null, 'Automatic daily income payouts to grow your wealth consistently')
        ),
        React.createElement(FeatureCard, null,
          React.createElement(FeatureTitle, null, '📱 Mobile Friendly'),
          React.createElement(FeatureDesc, null, 'Access your account anytime, anywhere with our mobile-optimized platform')
        ),
        React.createElement(FeatureCard, null,
          React.createElement(FeatureTitle, null, '🚀 Fast Payouts'),
          React.createElement(FeatureDesc, null, 'Quick withdrawal processing with transparent fee structure')
        )
      )
    )
  );
};

export default HomePage;