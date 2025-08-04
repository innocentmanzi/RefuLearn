import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPalette, FaMoon, FaSun, FaCheck, FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcherContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ThemeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 140px;
  justify-content: space-between;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadowLight};
  backdrop-filter: blur(10px);
  
  /* Enhanced styling for landing page visibility */
  &:not([data-in-sidebar]) {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #333;
    font-weight: 600;
    min-width: 160px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
    transform: translateY(-1px);
  }
  
  &:not([data-in-sidebar]):hover {
    background: rgba(255, 255, 255, 1);
    border-color: #007BFF;
    box-shadow: 0 6px 25px rgba(0, 123, 255, 0.25);
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus};
  }
`;

const ThemeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const DropdownIcon = styled(FaChevronDown)`
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ThemeDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-top: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 8px 24px ${({ theme }) => theme.colors.shadow};
  z-index: 1000;
  min-width: 200px;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
  backdrop-filter: blur(20px);
  
  /* Enhanced styling for landing page */
  &:not([data-in-sidebar]) {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
`;

const ThemeOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.text};
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
  
  &.active {
    background: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ThemeName = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
`;

const QuickToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadowLight};
  
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
    transform: scale(1.05);
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus};
  }
`;

const SwitcherWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ThemeSwitcher = ({ variant = 'dropdown', showQuickToggle = true, inSidebar = false }) => {
  const { currentTheme, availableThemes, switchTheme, toggleDarkMode, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentThemeData = availableThemes.find(theme => theme.key === currentTheme);
  
  const getThemeIcon = (themeKey) => {
    switch (themeKey) {
      case 'dark':
        return <FaMoon />;
      case 'light':
        return <FaSun />;
      case 'blue':
        return <FaPalette style={{ color: '#0066cc' }} />;
      case 'nature':
        return <FaPalette style={{ color: '#27ae60' }} />;
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
  
  const handleQuickToggle = () => {
    toggleDarkMode();
  };
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('[data-theme-switcher]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);
  
  if (variant === 'toggle-only') {
    return (
      <QuickToggleButton onClick={handleQuickToggle} title="Toggle Dark Mode">
        {isDark ? <FaSun /> : <FaMoon />}
      </QuickToggleButton>
    );
  }
  
  return (
    <SwitcherWrapper>
      <ThemeSwitcherContainer data-theme-switcher>
        <ThemeButton 
          onClick={handleToggle}
          data-in-sidebar={inSidebar ? 'true' : undefined}
        >
          <ThemeIcon>
            {getThemeIcon(currentTheme)}
            {currentThemeData?.name}
          </ThemeIcon>
          <DropdownIcon $isOpen={isOpen} />
        </ThemeButton>
        
        <ThemeDropdown 
          $isOpen={isOpen}
          data-in-sidebar={inSidebar ? 'true' : undefined}
        >
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
              {theme.key === currentTheme && <FaCheck />}
            </ThemeOption>
          ))}
        </ThemeDropdown>
      </ThemeSwitcherContainer>
      
      {showQuickToggle && (
        <QuickToggleButton onClick={handleQuickToggle} title="Quick Dark/Light Toggle">
          {isDark ? <FaSun /> : <FaMoon />}
        </QuickToggleButton>
      )}
    </SwitcherWrapper>
  );
};

export default ThemeSwitcher; 