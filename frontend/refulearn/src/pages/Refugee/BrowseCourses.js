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

const SearchBar = styled.input`
  padding: 0.8rem 1.2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
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

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const CourseImage = styled.div`
  height: 160px;
  background: ${({ image }) => `url(${image}) center/cover`};
  position: relative;
`;

const CourseLevel = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ level }) => 
    level === 'Beginner' ? '#4CAF50' :
    level === 'Intermediate' ? '#FFC107' :
    '#F44336'
  };
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const CourseContent = styled.div`
  padding: 1.5rem;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
`;

const EnrollButton = styled.button`
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

const BrowseCourses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [courses] = useState([
    {
      id: 1,
      title: 'Basic English Communication',
      description: 'Learn essential English communication skills for daily life and work.',
      level: 'Beginner',
      duration: '8 weeks',
      students: 1200,
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
      title: 'Digital Skills Fundamentals',
      description: 'Master basic computer skills and digital literacy for the modern workplace.',
      level: 'Beginner',
      duration: '6 weeks',
      students: 850,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      title: 'Job Search Strategies',
      description: 'Learn effective job search techniques and resume building skills.',
      level: 'Intermediate',
      duration: '4 weeks',
      students: 650,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 4,
      title: 'Professional Networking',
      description: 'Build your professional network and learn effective networking strategies.',
      level: 'Intermediate',
      duration: '5 weeks',
      students: 450,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 5,
      title: 'Financial Literacy Basics',
      description: 'Understand essential financial concepts for managing money.',
      level: 'Beginner',
      duration: '3 weeks',
      students: 700,
      image: 'https://images.unsplash.com/photo-1593620175862-b9b7c552c9f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 6,
      title: 'Cultural Adaptation',
      description: 'Learn about cultural differences and adaptation strategies.',
      level: 'Beginner',
      duration: '4 weeks',
      students: 900,
      image: 'https://images.unsplash.com/photo-1512438436238-b1395949b00e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || course.level.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <Container>
      <Header>
        <Title>Browse Courses</Title>
        <SearchBar
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Header>

      <FilterSection>
        <FilterButton
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          All Courses
        </FilterButton>
        <FilterButton
          active={activeFilter === 'beginner'}
          onClick={() => setActiveFilter('beginner')}
        >
          Beginner
        </FilterButton>
        <FilterButton
          active={activeFilter === 'intermediate'}
          onClick={() => setActiveFilter('intermediate')}
        >
          Intermediate
        </FilterButton>
        <FilterButton
          active={activeFilter === 'advanced'}
          onClick={() => setActiveFilter('advanced')}
        >
          Advanced
        </FilterButton>
      </FilterSection>

      <CourseGrid>
        {filteredCourses.map(course => (
          <CourseCard key={course.id} onClick={() => navigate(`/courses/${course.id}`)}>
            <CourseImage image={course.image}>
              <CourseLevel level={course.level}>{course.level}</CourseLevel>
            </CourseImage>
            <CourseContent>
              <CourseTitle>{course.title}</CourseTitle>
              <CourseDescription>{course.description}</CourseDescription>
              <CourseMeta>
                <span>{course.duration}</span>
                <span>{course.students} students</span>
              </CourseMeta>
              <EnrollButton>Enroll Now</EnrollButton>
            </CourseContent>
          </CourseCard>
        ))}
      </CourseGrid>
    </Container>
  );
};

export default BrowseCourses; 