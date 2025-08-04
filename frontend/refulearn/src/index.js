import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/global-theme.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable service worker for offline functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ RefuLearn is now available offline!');
    // Initialize enhanced PWA features
    serviceWorkerRegistration.initializePWAFeatures();
  },
  onUpdate: (registration) => {
    console.log('🔄 New version available! Please refresh to update.');
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
