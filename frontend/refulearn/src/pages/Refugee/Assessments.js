import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
import Sidebar from '../../components/Sidebar';

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const TableWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  min-width: unset;
  max-width: unset;
  box-sizing: border-box;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  min-width: unset;
  max-width: unset;
  box-sizing: border-box;
  @media (max-width: 900px) {
    font-size: 0.95rem;
  }
`;

const Th = styled.th`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 0.8rem;
  text-align: left;
  @media (max-width: 900px) {
    padding: 0.5rem;
    font-size: 0.95rem;
  }
`;

const Td = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  @media (max-width: 900px) {
    padding: 0.5rem;
    font-size: 0.95rem;
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const AssessmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const AssessmentCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
  }
`;

const getAvailability = (dueDate, endDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const end = new Date(endDate);
  if (now > end) return 'Closed';
  let status = '';
  if (now < due) status = 'Open (Before Due Date)';
  else if (now >= due && now <= end) status = 'Open (After Due Date)';
  // Countdown to end date
  const diff = end - now;
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let countdown = '';
  if (days > 0) countdown += `${days}d `;
  if (hours > 0) countdown += `${hours}h `;
  countdown += `${mins}m left`;
  return `${status} (Ends: ${endDate}, ${countdown})`;
};

const assessmentsData = [
  {
    id: 1,
    title: 'English Communication Assessment',
    description: 'Test your English communication skills and get personalized feedback.',
    dueDate: '2025-07-01',
    endDate: '2025-08-01',
    courseId: 1
  },
  {
    id: 2,
    title: 'Digital Skills Assessment',
    description: 'Evaluate your proficiency in basic computer and digital skills.',
    dueDate: '2025-07-05',
    endDate: '2025-08-10',
    courseId: 2
  },
  {
    id: 3,
    title: 'Job Search Readiness',
    description: 'Assess your job search skills and get recommendations for improvement.',
    dueDate: '2024-07-10',
    endDate: '2024-07-20',
    courseId: 3
  },
  {
    id: 4,
    title: 'Professional Networking Quiz',
    description: 'Test your knowledge of effective professional networking.',
    dueDate: '2024-07-12',
    endDate: '2024-07-22',
    courseId: 4
  }
];

// Add a hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const Assessments = () => {
  const navigate = useNavigate();
  const [assessments] = useState(assessmentsData);
  const [submissionStatus, setSubmissionStatus] = useState({});
  const isMobile = useIsMobile();

  useEffect(() => {
    // Fetch submission status for each assessment
    const fetchStatus = async () => {
      const status = {};
      for (const assessment of assessments) {
        // Find the latest result for this assessment
        const prefix = `assessmentresult_currentUser_${assessment.id}_`;
        const result = await db.allDocs({
          include_docs: true,
          startkey: prefix,
          endkey: prefix + '\ufff0'
        });
        if (result.rows.length > 0) {
          // Get the latest by timestamp
          const latest = result.rows.map(r => r.doc).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
          status[assessment.id] = {
            submitted: true,
            minutesLeft: latest.timeLeft !== undefined ? Math.ceil(latest.timeLeft / 60) : null
          };
        } else {
          status[assessment.id] = { submitted: false };
        }
      }
      setSubmissionStatus(status);
    };
    fetchStatus();
  }, [assessments]);

  return (
    <Sidebar role="refugee">
      <Title>Assessments</Title>
      {isMobile ? (
        <AssessmentsGrid>
          {assessments.map(assessment => (
            <AssessmentCard key={assessment.id}>
              <h3>{assessment.title}</h3>
              <p>{assessment.description}</p>
              <p><strong>Due:</strong> {assessment.dueDate}</p>
              <p><strong>Status:</strong> {getAvailability(assessment.dueDate, assessment.endDate)}</p>
              {submissionStatus[assessment.id]?.submitted && (
                <p><strong>Submitted:</strong> Yes</p>
              )}
              <ActionButton onClick={() => navigate(`/assessment/${assessment.id}`)}>
                {submissionStatus[assessment.id]?.submitted ? 'Review' : 'Start'}
              </ActionButton>
            </AssessmentCard>
          ))}
        </AssessmentsGrid>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Assessment</Th>
                <Th>Description</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {assessments.map(assessment => (
                <tr key={assessment.id}>
                  <Td>{assessment.title}</Td>
                  <Td>{assessment.description}</Td>
                  <Td>{assessment.dueDate}</Td>
                  <Td>{getAvailability(assessment.dueDate, assessment.endDate)}</Td>
                  <Td>
                    <ActionButton onClick={() => navigate(`/assessment/${assessment.id}`)}>
                      {submissionStatus[assessment.id]?.submitted ? 'Review' : 'Start'}
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </Sidebar>
  );
};

export default Assessments; 