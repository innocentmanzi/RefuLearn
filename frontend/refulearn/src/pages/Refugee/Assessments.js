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

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${({ active, theme }) => active ? theme.colors.primary : '#f5f5f5'};
  color: ${({ active }) => active ? 'white' : '#333'};
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
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

const AssessmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const AssessmentCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const AssessmentHeader = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const AssessmentTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: white;
`;

const AssessmentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const AssessmentContent = styled.div`
  padding: 1.5rem;
`;

const AssessmentDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin: 0.5rem 0;
`;

const Progress = styled.div`
  width: ${props => props.$value}%;\n  height: 100%;\n  background: ${({ theme }) => theme.colors.primary};\n  border-radius: 4px;\n  transition: width 0.3s ease;\n`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  width: 100%;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ $status }) => 
    $status === 'completed' ? '#4CAF50' :
    $status === 'in-progress' ? '#FFC107' :
    '#F4436'
  };
  color: white;
`;

const Assessments = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [assessments] = useState([
    {
      id: 1,
      title: 'English Communication Assessment',
      description: 'Test your English communication skills and get personalized feedback.',
      duration: '45 minutes',
      questions: 30,
      status: 'completed',
      score: 85,
      courseId: 1
    },
    {
      id: 2,
      title: 'Digital Skills Assessment',
      description: 'Evaluate your proficiency in basic computer and digital skills.',
      duration: '60 minutes',
      questions: 40,
      status: 'in-progress',
      progress: 60,
      courseId: 2
    },
    {
      id: 3,
      title: 'Job Search Readiness',
      description: 'Assess your job search skills and get recommendations for improvement.',
      duration: '30 minutes',
      questions: 25,
      status: 'not-started',
      courseId: 3
    },
    {
      id: 4,
      title: 'Professional Networking Quiz',
      description: 'Test your knowledge of effective professional networking.',
      duration: '20 minutes',
      questions: 15,
      status: 'completed',
      score: 95,
      courseId: 4
    },
    {
      id: 5,
      title: 'Financial Literacy Test',
      description: 'Evaluate your understanding of basic financial concepts.',
      duration: '35 minutes',
      questions: 20,
      status: 'not-started',
      courseId: 5
    },
    {
      id: 6,
      title: 'Cultural Awareness Assessment',
      description: 'Assess your understanding of cultural differences and adaptation.',
      duration: '30 minutes',
      questions: 25,
      status: 'in-progress',
      progress: 40,
      courseId: 6
    }
  ]);

  const assessmentCategories = [
    { id: 1, name: 'Language' },
    { id: 2, name: 'Digital Skills' },
    { id: 3, name: 'Job Readiness' },
    { id: 4, name: 'Professional Dev' },
    { id: 5, name: 'Math & Logic' },
    { id: 6, name: 'Other' },
  ];

  const filteredAssessments = assessments.filter(assessment => {
    if (activeFilter === 'all') return true;
    return assessment.status === activeFilter;
  });

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'not-started': return 'Not Started';
      default: return status;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Assessments</Title>
      </Header>

      <FilterSection>
        <FilterButton
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          All Assessments
        </FilterButton>
        <FilterButton
          active={activeFilter === 'not-started'}
          onClick={() => setActiveFilter('not-started')}
        >
          Not Started
        </FilterButton>
        <FilterButton
          active={activeFilter === 'in-progress'}
          onClick={() => setActiveFilter('in-progress')}
        >
          In Progress
        </FilterButton>
        <FilterButton
          active={activeFilter === 'completed'}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </FilterButton>
      </FilterSection>

      <CardsGrid>
        {assessmentCategories.map(category => (
          <Card key={category.id} onClick={() => console.log(`Clicked on assessment category: ${category.name}`)}>
            <CardTitle>{category.name}</CardTitle>
          </Card>
        ))}
      </CardsGrid>

      <AssessmentGrid>
        {filteredAssessments.map(assessment => (
          <AssessmentCard key={assessment.id}>
            <AssessmentHeader>
              <AssessmentTitle>{assessment.title}</AssessmentTitle>
              <AssessmentMeta>
                <span>{assessment.duration}</span>
                <span>{assessment.questions} questions</span>
              </AssessmentMeta>
            </AssessmentHeader>
            <AssessmentContent>
              <AssessmentDescription>{assessment.description}</AssessmentDescription>
              <StatusBadge $status={assessment.status}>
                {getStatusText(assessment.status)}
              </StatusBadge>
              {assessment.status === 'completed' && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Score: {assessment.score}%</div>
                </div>
              )}
              {assessment.status === 'in-progress' && (
                <div style={{ marginTop: '1rem' }}>
                  <ProgressBar>
                    <Progress $value={assessment.progress} />
                  </ProgressBar>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {assessment.progress}% Complete
                  </div>
                </div>
              )}
              <ActionButton onClick={() => navigate(`/assessments/${assessment.id}`)}>
                {assessment.status === 'completed' ? 'View Results' :
                 assessment.status === 'in-progress' ? 'Continue Assessment' :
                 'Start Assessment'}
              </ActionButton>
            </AssessmentContent>
          </AssessmentCard>
        ))}
      </AssessmentGrid>
    </Container>
  );
};

export default Assessments; 