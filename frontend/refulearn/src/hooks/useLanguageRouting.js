import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export const useLanguageRouting = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Map of English routes to their translated equivalents
  const getTranslatedPath = (englishPath) => {
    const pathSegments = englishPath.split('/').filter(segment => segment);
    
    if (pathSegments.length === 0) return '/';
    
    const translatedSegments = pathSegments.map(segment => {
      // Handle dynamic segments (those with : or containing numbers/IDs)
      if (segment.startsWith(':') || /\d/.test(segment) || segment.includes('-')) {
        return segment;
      }
      
      // Try to translate the segment
      const translatedSegment = t(`help.urls.${segment}`, segment);
      return translatedSegment;
    });
    
    return '/' + translatedSegments.join('/');
  };

  // Get the English equivalent of a translated path
  const getEnglishPath = (translatedPath) => {
    const pathSegments = translatedPath.split('/').filter(segment => segment);
    
    if (pathSegments.length === 0) return '/';
    
    const englishSegments = pathSegments.map(segment => {
      // Handle dynamic segments
      if (segment.startsWith(':') || /\d/.test(segment) || segment.includes('-')) {
        return segment;
      }
      
      // Find the English equivalent by checking all URL translations
      const urlKeys = ['dashboard', 'courses', 'jobs', 'certificates', 'help', 'profile', 'accountSettings', 'learningPath', 'myGrades'];
      
      for (const key of urlKeys) {
        const translated = t(`help.urls.${key}`, key);
        if (translated === segment) {
          return key;
        }
      }
      
      return segment;
    });
    
    return '/' + englishSegments.join('/');
  };

  // Navigate to a translated URL
  const navigateToTranslated = (englishPath, options = {}) => {
    const translatedPath = getTranslatedPath(englishPath);
    navigate(translatedPath, options);
  };

  // Get current path in English (for internal routing logic)
  const getCurrentEnglishPath = () => {
    return getEnglishPath(location.pathname);
  };

  // Check if current path matches a given English path
  const isCurrentPath = (englishPath) => {
    const currentEnglish = getCurrentEnglishPath();
    return currentEnglish === englishPath;
  };

  return {
    getTranslatedPath,
    getEnglishPath,
    navigateToTranslated,
    getCurrentEnglishPath,
    isCurrentPath,
    currentLanguage: i18n.language
  };
}; 