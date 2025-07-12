import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  padding: 1rem;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem 0 1rem;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding-right: 2rem;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
`;

const LanguageSelector = styled.select`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  background: #f8f9fa;
  margin-left: 2.5rem;
  min-width: 120px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
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

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const languages = [
    { code: 'en', label: t('english') },
    { code: 'fr', label: t('french') },
    { code: 'rw', label: t('kinyarwanda') },
    { code: 'sw', label: t('swahili') }
  ];

  return (
    <Container>
      <TopBar>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        <select
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
          aria-label={t('language')}
          style={{ borderRadius: 4, padding: 4, marginLeft: 16 }}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </TopBar>
      <Content>
        <Title>{t('welcome')}</Title>
        <Statement>{t('empowering')}</Statement>
        <Button onClick={() => navigate('/register')}>{t('continue')}</Button>
      </Content>
    </Container>
  );
};

export default Landing; 