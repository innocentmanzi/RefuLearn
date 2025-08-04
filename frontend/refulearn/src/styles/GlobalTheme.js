import React from 'react';
import { ThemeProvider } from 'styled-components';

export const theme = {
  colors: {
    primary: '#007bff',   // Blue  
    secondary: '#000000', // Black
    black: '#000000',
    white: '#ffffff',
  },
};

export const GlobalThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}; 