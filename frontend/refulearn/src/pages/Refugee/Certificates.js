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
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      title: 'English Communication Certificate',
      description: 'Successfully completed the English Communication course with distinction.',
      issueDate: '2024-03-15',
      courseId: 1,
      score: 85,
      instructor: 'Dr. Sarah Johnson'
    },
    {
      id: 2,
      title: 'Digital Skills Certificate',
      description: 'Demonstrated proficiency in basic computer and digital skills.',
      issueDate: '2024-02-28',
      courseId: 2,
      score: 92,
      instructor: 'Prof. Michael Chen'
    },
    {
      id: 3,
      title: 'Job Search Strategies Certificate',
      description: 'Successfully completed the Job Search Strategies course.',
      issueDate: '2024-04-10',
      courseId: 3,
      score: 88,
      instructor: 'Ms. Emily Carter'
    },
    {
      id: 4,
      title: 'Professional Networking Certificate',
      description: 'Completed the Professional Networking module.',
      issueDate: '2024-04-12',
      courseId: 4,
      score: 95,
      instructor: 'Mr. David Lee'
    },
    {
      id: 5,
      title: 'Financial Literacy Certificate',
      description: 'Demonstrated understanding of basic financial concepts.',
      issueDate: '2024-04-14',
      courseId: 5,
      score: 80,
      instructor: 'Dr. Anna Gomez'
    },
    {
      id: 6,
      title: 'Cultural Adaptation Workshop Certificate',
      description: 'Participated in the Cultural Adaptation Workshop.',
      issueDate: '2024-04-16',
      courseId: 6,
      score: null,
      instructor: 'Ms. Maria Rodriguez'
    }
  ]);
  const [shareDropdown, setShareDropdown] = useState(null); // certificateId or null
  const dropdownRef = useRef();
  const buttonRefs = useRef({});
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

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
    const cert = certificates.find(c => c.id === certificateId);
    const blob = new Blob([
      `Certificate of Achievement\n\nTitle: ${cert.title}\nDescription: ${cert.description}\nIssued: ${cert.issueDate}\nInstructor: ${cert.instructor}\n${cert.score !== null ? `Score: ${cert.score}%` : ''}`
    ], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.title.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (certificateId, platform) => {
    const cert = certificates.find(c => c.id === certificateId);
    const shareText = encodeURIComponent(`I just earned the ${cert.title} on RefuLearn! 🎉 #achievement #certificate`);
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

  return (
    <ContentWrapper>
      <Container>
        <Header>
          <Title>Your Certificates</Title>
        </Header>
        <CertificateGrid>
          {certificates.map(certificate => (
            <CertificateCard key={certificate.id}>
              <CertificateHeader>
                <CertificateTitle>{certificate.title}</CertificateTitle>
                <CertificateDate>
                  Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                </CertificateDate>
              </CertificateHeader>
              <CertificateContent>
                <CertificateDescription>
                  {certificate.description}
                </CertificateDescription>
                <CertificateMeta>
                  {certificate.score !== null && <span>Score: {certificate.score}%</span>}
                  <span>Instructor: {certificate.instructor}</span>
                </CertificateMeta>
                <DownloadButton onClick={() => handleDownload(certificate.id)}>
                  Download Certificate
                </DownloadButton>
                <div style={{ position: 'relative', zIndex: 1000 }}>
                  <ShareButton
                    ref={el => (buttonRefs.current[certificate.id] = el)}
                    onClick={() => setShareDropdown(shareDropdown === certificate.id ? null : certificate.id)}
                  >
                    Share Certificate
                  </ShareButton>
                </div>
              </CertificateContent>
            </CertificateCard>
          ))}
        </CertificateGrid>
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