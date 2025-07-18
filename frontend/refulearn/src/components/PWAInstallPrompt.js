import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PromptContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 1rem;
  transform: translateY(${props => props.show ? '0' : '100px'});
  opacity: ${props => props.show ? '1' : '0'};
  transition: all 0.3s ease-in-out;
  
  @media (max-width: 768px) {
    left: 10px;
    right: 10px;
    padding: 1rem;
  }
`;

const Icon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.primary && `
    background: white;
    color: #667eea;
    &:hover {
      background: #f8f9fa;
    }
  `}
  
  ${props => props.secondary && `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `}
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // Check if user already dismissed the prompt
    const wasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissed(wasDismissed);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay if not dismissed and not installed
      if (!wasDismissed && !isStandalone) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 10000); // Show after 10 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during install:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const handleNotNow = () => {
    setShowPrompt(false);
    
    // Show again in this session after 5 minutes
    setTimeout(() => {
      if (!isInstalled && !dismissed && deferredPrompt) {
        setShowPrompt(true);
      }
    }, 5 * 60 * 1000);
  };

  // Don't show if already installed or permanently dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <PromptContainer show={showPrompt}>
      <Icon>📱</Icon>
      <Content>
        <Title>Install RefuLearn</Title>
        <Message>
          Get the best offline experience! Install RefuLearn as an app for faster access and offline learning.
        </Message>
      </Content>
      <Actions>
        <Button primary onClick={handleInstall}>
          Install
        </Button>
        <Button secondary onClick={handleNotNow}>
          Not Now
        </Button>
      </Actions>
      <CloseButton onClick={handleDismiss}>
        ×
      </CloseButton>
    </PromptContainer>
  );
};

// Component to show installation benefits
export const PWABenefitsModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
          Why Install RefuLearn?
        </h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span>Faster loading and better performance</span>
          </div>
          <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📱</span>
            <span>Works offline - learn anywhere, anytime</span>
          </div>
          <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            <span>Get notifications for important updates</span>
          </div>
          <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏠</span>
            <span>Add to home screen for quick access</span>
          </div>
          <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💾</span>
            <span>Automatic background sync</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 