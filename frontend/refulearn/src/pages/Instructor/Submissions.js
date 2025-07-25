import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import { useParams } from 'react-router-dom';


const Container = styled.div`
  padding: 2rem;
  background: #fff;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: #007BFF;
  margin-bottom: 2rem;
`;

const SubmissionCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StudentInfo = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    color: #374151;
  }
  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  ${props => props.status === 'submitted' ? `
    background: #fef3c7;
    color: #92400e;
  ` : `
    background: #d1fae5;
    color: #065f46;
  `}
`;

const SubmissionContent = styled.div`
  margin-bottom: 1rem;
`;

const FileLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #007BFF;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #007BFF;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:hover {
    background: #f0f9ff;
  }
`;

const GradingSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 60px;
`;

const Button = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Submissions = () => {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradingSubmission, setGradingSubmission] = useState(null);
  
  const token = localStorage.getItem('token');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching submissions...');
      
      const response = await fetch('/api/instructor/submissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const submissionsData = data.data.submissions || [];
        console.log('✅ Submissions data received:', submissionsData.length);
        setSubmissions(submissionsData);
      } else {
        throw new Error('Failed to fetch submissions');
      }
    } catch (err) {
      console.error('❌ Error fetching submissions:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      setGradingSubmission(submissionId);
      const response = await fetch(`/api/courses/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grade, feedback })
      });

      if (response.ok) {
        await fetchSubmissions(); // Refresh the list
        alert('Submission graded successfully!');
      } else {
        throw new Error('Failed to grade submission');
      }
    } catch (err) {
      alert('Error grading submission: ' + err.message);
    } finally {
      setGradingSubmission(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>Assignment Submissions</Title>
        <p>Loading submissions...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Assignment Submissions</Title>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Assignment Submissions ({submissions.length})</Title>
      
      {submissions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <h3>No Submissions Yet</h3>
          <p>Students haven't submitted any assignments for this course yet.</p>
        </div>
      ) : (
        submissions.map((submission) => (
          <SubmissionCard key={submission._id}>
            <SubmissionHeader>
              <StudentInfo>
                <h3>{submission.studentName}</h3>
                <p>{submission.assessmentTitle}</p>
                <p>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</p>
              </StudentInfo>
              <StatusBadge status={submission.status}>
                {submission.status}
              </StatusBadge>
            </SubmissionHeader>

            <SubmissionContent>
              {submission.submissionType === 'file' && submission.fileName && (
                <div>
                  <Label>Submitted File:</Label>
                  <FileLink href={`/api/files/${submission.filePath}`} target="_blank">
                    📎 {submission.fileName}
                  </FileLink>
                </div>
              )}
              
              {submission.submissionType === 'link' && submission.submissionLink && (
                <div>
                  <Label>Submitted Link:</Label>
                  <FileLink href={submission.submissionLink} target="_blank">
                    🔗 Open Submission Link
                  </FileLink>
                </div>
              )}
              
              {submission.submissionText && (
                <div style={{ marginTop: '1rem' }}>
                  <Label>Additional Comments:</Label>
                  <p style={{ 
                    background: '#f9fafb', 
                    padding: '0.75rem', 
                    borderRadius: '6px',
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.875rem'
                  }}>
                    {submission.submissionText}
                  </p>
                </div>
              )}
            </SubmissionContent>

            <GradingSection>
              <div>
                <Label>Grade (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={submission.grade || ''}
                  id={`grade-${submission._id}`}
                  placeholder="Enter grade"
                />
              </div>
              
              <div>
                <Label>Feedback</Label>
                <TextArea
                  defaultValue={submission.feedback || ''}
                  id={`feedback-${submission._id}`}
                  placeholder="Provide feedback to student..."
                />
              </div>
              
              <Button
                onClick={() => {
                  const grade = document.getElementById(`grade-${submission._id}`).value;
                  const feedback = document.getElementById(`feedback-${submission._id}`).value;
                  if (grade) {
                    handleGrade(submission._id, grade, feedback);
                  } else {
                    alert('Please enter a grade');
                  }
                }}
                disabled={gradingSubmission === submission._id}
              >
                {gradingSubmission === submission._id ? 'Grading...' : 'Save Grade'}
              </Button>
            </GradingSection>
          </SubmissionCard>
        ))
      )}
    </Container>
  );
};

export default Submissions; 