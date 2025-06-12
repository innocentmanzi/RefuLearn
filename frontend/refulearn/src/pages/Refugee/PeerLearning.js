import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const MentorCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
  }
`;

const MentorName = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const MentorExpertise = styled.div`
  color: #555;
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 3rem;
  margin-bottom: 1.5rem;
`;

const CreateTopicButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
`;

const mentors = [
  {
    id: 1,
    name: 'Aisha Khan',
    expertise: 'Web Development, React',
    languages: 'English, Arabic',
    bio: 'Experienced web developer passionate about helping others learn to code.',
    availability: 'Weekends',
  },
  {
    id: 2,
    name: 'David Omondi',
    expertise: 'Data Analysis, Python',
    languages: 'English, Swahili',
    bio: 'Data enthusiast with a strong background in Python and data visualization.',
    availability: 'Evenings',
  },
  {
    id: 3,
    name: 'Sophie Dubois',
    expertise: 'Graphic Design, UI/UX',
    languages: 'English, French',
    bio: 'Creative designer specializing in user interface and user experience.',
    availability: 'Weekdays',
  },
];

const PeerLearning = () => {
  const navigate = useNavigate();

  const handleViewMentor = (mentor) => {
    navigate(`/peer-learning/mentor/${mentor.id}`, { state: mentor });
  };

  const handleCreateTopic = () => {
    // TODO: Navigate to a create topic page or show a modal
    console.log('Create new discussion topic');
    alert('Create discussion topic functionality coming soon!');
  };

  return (
    <Container>
      <Title>Peer Learning & Mentorship</Title>
      <p>Connect with mentors and peers to enhance your learning journey.</p>

      <h3>Available Mentors</h3>
      {
        mentors.map(mentor => (
          <MentorCard key={mentor.id} onClick={() => handleViewMentor(mentor)}>
            <MentorName>{mentor.name}</MentorName>
            <MentorExpertise>Expertise: {mentor.expertise}</MentorExpertise>
            <MentorExpertise>Languages: {mentor.languages}</MentorExpertise>
          </MentorCard>
        ))
      }

      <SectionTitle>Discussion Forums</SectionTitle>
      <p>Join discussions and collaborate with other learners.</p>
      <CreateTopicButton onClick={handleCreateTopic}>Start a New Discussion Topic</CreateTopicButton>
      
      {/* Placeholder for list of discussion topics */}
      {/* <ul>
            <li>Topic 1</li>
            <li>Topic 2</li>
          </ul> */}

      {/* Placeholder for other future features */}
      <SectionTitle>Community Features (Coming Soon)</SectionTitle>
      <ul>
        <li>Study Groups and Peer Learning Circles</li>
        <li>Community Knowledge Sharing Platform</li>
        <li>Community Challenges and Collaborative Projects</li>
        <li>Success Story Sharing and Testimonial Collection</li>
        <li>Local Expert and Elder Knowledge Documentation Systems</li>
      </ul>

    </Container>
  );
};

export default PeerLearning; 