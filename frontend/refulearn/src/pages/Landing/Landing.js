import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Stunning Animations
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Modern Container
const LandingContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(-45deg, #000000, #1a1a1a, #007BFF, #0056b3, #000000, #1a1a1a);
  background-size: 400% 400%;
  animation: ${gradientMove} 15s ease infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }
`;

// Header
const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  position: absolute;
  top: 0;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: ${float} 3s ease-in-out infinite;
`;

const LanguageSelector = styled.select`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 123, 255, 0.3);
    border: 1px solid rgba(0, 123, 255, 0.5);
    transform: translateY(-2px);
  }
  
  option {
    background: #000000;
    color: white;
  }
`;

// Main Content
const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 5;
  max-width: 900px;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  line-height: 1.1;
  letter-spacing: -0.02em;
  animation: ${fadeInUp} 1s ease-out 0.2s both;
`;

const HeroSubtitle = styled.h2`
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 3rem;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 1s ease-out 0.4s both;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  font-size: 1.3rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 123, 255, 0.4);
  animation: ${fadeInUp} 1s ease-out 0.6s both, ${pulse} 2s ease-in-out 3s infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 123, 255, 0.6);
    background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
  }
`;

// Floating Elements
const FloatingElement = styled.div`
  position: absolute;
  width: ${props => props.size || '100px'};
  height: ${props => props.size || '100px'};
  background: ${props => props.bg || 'linear-gradient(135deg, rgba(0,123,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'};
  border-radius: 50%;
  top: ${props => props.top || '50%'};
  left: ${props => props.left || '50%'};
  animation: ${float} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 123, 255, 0.2);
`;



const Landing = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleContinue = () => {
    navigate('/register');
  };

  return (
    <LandingContainer>
      {/* Floating Background Elements */}
      <FloatingElement size="80px" top="10%" left="10%" duration="8s" delay="0s" 
        bg="linear-gradient(135deg, rgba(0,123,255,0.2) 0%, rgba(255,255,255,0.1) 100%)" />
      <FloatingElement size="60px" top="20%" left="85%" duration="6s" delay="1s" 
        bg="linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,123,255,0.1) 100%)" />
      <FloatingElement size="120px" top="70%" left="15%" duration="10s" delay="2s" 
        bg="linear-gradient(135deg, rgba(0,86,179,0.15) 0%, rgba(0,0,0,0.1) 100%)" />
      <FloatingElement size="40px" top="80%" left="80%" duration="7s" delay="1.5s" 
        bg="linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,123,255,0.05) 100%)" />
      <FloatingElement size="90px" top="40%" left="90%" duration="9s" delay="0.5s" 
        bg="linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,0,0,0.15) 100%)" />
      
      <Header>
                  <Logo>RefuLearn</Logo>
        <LanguageSelector>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="rw">Kinyarwanda</option>
          <option value="sw">Swahili</option>
        </LanguageSelector>
      </Header>
      
      <MainContent>
        <HeroTitle>Welcome to RefuLearn</HeroTitle>
        <HeroSubtitle>
          Empowering refugees through world-class education,<br />
          building bridges to brighter futures
        </HeroSubtitle>
        <CTAButton onClick={handleContinue}>
          Begin Your Journey
        </CTAButton>
      </MainContent>

      
    </LandingContainer>
  );
};

export default Landing; 