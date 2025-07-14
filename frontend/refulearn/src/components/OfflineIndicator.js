import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const OfflineIndicator = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.isOnline ? '#28a745' : '#dc3545'};
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 9999;
  transition: transform 0.3s ease-in-out;
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-100%)'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const OfflineMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const OnlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const OfflineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 9l-2 2c-1-1-2.5-1.5-4-1.5s-3 .5-4 1.5L11 9c1.5-1.5 3.5-2.5 6-2.5s4.5 1 6 2.5zM19 13l-2 2c-.5-.5-1.5-1-2-1s-1.5.5-2 1l-2-2c1-1 2.5-1.5 4-1.5s3 .5 4 1.5z"/>
    <path d="m2 3 20 20-1.5 1.5L18 22l-1-1c-.5.5-1.5 1-2 1s-1.5-.5-2-1l-1 1L9.5 19.5 2 12l1.5-1.5z"/>
  </svg>
);

const OfflineNotification = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (hasBeenOffline) {
        setShowIndicator(true);
        setTimeout(() => setShowIndicator(false), 3000); // Hide after 3 seconds
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
      setHasBeenOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasBeenOffline]);

  if (!isOnline) {
    return (
      <OfflineIndicator isOnline={isOnline} show={showIndicator}>
        <OfflineMessage>
          <OfflineIcon />
          <span>
            📱 You're offline - Don't worry! You can still access cached content and continue learning
          </span>
        </OfflineMessage>
      </OfflineIndicator>
    );
  }

  if (isOnline && hasBeenOffline && showIndicator) {
    return (
      <OfflineIndicator isOnline={isOnline} show={showIndicator}>
        <OfflineMessage>
          <OnlineIcon />
          <span>🎉 Back online! All features are now available</span>
        </OfflineMessage>
      </OfflineIndicator>
    );
  }

  return null;
};

export default OfflineNotification; 