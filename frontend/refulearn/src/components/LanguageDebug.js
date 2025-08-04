import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageDebug = () => {
  const { currentLanguage, getCurrentLanguageInfo } = useLanguage();
  const { i18n, t } = useTranslation();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      maxWidth: '300px'
    }}>
      <div>🌍 Language Debug:</div>
      <div>Context: {currentLanguage}</div>
      <div>i18n: {i18n.language}</div>
      <div>LocalStorage: {localStorage.getItem('selectedLanguage')}</div>
      <div>Document: {document.documentElement.lang}</div>
      <div>Test: {t('dashboard.welcomeBack', { userName: 'Test' })}</div>
      <div>Initialized: {i18n.isInitialized ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default LanguageDebug; 