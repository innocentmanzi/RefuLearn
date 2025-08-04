import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-width: 300px;
  
  @media (max-width: 768px) {
    top: 5px;
    right: 5px;
    left: 5px;
    max-width: none;
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }
`;

const OnlineStatus = styled(StatusContainer)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
`;

const OfflineStatusContainer = styled(StatusContainer)`
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
`;

const SyncStatus = styled(StatusContainer)`
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
`;

const StatusIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1rem;
`;

const StatusText = styled.span`
  display: flex;
  align-items: center;
`;

const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);
      
      // Hide online message after 3 seconds
      setTimeout(() => {
        setShowOnlineMessage(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineMessage(false);
    };

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event) => {
      const { type, message } = event.data;
      
      switch (type) {
        case 'BACKGROUND_SYNC':
          setIsSyncing(true);
          setSyncMessage(message || 'Syncing data...');
          break;
          
        case 'SYNC_COMPLETE':
          setIsSyncing(false);
          setSyncMessage('');
          break;
          
        case 'TRIGGER_SYNC':
          setIsSyncing(true);
          setSyncMessage('Syncing offline changes...');
          break;
          
        default:
          break;
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Show sync status first priority
  if (isSyncing) {
    return (
      <SyncStatus>
        <StatusText>
          <StatusIcon>🔄</StatusIcon>
          {syncMessage}
        </StatusText>
      </SyncStatus>
    );
  }

  // Show online message temporarily when coming back online
  if (showOnlineMessage && isOnline) {
    return (
      <OnlineStatus show={showOnlineMessage}>
        <StatusText>
          <StatusIcon>🟢</StatusIcon>
          You're back online! Data will sync automatically.
        </StatusText>
      </OnlineStatus>
    );
  }

  // Show offline status when offline
  if (!isOnline) {
    return (
      <OfflineStatusContainer>
        <StatusText>
          <StatusIcon>📱</StatusIcon>
          You're offline. Cached content is available.
        </StatusText>
      </OfflineStatusContainer>
    );
  }

  // Don't show anything when online and not syncing
  return null;
};

export default OfflineStatus; 