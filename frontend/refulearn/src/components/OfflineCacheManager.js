import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import offlineIntegrationService from '../services/offlineIntegrationService';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h3`
  color: #1f2937;
  margin: 0;
  font-size: 1.2rem;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.online ? '#10b981' : '#f59e0b'};
`;

const StorageInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StorageCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
`;

const StorageLabel = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const StorageValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.primary && `
    background: #3b82f6;
    color: white;
    &:hover {
      background: #2563eb;
    }
  `}
  
  ${props => props.danger && `
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
  `}
  
  ${props => props.secondary && `
    background: #6b7280;
    color: white;
    &:hover {
      background: #4b5563;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DetailsList = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
`;

const DetailsToggle = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DatabaseName = styled.span`
  font-weight: 500;
  color: #374151;
`;

const DatabaseStats = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
`;

const OfflineCacheManager = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadStorageInfo();
    
    // Listen for network changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadStorageInfo = async () => {
    try {
      setLoading(true);
      const info = await offlineIntegrationService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await offlineIntegrationService.triggerSync();
      await loadStorageInfo(); // Refresh storage info
      alert('Sync completed successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        await offlineIntegrationService.clearOfflineData();
        await loadStorageInfo();
        alert('Offline data cleared successfully!');
      } catch (error) {
        console.error('Failed to clear cache:', error);
        alert('Failed to clear cache. Please try again.');
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = () => {
    if (!storageInfo) return 0;
    const quota = 50 * 1024 * 1024; // Assume 50MB quota for estimate
    return Math.min((storageInfo.total / quota) * 100, 100);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading storage information...
        </div>
      </Container>
    );
  }

  const totalDatabases = Object.keys(storageInfo?.databases || {}).length;
  const totalDocuments = Object.values(storageInfo?.databases || {}).reduce((sum, db) => sum + db.docs, 0);

  return (
    <Container>
      <Header>
        <Title>Offline Storage Manager</Title>
        <Status online={isOnline}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </Status>
      </Header>

      <StorageInfo>
        <StorageCard>
          <StorageLabel>Total Storage Used</StorageLabel>
          <StorageValue>{formatBytes(storageInfo?.total || 0)}</StorageValue>
          <ProgressBar>
            <ProgressFill percentage={getUsagePercentage()} />
          </ProgressBar>
        </StorageCard>

        <StorageCard>
          <StorageLabel>Databases</StorageLabel>
          <StorageValue>{totalDatabases}</StorageValue>
        </StorageCard>

        <StorageCard>
          <StorageLabel>Cached Documents</StorageLabel>
          <StorageValue>{totalDocuments}</StorageValue>
        </StorageCard>

        <StorageCard>
          <StorageLabel>localStorage</StorageLabel>
          <StorageValue>{formatBytes(storageInfo?.localStorage || 0)}</StorageValue>
        </StorageCard>
      </StorageInfo>

      <ActionButtons>
        <Button 
          primary 
          onClick={handleSync} 
          disabled={!isOnline || syncing}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
        
        <Button secondary onClick={loadStorageInfo}>
          Refresh Info
        </Button>
        
        <Button danger onClick={handleClearCache}>
          Clear All Cache
        </Button>
      </ActionButtons>

      <DetailsList>
        <DetailsToggle onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide Details' : 'Show Database Details'}
        </DetailsToggle>
        
        {showDetails && storageInfo?.databases && (
          <div>
            {Object.entries(storageInfo.databases || {}).map(([name, info]) => (
              <DetailItem key={name}>
                <DatabaseName>{name}</DatabaseName>
                <DatabaseStats>
                  {info.docs} docs • {formatBytes(info.size)}
                </DatabaseStats>
              </DetailItem>
            ))}
          </div>
        )}
      </DetailsList>
    </Container>
  );
};

export default OfflineCacheManager; 