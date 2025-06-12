import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0.5rem 0 0 0.5rem;
  box-sizing: border-box;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 0;
`;

const LanguageSelector = styled.select`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  background: #f8f9fa;
  margin-left: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 3rem;
  font-weight: bold;
`;

const Statement = styled.h2`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.5rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const languages = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'fr', label: 'French' },
  { code: 'sw', label: 'Swahili' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  return (
    <Container>
      <TopBar>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        <LanguageSelector
          value={language}
          onChange={e => setLanguage(e.target.value)}
          aria-label="Select language"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </LanguageSelector>
      </TopBar>
      <Content>
        <Title>Welcome to RefuLearn</Title>
        <Statement>Empowering refugees through education</Statement>
        <Button onClick={() => navigate('/register')}>Continue</Button>
      </Content>
    </Container>
  );
};

export default Landing; 