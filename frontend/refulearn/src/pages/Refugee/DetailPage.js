import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Meta = styled.div`
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const Badge = styled.span`
  display: inline-block;
  background: ${({ color }) => color || '#e3e8f0'};
  color: ${({ $textcolor }) => $textcolor || '#333'};
  border-radius: 12px;
  padding: 0.2rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 500;
  margin-right: 0.5rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
  }
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
`;

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { type, id } = useParams(); // type can be 'job' or 'scholarship'
  
  const [data, setData] = useState(location.state);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (location.state) return; // Already have data

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        let endpoint = '';
        if (type === 'job') {
          endpoint = `/api/jobs/${id}`;
        } else if (type === 'scholarship') {
          endpoint = `/api/scholarships/${id}`;
        }

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          setData(responseData.data[type] || responseData.data);
        } else {
          setError('Failed to load details');
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    if (type && id && !location.state) {
      fetchDetails();
    }
  }, [type, id, location.state]);

  const handleApply = async () => {
    try {
      setApplying(true);
      const token = localStorage.getItem('token');
      
      let endpoint = '';
      if (type === 'job') {
        endpoint = `/api/jobs/${id}/apply`;
      } else if (type === 'scholarship') {
        endpoint = `/api/scholarships/${id}/apply`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Application submitted successfully!');
        navigate(-1);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading details...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error}</div>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Container>
    );
  }

  if (!data) {
    return <Container>No details found.</Container>;
  }

  const getDaysRemaining = (deadline) => {
    if (!deadline) return 'No deadline';
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'Expired';
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return '1 day left';
    return `${daysDiff} days left`;
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      <Title>{data.title}</Title>
      {data.company && <Meta>Company: {data.company}</Meta>}
      {data.provider && <Meta>School/Organization: {data.provider}</Meta>}
      <Section>
        <Badge color="#e0f7fa" textcolor="#00796b">{data.location}</Badge>
        {(data.application_deadline || data.deadline) && (
          <Badge color="#fff3e0" textcolor="#e65100">
            {getDaysRemaining(data.application_deadline || data.deadline)}
          </Badge>
        )}
        {data.salary && (
          <Badge color="#e8f5e8" textcolor="#2e7d32">
            Salary: {data.salary}
          </Badge>
        )}
        {data.amount && (
          <Badge color="#e8f5e8" textcolor="#2e7d32">
            Amount: {data.amount}
          </Badge>
        )}
        {(data.application_deadline || data.deadline) && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            Deadline: {new Date(data.application_deadline || data.deadline).toLocaleDateString()}
          </div>
        )}
      </Section>
      <Section>
        <strong>Description:</strong>
        <div>{data.description}</div>
      </Section>
      {data.requirements && (
        <Section>
          <strong>Requirements:</strong>
          <div>{data.requirements}</div>
        </Section>
      )}
      {data.offer && (
        <Section>
          <strong>What they offer:</strong>
          <div>{data.offer}</div>
        </Section>
      )}
      {data.benefits && (
        <Section>
          <strong>Benefits:</strong>
          <div>{data.benefits}</div>
        </Section>
      )}
      {data.link ? (
        <a href={data.link} target="_blank" rel="noopener noreferrer">
          <BackButton as="span">Apply External</BackButton>
        </a>
      ) : (
        <BackButton onClick={handleApply} disabled={applying}>
          {applying ? 'Submitting...' : 'Apply Now'}
        </BackButton>
      )}
    </Container>
  );
};

export default DetailPage; 