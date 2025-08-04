import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSelectorContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
  animation: slideDown 0.2s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LanguageOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.isActive ? '#f8f9fa' : 'white'};
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e1e5e9;
  }
  
  ${props => props.isActive && `
    font-weight: 600;
    color: ${props.theme.colors.primary};
  `}
`;

const Flag = styled.span`
  font-size: 16px;
`;

const LanguageName = styled.span`
  flex: 1;
`;

const ActiveIndicator = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const LanguageSelector = ({ variant = 'dropdown' }) => {
  const { currentLanguage, changeLanguage, availableLanguages, getCurrentLanguageInfo } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangInfo = getCurrentLanguageInfo();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'simple') {
    return (
      <LanguageSelectorContainer className="language-selector">
        <LanguageButton onClick={toggleDropdown}>
          <Flag>{currentLangInfo.flag}</Flag>
          <span>{currentLangInfo.name}</span>
        </LanguageButton>
        
        {isOpen && (
          <LanguageDropdown>
            {availableLanguages.map((language) => (
              <LanguageOption
                key={language.code}
                isActive={language.code === currentLanguage}
                onClick={() => handleLanguageChange(language.code)}
              >
                <Flag>{language.flag}</Flag>
                <LanguageName>{language.name}</LanguageName>
                {language.code === currentLanguage && (
                  <ActiveIndicator>✓</ActiveIndicator>
                )}
              </LanguageOption>
            ))}
          </LanguageDropdown>
        )}
      </LanguageSelectorContainer>
    );
  }

  // Default dropdown variant
  return (
    <LanguageSelectorContainer className="language-selector">
      <LanguageButton onClick={toggleDropdown}>
        <Flag>{currentLangInfo.flag}</Flag>
        <span>{t('language')}</span>
      </LanguageButton>
      
      {isOpen && (
        <LanguageDropdown>
          {availableLanguages.map((language) => (
            <LanguageOption
              key={language.code}
              isActive={language.code === currentLanguage}
              onClick={() => handleLanguageChange(language.code)}
            >
              <Flag>{language.flag}</Flag>
              <LanguageName>{language.name}</LanguageName>
              {language.code === currentLanguage && (
                <ActiveIndicator>✓</ActiveIndicator>
              )}
            </LanguageOption>
          ))}
        </LanguageDropdown>
      )}
    </LanguageSelectorContainer>
  );
};

export default LanguageSelector; 