import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import offlineDataManager from '../services/offlineDataManager';

const OfflineIndicator = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => {
    if (props.syncStatus === 'syncing') return '#ffc107';
    if (props.syncStatus === 'error') return '#dc3545';
    return props.isOnline ? '#28a745' : '#6c757d';
  }};
  color: white;
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 9999;
  transition: all 0.3s ease-in-out;
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-100%)'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: ${props => props.hasDetails ? 'pointer' : 'default'};
`;

const OfflineMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const StatusDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.9;
  flex-wrap: wrap;
  justify-content: center;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  white-space: nowrap;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

// Icon components
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

const SyncIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
  </svg>
);

const QueueIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 17h6v-6H9v6zm1-5h4v4h-4v-4z"/>
    <path d="M20 6h-2V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-12 0V4h8v2H8z"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const EnhancedOfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [queuedActions, setQueuedActions] = useState(0);
  const [syncStats, setSyncStats] = useState({ totalSyncs: 0, successfulSyncs: 0, failedSyncs: 0 });
  const [syncProgress, setSyncProgress] = useState(0);
  const [isDataManagerReady, setIsDataManagerReady] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (hasBeenOffline) {
        setShowIndicator(true);
        setTimeout(() => {
          if (syncStatus === 'idle' || syncStatus === 'complete') {
            setShowIndicator(false);
          }
        }, 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
      setShowIndicator(true);
    };

    // Setup network listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
      setHasBeenOffline(true);
    }

    // Setup offline data manager listeners
    const setupOfflineManagerListeners = () => {
      if (offlineDataManager.isInitialized) {
        setIsDataManagerReady(true);
        
        offlineDataManager.on('syncStart', () => {
          setSyncStatus('syncing');
          setSyncProgress(0);
          setShowIndicator(true);
        });

        offlineDataManager.on('syncComplete', (data) => {
          setSyncStatus('complete');
          setSyncProgress(100);
          setLastSync(Date.now());
          
          // Update sync stats
          const status = offlineDataManager.getSyncStatus();
          setSyncStats(status.stats);
          setQueuedActions(status.conflictQueue);
          
          setTimeout(() => {
            if (isOnline) {
              setShowIndicator(false);
            }
          }, 2000);
        });

        offlineDataManager.on('syncError', (data) => {
          setSyncStatus('error');
          setShowIndicator(true);
          
          const status = offlineDataManager.getSyncStatus();
          setSyncStats(status.stats);
        });

        offlineDataManager.on('syncChange', (data) => {
          // Update progress based on sync changes
          const progress = Math.min(syncProgress + 10, 90);
          setSyncProgress(progress);
        });

        offlineDataManager.on('allSyncsComplete', () => {
          setSyncStatus('complete');
          setSyncProgress(100);
          setLastSync(Date.now());
        });

        offlineDataManager.on('syncPaused', () => {
          setSyncStatus('paused');
        });

        offlineDataManager.on('conflictQueued', () => {
          setQueuedActions(prev => prev + 1);
        });

        // Get initial status
        const initialStatus = offlineDataManager.getSyncStatus();
        setSyncStats(initialStatus.stats);
        setQueuedActions(initialStatus.conflictQueue);
        setLastSync(initialStatus.lastSync);
      } else {
        // Wait for initialization
        setTimeout(setupOfflineManagerListeners, 1000);
      }
    };

    setupOfflineManagerListeners();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasBeenOffline, syncStatus, syncProgress, isOnline]);

  const handleForceSync = () => {
    if (isDataManagerReady && isOnline) {
      offlineDataManager.forceSync();
    }
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleHideIndicator = () => {
    if (syncStatus !== 'syncing') {
      setShowIndicator(false);
    }
  };

  const getStatusMessage = () => {
    if (!isOnline) {
      return {
        icon: <OfflineIcon />,
        message: "You're offline - Cached content available",
        showDetails: true
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <SyncIcon />,
          message: "Syncing your data...",
          showDetails: true
        };
      case 'complete':
        return {
          icon: <OnlineIcon />,
          message: "All data synchronized",
          showDetails: true
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          message: "Sync failed - Will retry automatically",
          showDetails: true
        };
      case 'paused':
        return {
          icon: <OfflineIcon />,
          message: "Sync paused",
          showDetails: true
        };
      default:
        if (hasBeenOffline) {
          return {
            icon: <OnlineIcon />,
            message: "Back online! All features available",
            showDetails: false
          };
        }
        return null;
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    
    const now = Date.now();
    const diff = now - lastSync;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const statusInfo = getStatusMessage();
  
  if (!statusInfo && !showIndicator) {
    return null;
  }

  return (
    <OfflineIndicator 
      isOnline={isOnline} 
      show={showIndicator}
      syncStatus={syncStatus}
      hasDetails={statusInfo?.showDetails}
      onClick={statusInfo?.showDetails ? handleToggleDetails : undefined}
    >
      <OfflineMessage>
        {statusInfo?.icon}
        <span>{statusInfo?.message}</span>
        
        {isOnline && syncStatus !== 'syncing' && (
          <ActionButton onClick={handleForceSync} disabled={!isDataManagerReady}>
            🔄 Sync Now
          </ActionButton>
        )}
        
        {statusInfo?.showDetails && (
          <CollapseButton onClick={handleToggleDetails}>
            {showDetails ? '▼' : '▶'}
          </CollapseButton>
        )}
        
        {syncStatus !== 'syncing' && (
          <CollapseButton onClick={handleHideIndicator}>
            ✕
          </CollapseButton>
        )}
      </OfflineMessage>

      {showDetails && (
        <StatusDetails>
          <StatusItem>
            <SyncIcon />
            <span>Last: {formatLastSync()}</span>
          </StatusItem>
          
          <StatusItem>
            <span>✅ {syncStats.successfulSyncs}</span>
          </StatusItem>
          
          {syncStats.failedSyncs > 0 && (
            <StatusItem>
              <span>❌ {syncStats.failedSyncs}</span>
            </StatusItem>
          )}
          
          {queuedActions > 0 && (
            <StatusItem>
              <QueueIcon />
              <span>{queuedActions} queued</span>
            </StatusItem>
          )}
          
          {!isOnline && (
            <StatusItem>
              <span>📱 Offline mode active</span>
            </StatusItem>
          )}
        </StatusDetails>
      )}

      {syncStatus === 'syncing' && (
        <ProgressBar>
          <ProgressFill progress={syncProgress} />
        </ProgressBar>
      )}
    </OfflineIndicator>
  );
};

export default EnhancedOfflineIndicator; 