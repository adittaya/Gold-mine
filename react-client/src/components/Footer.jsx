import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  text-align: center;
  padding: 15px 20px;
  font-size: 0.8rem;
  z-index: 999;
  
  @media (min-width: 768px) {
    position: static;
    margin-top: auto;
  }
`;

const Footer = () => {
  return React.createElement(FooterContainer, null,
    React.createElement('p', null, `© ${new Date().getFullYear()} Goldmine Pro Investment Platform. All rights reserved.`)
  );
};

export default Footer;