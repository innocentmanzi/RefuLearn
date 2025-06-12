import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem 1.5rem;
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
  margin-bottom: 1.2rem;
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
  const data = location.state;

  if (!data) {
    return <Container>No details found.</Container>;
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      <Title>{data.title}</Title>
      {data.company && <Meta>Company: {data.company}</Meta>}
      {data.provider && <Meta>School/Organization: {data.provider}</Meta>}
      <Section>
        <Badge color="#e0f7fa" textcolor="#00796b">{data.location}</Badge>
        <Badge color="#fff3e0" textcolor="#e65100">Ends in: {data.daysRemaining}</Badge>
      </Section>
      <Section>
        <strong>Description:</strong>
        <div>{data.description}</div>
      </Section>
      <Section>
        <strong>What they offer:</strong>
        <div>{data.offer}</div>
      </Section>
      {data.link && (
        <a href={data.link} target="_blank" rel="noopener noreferrer">
          <BackButton as="span">Apply</BackButton>
        </a>
      )}
    </Container>
  );
};

export default DetailPage; 