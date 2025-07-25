import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageRouting } from '../hooks/useLanguageRouting';

const LanguageRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { getTranslatedPath, getCurrentEnglishPath } = useLanguageRouting();

  useEffect(() => {
    // Only redirect if we're not on the landing page or auth pages
    const isAuthPage = ['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
    
    if (!isAuthPage) {
      const currentEnglishPath = getCurrentEnglishPath();
      const translatedPath = getTranslatedPath(currentEnglishPath);
      
      // Only redirect if the translated path is different from current path
      if (translatedPath !== location.pathname) {
        console.log(`🌍 Language changed, redirecting from ${location.pathname} to ${translatedPath}`);
        navigate(translatedPath, { replace: true });
      }
    }
  }, [i18n.language, location.pathname, navigate, getTranslatedPath, getCurrentEnglishPath]);

  return null; // This component doesn't render anything
};

export default LanguageRedirect; 