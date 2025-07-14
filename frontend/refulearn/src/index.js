import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Suppress ResizeObserver loop errors in development
if (process.env.NODE_ENV === 'development') {
  const suppressedErrors = [
    'ResizeObserver loop completed with undelivered notifications.',
    'ResizeObserver loop limit exceeded'
  ];
  const realConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      suppressedErrors.some(se => args[0].includes(se))
    ) {
      return;
    }
    realConsoleError(...args);
  };
}

// Create a MUI theme (customize as needed)
const muiTheme = createTheme({
  palette: {
    primary: {
      main: theme.colors.primary,
    },
    secondary: {
      main: theme.colors.secondary,
    },
    background: {
      default: theme.colors.white,
    },
    text: {
      primary: theme.colors.black,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MuiThemeProvider theme={muiTheme}>
    <StyledThemeProvider theme={theme}>
      <CssBaseline />
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </StyledThemeProvider>
  </MuiThemeProvider>
);

// Enable offline functionality and faster loading with service worker
// This enables your app to work offline and load faster
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ Service Worker registered successfully for offline use');
  },
  onUpdate: (registration) => {
    console.log('🔄 New content available, please refresh');
    // Show update notification to user
    if (window.confirm('New version available! Refresh to update?')) {
      window.location.reload();
    }
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
