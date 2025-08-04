import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';
import offlineIntegrationService from '../services/offlineIntegrationService';

const CertificateContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 1rem 0;
`;

const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const CertificateCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
    opacity: 0.3;
  }
`;

const CertificateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const CertificateTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const CertificateNumber = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
`;

const CertificateDetails = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const DetailLabel = styled.span`
  opacity: 0.8;
`;

const DetailValue = styled.span`
  font-weight: 500;
`;

const CertificateActions = styled.div`
  display: flex;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &.primary {
    background: rgba(255,255,255,0.9);
    color: #333;
    
    &:hover {
      background: white;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: rgba(255,255,255,0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    
    &:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #28a745;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  &.verified {
    background: #28a745;
  }
  
  &.offline {
    background: #ffc107;
    color: #000;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const VerificationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const VerificationResult = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  
  &.success {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }
  
  &.error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }
`;

const CertificatePreview = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  margin-bottom: 1rem;
  text-align: center;
`;

const PreviewTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const PreviewDetails = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.9;
`;

const OfflineCertificateManager = () => {
  const { user } = useUser();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [processing, setProcessing] = useState(new Set());
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNumber, setVerificationNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, activeFilter]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const certificatesData = await offlineIntegrationService.getOfflineCertificates(user?.id);
      setCertificates(certificatesData || []);
    } catch (error) {
      console.error('❌ Failed to load certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = certificates;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(certificate =>
        certificate.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'verified':
        filtered = filtered.filter(certificate => certificate.verified);
        break;
      case 'offline':
        filtered = filtered.filter(certificate => certificate.isOfflineCertificate);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredCertificates(filtered);
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      setProcessing(prev => new Set(prev).add(certificateId));
      
      const certificate = await offlineIntegrationService.downloadCertificate(certificateId);
      
      // Update certificate in state
      setCertificates(prev => prev.map(cert =>
        cert.id === certificateId
          ? { ...cert, downloaded: true, downloadedAt: Date.now() }
          : cert
      ));
      
      // Create download link
      const blob = new Blob([certificate.pdfData.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificate.certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Certificate downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download certificate:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(certificateId);
        return newSet;
      });
    }
  };

  const handleGenerateCertificate = async (courseId) => {
    try {
      setProcessing(prev => new Set(prev).add('generate'));
      
      const certificate = await offlineIntegrationService.generateCertificate(courseId);
      
      setCertificates(prev => [certificate, ...prev]);
      
      console.log('✅ Certificate generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate certificate:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete('generate');
        return newSet;
      });
    }
  };

  const handleVerifyCertificate = async () => {
    if (!verificationNumber) return;
    
    try {
      setProcessing(prev => new Set(prev).add('verify'));
      
      const result = await offlineIntegrationService.verifyCertificate(verificationNumber);
      setVerificationResult(result);
      
      console.log('✅ Certificate verification completed');
    } catch (error) {
      console.error('❌ Failed to verify certificate:', error);
      setVerificationResult({
        valid: false,
        message: 'Verification failed'
      });
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete('verify');
        return newSet;
      });
    }
  };

  const handleViewCertificate = (certificate) => {
    window.open(`/certificate/${certificate.id}`, '_blank');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  };

  const getCertificateGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <CertificateContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          Loading certificates...
        </div>
      </CertificateContainer>
    );
  }

  return (
    <>
      <CertificateContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Certificate Management</h2>
          <ActionButton
            className="primary"
            onClick={() => setShowVerificationModal(true)}
            style={{ background: '#007bff', color: 'white' }}
          >
            Verify Certificate
          </ActionButton>
        </div>
        
        <SearchBar
          type="text"
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterButtons>
          <FilterButton
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            All Certificates
          </FilterButton>
          <FilterButton
            active={activeFilter === 'verified'}
            onClick={() => setActiveFilter('verified')}
          >
            Verified
          </FilterButton>
          <FilterButton
            active={activeFilter === 'offline'}
            onClick={() => setActiveFilter('offline')}
          >
            Offline
          </FilterButton>
        </FilterButtons>

        {filteredCertificates.length === 0 ? (
          <EmptyState>
            <p>No certificates found. Complete courses to earn certificates!</p>
          </EmptyState>
        ) : (
          <CertificateGrid>
            {filteredCertificates.map((certificate, index) => {
              const isProcessing = processing.has(certificate.id);
              
              return (
                <CertificateCard
                  key={certificate.id}
                  style={{ background: getCertificateGradient(index) }}
                >
                  <CertificateHeader>
                    <div>
                      <CertificateTitle>
                        {certificate.title || certificate.courseName || 'Certificate'}
                      </CertificateTitle>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                        {certificate.courseName || 'Course Certificate'}
                      </div>
                    </div>
                    <CertificateNumber>
                      {certificate.certificateNumber}
                    </CertificateNumber>
                  </CertificateHeader>
                  
                  <CertificateDetails>
                    <DetailRow>
                      <DetailLabel>Issued Date:</DetailLabel>
                      <DetailValue>{formatDate(certificate.issuedAt)}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Recipient:</DetailLabel>
                      <DetailValue>{user?.firstName} {user?.lastName}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Status:</DetailLabel>
                      <DetailValue>{certificate.status || 'Active'}</DetailValue>
                    </DetailRow>
                  </CertificateDetails>
                  
                  <CertificateActions>
                    <ActionButton
                      className="primary"
                      onClick={() => handleViewCertificate(certificate)}
                    >
                      View
                    </ActionButton>
                    <ActionButton
                      className="secondary"
                      onClick={() => handleDownloadCertificate(certificate.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <LoadingSpinner /> : 'Download'}
                    </ActionButton>
                  </CertificateActions>
                  
                  {certificate.verified && (
                    <StatusBadge className="verified">
                      ✓ Verified
                    </StatusBadge>
                  )}
                  
                  {certificate.isOfflineCertificate && (
                    <StatusBadge className="offline">
                      📴 Offline
                    </StatusBadge>
                  )}
                </CertificateCard>
              );
            })}
          </CertificateGrid>
        )}
      </CertificateContainer>

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal>
          <ModalContent>
            <ModalHeader>
              <h3>Verify Certificate</h3>
              <CloseButton onClick={() => setShowVerificationModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Certificate Number
              </label>
              <Input
                type="text"
                value={verificationNumber}
                onChange={(e) => setVerificationNumber(e.target.value)}
                placeholder="Enter certificate number..."
              />
            </div>
            
            <ActionButton
              className="primary"
              onClick={handleVerifyCertificate}
              disabled={!verificationNumber || processing.has('verify')}
              style={{ 
                background: '#007bff', 
                color: 'white', 
                width: '100%',
                marginBottom: '1rem'
              }}
            >
              {processing.has('verify') ? <LoadingSpinner /> : 'Verify Certificate'}
            </ActionButton>
            
            {verificationResult && (
              <VerificationResult className={verificationResult.valid ? 'success' : 'error'}>
                {verificationResult.valid ? (
                  <div>
                    <strong>✅ Certificate is valid!</strong>
                    {verificationResult.certificate && (
                      <CertificatePreview>
                        <PreviewTitle>{verificationResult.certificate.title}</PreviewTitle>
                        <PreviewDetails>
                          <div>Certificate Number: {verificationResult.certificate.certificateNumber}</div>
                          <div>Issued: {formatDate(verificationResult.certificate.issuedAt)}</div>
                          <div>Status: {verificationResult.certificate.status}</div>
                          {verificationResult.verifiedOffline && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                              ⚠️ Verified offline - sync with server for full verification
                            </div>
                          )}
                        </PreviewDetails>
                      </CertificatePreview>
                    )}
                  </div>
                ) : (
                  <div>
                    <strong>❌ Certificate is invalid</strong>
                    <div>{verificationResult.message}</div>
                  </div>
                )}
              </VerificationResult>
            )}
          </ModalContent>
        </VerificationModal>
      )}
    </>
  );
};

export default OfflineCertificateManager; 