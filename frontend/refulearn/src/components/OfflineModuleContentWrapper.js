import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import offlineModuleContentService from '../services/offlineModuleContentService';

const OfflineModuleContentWrapper = ({ children }) => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeOfflineService = async () => {
      try {
        console.log('🔧 Initializing offline module content service...');
        await offlineModuleContentService.initialize();
        setIsInitialized(true);
        console.log('✅ Offline module content service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize offline module content service:', error);
        setError('Failed to initialize offline service');
      }
    };

    initializeOfflineService();
  }, []);

  // Provide offline service context to children
  const contextValue = {
    offlineModuleContentService,
    isInitialized,
    courseId,
    moduleId
  };

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        background: '#fff3cd', 
        borderRadius: '8px', 
        border: '1px solid #ffeaa7',
        margin: '1rem'
      }}>
        <div style={{ color: '#856404', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center' 
      }}>
        <div>Initializing offline service...</div>
      </div>
    );
  }

  // Render children with offline service context
  return React.cloneElement(children, { offlineModuleContentService: contextValue });
};

export default OfflineModuleContentWrapper; 