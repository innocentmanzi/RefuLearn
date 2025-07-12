import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { FaLinkedin, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import ContentWrapper from '../../components/ContentWrapper';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CertificateCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 1.5rem;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
  }
`;

const CertificateHeader = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  position: relative;
`;

const CertificateTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: white;
`;

const CertificateDate = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const CertificateContent = styled.div`
  padding: 1.5rem;
`;

const CertificateDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
`;

const CertificateMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const DownloadButton = styled(ActionButton)`
  background: #4CAF50;
  
  &:hover {
    background: #45a049;
  }
`;

const ShareButton = styled(ActionButton)`
  background: #2196F3;
  margin-top: 0.5rem;
  
  &:hover {
    background: #1976D2;
  }
`;

const shareOptions = [
  { name: 'LinkedIn', icon: <FaLinkedin color="#0077b5" size={20} style={{ marginRight: 8 }} /> },
  { name: 'Facebook', icon: <FaFacebook color="#1877f3" size={20} style={{ marginRight: 8 }} /> },
  { name: 'Twitter', icon: <FaTwitter color="#1da1f2" size={20} style={{ marginRight: 8 }} /> },
  { name: 'Instagram', icon: <FaInstagram color="#e1306c" size={20} style={{ marginRight: 8 }} /> },
];

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareDropdown, setShareDropdown] = useState(null); // certificateId or null
  const dropdownRef = useRef();
  const buttonRefs = useRef({});
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Fetch user certificates on component mount
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/certificates/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCertificates(data.data.certificates || []);
        } else {
          setError('Failed to load certificates');
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Click-away handler for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShareDropdown(null);
      }
    }
    if (shareDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareDropdown]);

  // Position dropdown near the button
  useEffect(() => {
    if (shareDropdown !== null && buttonRefs.current[shareDropdown]) {
      const rect = buttonRefs.current[shareDropdown].getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [shareDropdown]);

  const handleDownload = (certificateId) => {
    const cert = certificates.find(c => c._id === certificateId);
    if (!cert) return;
    
    const blob = new Blob([
      `Certificate of Achievement\n\nTitle: ${cert.courseTitle}\nDescription: Successfully completed the course\nIssued: ${new Date(cert.issuedAt).toLocaleDateString()}\nCertificate Number: ${cert.certificateNumber}\n${cert.grade ? `Grade: ${cert.grade}%` : ''}`
    ], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.courseTitle.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (certificateId, platform) => {
    const cert = certificates.find(c => c._id === certificateId);
    if (!cert) return;
    
    const shareText = encodeURIComponent(`I just earned the ${cert.courseTitle} certificate on RefuLearn! 🎉 #achievement #certificate`);
    const shareUrl = encodeURIComponent(window.location.origin + '/certificates');
    let url = '';
    if (platform === 'LinkedIn') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${shareText}`;
    } else if (platform === 'Facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
    } else if (platform === 'Twitter') {
      url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
    } else if (platform === 'Instagram') {
      url = `https://www.instagram.com/`;
    }
    if (url) window.open(url, '_blank');
    setShareDropdown(null);
  };

  if (loading) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading certificates...</div>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            <div>{error}</div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Container>
        <Header>
          <Title>Your Certificates</Title>
        </Header>
        {certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <div>No certificates yet. Complete courses to earn certificates!</div>
          </div>
        ) : (
          <CertificateGrid>
            {certificates.map(certificate => (
              <CertificateCard key={certificate._id}>
                <CertificateHeader>
                  <CertificateTitle>{certificate.courseTitle}</CertificateTitle>
                  <CertificateDate>
                    Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                  </CertificateDate>
                </CertificateHeader>
                <CertificateContent>
                  <CertificateDescription>
                    Successfully completed the course with {certificate.grade ? `a grade of ${certificate.grade}%` : 'distinction'}.
                  </CertificateDescription>
                  <CertificateMeta>
                    {certificate.grade && <span>Grade: {certificate.grade}%</span>}
                    <span>Certificate #: {certificate.certificateNumber}</span>
                  </CertificateMeta>
                  <DownloadButton onClick={() => handleDownload(certificate._id)}>
                    Download Certificate
                  </DownloadButton>
                  <div style={{ position: 'relative', zIndex: 1000 }}>
                    <ShareButton
                      ref={el => (buttonRefs.current[certificate._id] = el)}
                      onClick={() => setShareDropdown(shareDropdown === certificate._id ? null : certificate._id)}
                    >
                      Share Certificate
                    </ShareButton>
                  </div>
                </CertificateContent>
              </CertificateCard>
            ))}
          </CertificateGrid>
        )}
        {shareDropdown !== null && ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 8,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              zIndex: 3000,
              minWidth: 200,
              padding: 4,
            }}
          >
            {shareOptions.map(opt => (
              <button
                key={opt.name}
                style={{ display: 'block', width: '100%', padding: '12px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 16 }}
                onClick={() => handleShare(shareDropdown, opt.name)}
              >
                {opt.icon} Share on {opt.name}
              </button>
            ))}
          </div>,
          document.body
        )}
      </Container>
    </ContentWrapper>
  );
};

export default Certificates;