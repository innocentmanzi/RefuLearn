import React from 'react';
import styled from 'styled-components';

const LogoText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #000000;
  letter-spacing: 2px;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
  margin-bottom: 0.5rem;
  text-align: left;
`;

const Logo = () => <LogoText>RefuLearn</LogoText>;

export default Logo; 