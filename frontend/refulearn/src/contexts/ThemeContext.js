import React, { createContext, useContext, useState, useEffect } from 'react';

// Define comprehensive theme configurations
const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
      black: '#000000',
      white: '#ffffff',
      
      // Background colors
      background: '#ffffff',
      backgroundSecondary: '#f8f9fa',
      backgroundTertiary: '#e9ecef',
      
      // Text colors
      text: '#212529',
      textSecondary: '#6c757d',
      textLight: '#adb5bd',
      
      // Border colors
      border: '#dee2e6',
      borderLight: '#e9ecef',
      
      // Component specific
      cardBackground: '#ffffff',
      sidebarBackground: '#007bff',
      headerBackground: '#ffffff',
      navText: '#ffffff',
      
      // Status colors
      online: '#28a745',
      offline: '#6c757d',
      error: '#dc3545',
      
      // Interactive elements
      hover: 'rgba(0, 123, 255, 0.1)',
      active: 'rgba(0, 123, 255, 0.2)',
      focus: 'rgba(0, 123, 255, 0.25)',
      
      // Shadows
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowLight: 'rgba(0, 0, 0, 0.05)',
      shadowDark: 'rgba(0, 0, 0, 0.15)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      secondary: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    }
  },
  
  dark: {
    name: 'Dark',
    colors: {
      primary: '#4dabf7',
      secondary: '#868e96',
      success: '#51cf66',
      warning: '#ffd43b',
      danger: '#ff6b6b',
      info: '#22b8cf',
      black: '#ffffff',
      white: '#000000',
      
      // Background colors
      background: '#121212',
      backgroundSecondary: '#1e1e1e',
      backgroundTertiary: '#2d2d2d',
      
      // Text colors
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      textLight: '#808080',
      
      // Border colors
      border: '#404040',
      borderLight: '#333333',
      
      // Component specific
      cardBackground: '#1e1e1e',
      sidebarBackground: '#1a1a1a',
      headerBackground: '#1e1e1e',
      navText: '#ffffff',
      
      // Status colors
      online: '#51cf66',
      offline: '#868e96',
      error: '#ff6b6b',
      
      // Interactive elements
      hover: 'rgba(77, 171, 247, 0.1)',
      active: 'rgba(77, 171, 247, 0.2)',
      focus: 'rgba(77, 171, 247, 0.25)',
      
      // Shadows
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowLight: 'rgba(0, 0, 0, 0.2)',
      shadowDark: 'rgba(0, 0, 0, 0.4)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4dabf7 0%, #339af0 100%)',
      secondary: 'linear-gradient(135deg, #868e96 0%, #6c757d 100%)',
      background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
    }
  },
  
  blue: {
    name: 'Ocean Blue',
    colors: {
      primary: '#0066cc',
      secondary: '#004499',
      success: '#00b894',
      warning: '#fdcb6e',
      danger: '#e17055',
      info: '#00cec9',
      black: '#2d3436',
      white: '#ffffff',
      
      // Background colors
      background: '#f0f8ff',
      backgroundSecondary: '#e6f3ff',
      backgroundTertiary: '#cce7ff',
      
      // Text colors
      text: '#2d3436',
      textSecondary: '#636e72',
      textLight: '#b2bec3',
      
      // Border colors
      border: '#b3d9ff',
      borderLight: '#d9ecff',
      
      // Component specific
      cardBackground: '#ffffff',
      sidebarBackground: '#0066cc',
      headerBackground: '#ffffff',
      navText: '#ffffff',
      
      // Status colors
      online: '#00b894',
      offline: '#636e72',
      error: '#e17055',
      
      // Interactive elements
      hover: 'rgba(0, 102, 204, 0.1)',
      active: 'rgba(0, 102, 204, 0.2)',
      focus: 'rgba(0, 102, 204, 0.25)',
      
      // Shadows
      shadow: 'rgba(0, 102, 204, 0.15)',
      shadowLight: 'rgba(0, 102, 204, 0.08)',
      shadowDark: 'rgba(0, 102, 204, 0.25)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
      secondary: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
    }
  },
  
  nature: {
    name: 'Nature Green',
    colors: {
      primary: '#27ae60',
      secondary: '#16a085',
      success: '#2ecc71',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#3498db',
      black: '#2c3e50',
      white: '#ffffff',
      
      // Background colors
      background: '#f8fff8',
      backgroundSecondary: '#f0fff0',
      backgroundTertiary: '#e8f5e8',
      
      // Text colors
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textLight: '#bdc3c7',
      
      // Border colors
      border: '#d5f4d5',
      borderLight: '#e8f5e8',
      
      // Component specific
      cardBackground: '#ffffff',
      sidebarBackground: '#27ae60',
      headerBackground: '#ffffff',
      navText: '#ffffff',
      
      // Status colors
      online: '#2ecc71',
      offline: '#7f8c8d',
      error: '#e74c3c',
      
      // Interactive elements
      hover: 'rgba(39, 174, 96, 0.1)',
      active: 'rgba(39, 174, 96, 0.2)',
      focus: 'rgba(39, 174, 96, 0.25)',
      
      // Shadows
      shadow: 'rgba(39, 174, 96, 0.15)',
      shadowLight: 'rgba(39, 174, 96, 0.08)',
      shadowDark: 'rgba(39, 174, 96, 0.25)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #27ae60 0%, #16a085 100%)',
      secondary: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
      background: 'linear-gradient(135deg, #f8fff8 0%, #f0fff0 100%)',
    }
  }
};

// Create theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeContextProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  
  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('refulearn-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      // Auto-detect system preference for dark mode
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setCurrentTheme('dark');
      }
    }
  }, []);
  
  // Save theme preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem('refulearn-theme', currentTheme);
    
    // Update document meta for theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themes[currentTheme].colors.primary);
    }
    
    // Update body class for global theme-specific styles
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentTheme}`);
  }, [currentTheme]);
  
  // Function to switch theme
  const switchTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };
  
  // Function to get next theme (for quick toggle)
  const toggleTheme = () => {
    const themeNames = Object.keys(themes);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setCurrentTheme(themeNames[nextIndex]);
  };
  
  // Function to toggle between light and dark specifically
  const toggleDarkMode = () => {
    setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };
  
  // Get current theme object
  const theme = themes[currentTheme];
  
  // Get all available themes
  const availableThemes = Object.keys(themes).map(key => ({
    key,
    name: themes[key].name,
    colors: themes[key].colors
  }));
  
  const contextValue = {
    currentTheme,
    theme,
    themes,
    availableThemes,
    switchTheme,
    toggleTheme,
    toggleDarkMode,
    isDark: currentTheme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export default ThemeContext; 