import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 0.8rem;
    border-bottom: 1px solid #eee;
    text-align: left;
  }
  th {
    background: #f8f9fa;
    color: #666;
    font-weight: 600;
  }
  tr:hover {
    background: #f0f0f0;
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
  margin-right: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: ${({ color }) => color && `${color}cc`};
  }
`;

const ViewApplicants = () => {
  const [applicants] = useState([
    { id: 1, name: 'Ahmed Ali', jobTitle: 'Software Engineer', status: 'Pending', appliedDate: '2025-06-01' },
    { id: 2, name: 'Fatima Zahra', jobTitle: 'Marketing Specialist', status: 'Reviewed', appliedDate: '2025-05-28' },
    { id: 3, name: 'Omar Sharif', jobTitle: 'Data Scientist', status: 'Interviewed', appliedDate: '2025-05-25' },
    { id: 4, name: 'Layla Hassan', jobTitle: 'UI/UX Designer', status: 'Rejected', appliedDate: '2025-05-20' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplicants = applicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (id) => {
    console.log('View details for applicant ID:', id);
    // In a real app, navigate to a detailed applicant profile page
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
      </Header>

      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Job Applied For</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map(applicant => (
              <tr key={applicant.id}>
                <td>{applicant.id}</td>
                <td>{applicant.name}</td>
                <td>{applicant.jobTitle}</td>
                <td>{applicant.status}</td>
                <td>{applicant.appliedDate}</td>
                <td>
                  <ActionButton onClick={() => handleViewDetails(applicant.id)}>View Details</ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default ViewApplicants; 