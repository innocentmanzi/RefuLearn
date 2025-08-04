import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const defaultLanguage = 'en';
    return savedLanguage || defaultLanguage;
  });

  // Function to fetch user's language preference from backend
  const fetchUserLanguagePreference = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Add a small delay to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch('/api/auth/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userLanguage = data.data.settings.language;
        
        if (userLanguage && userLanguage !== currentLanguage) {
          console.log(`🌍 Found user language preference: ${userLanguage}`);
          changeLanguage(userLanguage);
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch user language preference:', error);
    }
  };

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' }
  ];

  // Change language function
  const changeLanguage = (languageCode) => {
    try {
      // Change i18n language
      i18n.changeLanguage(languageCode);
      
      // Update state
      setCurrentLanguage(languageCode);
      
      // Save to localStorage for persistence
      localStorage.setItem('selectedLanguage', languageCode);
      
      // Update document direction for RTL languages if needed
      document.documentElement.lang = languageCode;
      
      // Force a small re-render to ensure all components update
      setTimeout(() => {
        window.dispatchEvent(new Event('languageChanged'));
      }, 100);
      
      console.log(`🌍 Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Initialize language on mount
  useEffect(() => {
    // Force set the language on app start
    const languageToUse = currentLanguage || 'en';
    
    // Always set i18n language
    i18n.changeLanguage(languageToUse);
    
    // Set document language
    document.documentElement.lang = languageToUse;
    
    // Save to localStorage if not already saved
    if (!localStorage.getItem('selectedLanguage')) {
      localStorage.setItem('selectedLanguage', languageToUse);
    }
    
    console.log(`🌍 Language initialized: ${languageToUse}, i18n language: ${i18n.language}`);
    
    // Fetch user's language preference from backend if authenticated
    fetchUserLanguagePreference();
  }, []); // Only run once on mount

  // Handle language changes
  useEffect(() => {
    if (currentLanguage && i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
      document.documentElement.lang = currentLanguage;
      console.log(`🌍 Language updated to: ${currentLanguage}`);
    }
  }, [currentLanguage, i18n]);

  // Watch for authentication changes to fetch user language preference
  useEffect(() => {
    const handleUserLogin = () => {
      console.log('🌍 User logged in, fetching language preference...');
      fetchUserLanguagePreference();
    };

    // Listen for user login events
    window.addEventListener('userLogin', handleUserLogin);

    // Also check immediately if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserLanguagePreference();
    }

    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    getCurrentLanguageInfo,
    isLanguageLoaded: i18n.isInitialized
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 