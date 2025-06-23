import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const ApplicantList = styled.div`
  margin-top: 1.5rem;
`;

const ApplicantCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 2fr 3fr 1fr 2fr;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const ApplicantHeader = styled.div`
  background: #f8f9fa;
  font-weight: 600;
  color: #666;
  border-radius: 8px 8px 0 0;
  cursor: default;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 2fr 3fr 1fr 2fr;
  align-items: center;
  gap: 1rem;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  @media (max-width: 992px) {
    display: none;
  }
`;

const ApplicantInfo = styled.div`
  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  p {
    margin: 0;
    color: #666;
  }

  @media (max-width: 992px) {
    display: flex;
    &::before {
      content: attr(data-label);
      font-weight: bold;
      width: 120px;
      min-width: 120px;
      display: inline-block;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4em 0.9em;
  border-radius: 16px;
  font-size: 0.85em;
  font-weight: 500;
  color: #fff;
  background: ${({ status }) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'Reviewed': return '#17a2b8';
      case 'Interviewed': return '#007bff';
      case 'Rejected': return '#dc3545';
      case 'Hired': return '#28a745';
      default: return '#6c757d';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  
  @media (max-width: 992px) {
    justify-content: flex-start;
    margin-top: 0.5rem;
    &::before {
      content: 'Actions:';
      font-weight: bold;
      width: 120px;
      min-width: 120px;
      display: inline-block;
    }
  }
`;

const ActionButton = styled.button`
  background: ${({ color }) => color || '#007bff'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PageButton = styled.button`
  background: ${({ active }) => active ? '#007bff' : '#fff'};
  color: ${({ active }) => active ? '#fff' : '#007bff'};
  border: 1px solid #007bff;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;

  &:hover:not(:disabled) {
    background: ${({ active }) => active ? '#0056b3' : '#f8f9fa'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageSizeSelector = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const ViewApplicants = () => {
  const applicantsData = [
    {
      id: 1,
      name: 'Ahmed Ali',
      jobTitle: 'Software Engineer',
      status: 'Pending',
      appliedDate: '2025-06-01',
      experience: [
        { company: 'TechOrg', role: 'Frontend Developer', years: 2 },
        { company: 'WebSoft', role: 'Intern', years: 1 }
      ],
      skills: ['JavaScript', 'React', 'CSS', 'HTML'],
      education: [
        { school: 'Cairo University', degree: 'BSc Computer Science', year: 2022 }
      ],
      bio: 'Passionate software engineer with a focus on frontend development and user experience.'
    },
    {
      id: 2,
      name: 'Fatima Zahra',
      jobTitle: 'Marketing Specialist',
      status: 'Reviewed',
      appliedDate: '2025-05-28',
      experience: [
        { company: 'MarketPro', role: 'Marketing Assistant', years: 1 },
        { company: 'AdWorld', role: 'Intern', years: 1 }
      ],
      skills: ['SEO', 'Content Creation', 'Analytics'],
      education: [
        { school: 'University of Rabat', degree: 'BA Marketing', year: 2021 }
      ],
      bio: 'Creative marketer with experience in digital campaigns and content strategy.'
    },
    {
      id: 3,
      name: 'Omar Sharif',
      jobTitle: 'Data Scientist',
      status: 'Interviewed',
      appliedDate: '2025-05-25',
      experience: [
        { company: 'DataCorp', role: 'Junior Data Scientist', years: 1 }
      ],
      skills: ['Python', 'Machine Learning', 'SQL'],
      education: [
        { school: 'American University in Cairo', degree: 'MSc Data Science', year: 2024 }
      ],
      bio: 'Data enthusiast with a strong background in machine learning and analytics.'
    },
    {
      id: 4,
      name: 'Layla Hassan',
      jobTitle: 'UI/UX Designer',
      status: 'Rejected',
      appliedDate: '2025-05-20',
      experience: [
        { company: 'Designify', role: 'UI Designer', years: 2 }
      ],
      skills: ['Figma', 'Sketch', 'User Research'],
      education: [
        { school: 'University of Nairobi', degree: 'BA Design', year: 2023 }
      ],
      bio: 'UI/UX designer with a passion for creating intuitive digital experiences.'
    },
    {
      id: 5,
      name: 'Yusuf Khan',
      jobTitle: 'Software Engineer',
      status: 'Pending',
      appliedDate: '2025-05-18',
      experience: [
        { company: 'CodeCorp', role: 'Backend Developer', years: 3 }
      ],
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
      education: [
        { school: 'University of Karachi', degree: 'BSc Computer Science', year: 2021 }
      ],
      bio: 'Experienced backend developer with expertise in Java and microservices architecture.'
    },
    {
      id: 6,
      name: 'Aisha Patel',
      jobTitle: 'Product Manager',
      status: 'Reviewed',
      appliedDate: '2025-05-15',
      experience: [
        { company: 'ProductHub', role: 'Associate Product Manager', years: 2 }
      ],
      skills: ['Product Strategy', 'User Research', 'Agile', 'Analytics'],
      education: [
        { school: 'Delhi University', degree: 'MBA Business Administration', year: 2023 }
      ],
      bio: 'Product manager with a strong focus on user-centered design and data-driven decision making.'
    },
    {
      id: 7,
      name: 'Hassan Al-Rashid',
      jobTitle: 'DevOps Engineer',
      status: 'Interviewed',
      appliedDate: '2025-05-12',
      experience: [
        { company: 'CloudTech', role: 'DevOps Engineer', years: 2 },
        { company: 'InfraCorp', role: 'System Administrator', years: 1 }
      ],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
      education: [
        { school: 'King Fahd University', degree: 'BSc Information Technology', year: 2022 }
      ],
      bio: 'DevOps engineer passionate about automation and cloud infrastructure.'
    },
    {
      id: 8,
      name: 'Zara Ahmed',
      jobTitle: 'Content Writer',
      status: 'Rejected',
      appliedDate: '2025-05-10',
      experience: [
        { company: 'ContentPro', role: 'Content Writer', years: 1 }
      ],
      skills: ['Content Writing', 'SEO', 'Social Media', 'Copywriting'],
      education: [
        { school: 'Lahore University', degree: 'BA English Literature', year: 2024 }
      ],
      bio: 'Creative content writer with expertise in digital marketing and SEO optimization.'
    }
  ];

  const [applicants] = useState(applicantsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredApplicants = applicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredApplicants.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = (id) => {
    const applicant = applicants.find(a => a.id === id);
    setSelectedApplicant(applicant);
  };

  const closeModal = () => setSelectedApplicant(null);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <Container>
      <Title>View Applicants</Title>
      <Header>
        <SearchBar
          placeholder="Search applicants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <PageSizeSelector
          value={pageSize}
          onChange={(e) => handlePageSizeChange(e.target.value)}
        >
          <option value={3}>3 per page</option>
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </PageSizeSelector>
      </Header>

      <ApplicantList>
        <ApplicantHeader>
          <div>Name</div>
          <div>Job Applied For</div>
          <div>Status</div>
          <div>Actions</div>
        </ApplicantHeader>
        {currentApplicants.map(applicant => (
          <ApplicantCard key={applicant.id} onClick={() => handleViewDetails(applicant.id)}>
            <ApplicantInfo data-label="Name:">
              <h3>{applicant.name}</h3>
            </ApplicantInfo>
            <ApplicantInfo data-label="Job:">
              <p>{applicant.jobTitle}</p>
            </ApplicantInfo>
            <ApplicantInfo data-label="Status:">
              <StatusBadge status={applicant.status}>{applicant.status}</StatusBadge>
            </ApplicantInfo>
            <ActionButtons>
              <ActionButton 
                color="#007bff" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleViewDetails(applicant.id); 
                }}
              >
                View Details
              </ActionButton>
            </ActionButtons>
          </ApplicantCard>
        ))}
      </ApplicantList>

      <PaginationContainer>
        <PaginationInfo>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredApplicants.length)} of {filteredApplicants.length} applicants
        </PaginationInfo>
        
        <PaginationControls>
          <PageButton 
            onClick={goToPreviousPage} 
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          
          {getPageNumbers().map((page, index) => (
            <PageButton
              key={index}
              onClick={() => typeof page === 'number' ? goToPage(page) : null}
              active={page === currentPage}
              disabled={page === '...'}
            >
              {page}
            </PageButton>
          ))}
          
          <PageButton 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </PaginationControls>
      </PaginationContainer>

      {selectedApplicant && (
        <ModalOverlay>
          <ModalContent>
            <h2>Applicant Details</h2>
            <div><b>ID:</b> {selectedApplicant.id}</div>
            <div><b>Name:</b> {selectedApplicant.name}</div>
            <div><b>Job Applied For:</b> {selectedApplicant.jobTitle}</div>
            <div><b>Status:</b> {selectedApplicant.status}</div>
            <div><b>Applied Date:</b> {selectedApplicant.appliedDate}</div>
            <div style={{ marginTop: 12 }}><b>Past Experience:</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {selectedApplicant.experience.map((exp, i) => (
                  <li key={i}>{exp.role} at {exp.company} ({exp.years} year{exp.years > 1 ? 's' : ''})</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 12 }}><b>Skills:</b> {selectedApplicant.skills.join(', ')}</div>
            <div style={{ marginTop: 12 }}><b>Education:</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {selectedApplicant.education.map((edu, i) => (
                  <li key={i}>{edu.degree}, {edu.school} ({edu.year})</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 12 }}><b>Biography:</b> <span style={{ color: '#555' }}>{selectedApplicant.bio}</span></div>
            <ActionButton color="#6c757d" onClick={closeModal} style={{ marginTop: 16 }}>Close</ActionButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ViewApplicants; 