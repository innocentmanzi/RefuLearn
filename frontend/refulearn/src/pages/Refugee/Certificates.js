import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
`;

const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CertificateCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
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

const Certificates = () => {
  const navigate = useNavigate();
  const [certificates] = useState([
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

  const certificateCategories = [
    { id: 1, name: 'Language' },
    { id: 2, name: 'Digital Skills' },
    { id: 3, name: 'Job Readiness' },
    { id: 4, name: 'Professional Dev' },
    { id: 5, name: 'Finance' },
    { id: 6, name: 'Culture' },
  ];

  const [stats] = useState({
    totalCertificates: certificates.length,
    averageScore: certificates.filter(cert => cert.score !== null).reduce((acc, cert) => acc + cert.score, 0) / certificates.filter(cert => cert.score !== null).length || 0,
    coursesWithCertificates: new Set(certificates.map(cert => cert.courseId)).size
  });

  const handleDownload = (certificateId) => {
    // Implement certificate download functionality
    console.log(`Downloading certificate ${certificateId}`);
  };

  const handleShare = (certificateId) => {
    // Implement certificate sharing functionality
    console.log(`Sharing certificate ${certificateId}`);
  };

  return (
    <Container>
      <Header>
        <Title>Your Certificates</Title>
      </Header>

      <StatsContainer>
        <StatCard>
          <StatValue>{stats.totalCertificates}</StatValue>
          <StatLabel>Total Certificates</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averageScore.toFixed(1)}%</StatValue>
          <StatLabel>Average Score</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.coursesWithCertificates}</StatValue>
          <StatLabel>Courses Completed</StatLabel>
        </StatCard>
      </StatsContainer>

      <CardsGrid>
        {certificateCategories.map(category => (
          <Card key={category.id} onClick={() => console.log(`Clicked on certificate category: ${category.name}`)}>
            <CardTitle>{category.name}</CardTitle>
          </Card>
        ))}
      </CardsGrid>

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
              <ShareButton onClick={() => handleShare(certificate.id)}>
                Share Certificate
              </ShareButton>
            </CertificateContent>
          </CertificateCard>
        ))}
      </CertificateGrid>
    </Container>
  );
};

export default Certificates; 