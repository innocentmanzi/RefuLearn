import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPalette, FaMoon, FaSun, FaCheck, FaChevronUp } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

const slideUp = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const FloatingContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    bottom: 1.5rem;
    right: 1.5rem;
  }
`;

const FloatingButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${float} 3s ease-in-out infinite;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    animation-play-state: paused;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}, 0 8px 30px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
`;

const ThemeMenu = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 12px 40px ${({ theme }) => theme.colors.shadow};
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(20px);
  min-width: 200px;
  animation: ${({ $isOpen }) => $isOpen ? slideUp : 'none'} 0.3s ease-out;
  
  @media (max-width: 768px) {
    min-width: 180px;
    padding: 0.75rem;
  }
`;

const MenuTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.75rem;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const ThemeOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.25rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateX(2px);
  }
  
  &.active {
    background: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ThemeOptionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ThemePreview = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`;

const PreviewCircle = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ThemeName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
`;

const FloatingThemeSwitcher = () => {
  const { currentTheme, availableThemes, switchTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const getThemeIcon = (themeKey) => {
    switch (themeKey) {
      case 'dark':
        return <FaMoon />;
      case 'light':
        return <FaSun />;
      default:
        return <FaPalette />;
    }
  };
  
  const getPreviewColors = (theme) => {
    return [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.background
    ];
  };
  
  const handleThemeSelect = (themeKey) => {
    switchTheme(themeKey);
    setIsOpen(false);
  };
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('[data-floating-theme]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);
  
  return (
    <FloatingContainer data-floating-theme>
      <ThemeMenu $isOpen={isOpen}>
        <MenuTitle>Choose Theme</MenuTitle>
        {availableThemes.map((theme) => (
          <ThemeOption
            key={theme.key}
            onClick={() => handleThemeSelect(theme.key)}
            className={theme.key === currentTheme ? 'active' : ''}
          >
            <ThemeOptionContent>
              {getThemeIcon(theme.key)}
              <ThemeName>{theme.name}</ThemeName>
              <ThemePreview>
                {getPreviewColors(theme).map((color, index) => (
                  <PreviewCircle
                    key={index}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </ThemePreview>
            </ThemeOptionContent>
            {theme.key === currentTheme && <FaCheck size={12} />}
          </ThemeOption>
        ))}
      </ThemeMenu>
      
      <FloatingButton onClick={handleToggle} title="Theme Settings">
        {isOpen ? <FaChevronUp /> : <FaPalette />}
      </FloatingButton>
    </FloatingContainer>
  );
};

export default FloatingThemeSwitcher; 