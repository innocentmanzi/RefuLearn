import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
import ContentWrapper from '../../components/ContentWrapper';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
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

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  cursor: pointer;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 0.5rem;
    font-size: 0.98rem;
  }
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

const allCourses = [
  {
    id: 1,
    title: 'Basic English Communication',
    description: 'Learn essential English communication skills for daily life and work.',
    level: 'Beginner',
    duration: '8 weeks',
    students: 1200,
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    title: 'Digital Skills Fundamentals',
    description: 'Master basic computer skills and digital literacy for the modern workplace.',
    level: 'Beginner',
    duration: '6 weeks',
    students: 850,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    title: 'Job Search Strategies',
    description: 'Learn effective job search techniques and resume building skills.',
    level: 'Intermediate',
    duration: '4 weeks',
    students: 950,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 4,
    title: 'Professional Networking',
    description: 'Build your professional network and learn effective networking strategies.',
    level: 'Intermediate',
    duration: '5 weeks',
    students: 700,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 5,
    title: 'Advanced Programming',
    description: 'Deep dive into advanced programming concepts and best practices.',
    level: 'Advanced',
    duration: '10 weeks',
    students: 1000,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 6,
    title: 'Leadership Skills',
    description: 'Develop leadership skills for professional and personal growth.',
    level: 'Advanced',
    duration: '7 weeks',
    students: 980,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60'
  }
];

const BrowseCourses = () => {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    db.allDocs({ include_docs: true, startkey: 'enrolled_', endkey: 'enrolled_\ufff0' })
      .then(result => setEnrolled(result.rows.map(row => row.doc.courseId)));
  }, []);

  const handleEnroll = (course) => {
    db.put({ _id: `enrolled_${course.id}`, courseId: course.id });
    setEnrolled([...enrolled, course.id]);
  };

  const handleViewCourse = (course) => {
    navigate(`/courses/full/${course.id}`, { state: course });
  };

  const filteredCourses =
    (activeFilter === 'all'
      ? allCourses
      : allCourses.filter(course => course.level.toLowerCase() === activeFilter.toLowerCase())
    ).filter(course =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <ContentWrapper>
      <Container>
        <Header>
          <Title>Browse Courses</Title>
        </Header>
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            style={{ width: 320, padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
          />
        </div>
        <FilterSection>
          <FilterButton active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>All</FilterButton>
          <FilterButton active={activeFilter === 'beginner'} onClick={() => setActiveFilter('beginner')}>Beginner</FilterButton>
          <FilterButton active={activeFilter === 'intermediate'} onClick={() => setActiveFilter('intermediate')}>Intermediate</FilterButton>
          <FilterButton active={activeFilter === 'advanced'} onClick={() => setActiveFilter('advanced')}>Advanced</FilterButton>
        </FilterSection>
        <CourseGrid>
          {filteredCourses.map(course => (
            <CourseCard key={course.id}>
              <CourseImage image={course.image}>
                <CourseLevel level={course.level}>{course.level}</CourseLevel>
              </CourseImage>
              <CourseContent>
                <CourseTitle>{course.title}</CourseTitle>
                <CourseDescription>{course.description}</CourseDescription>
                <CourseMeta>
                  <span>{course.duration}</span>
                  <span>{course.students}+ students</span>
                </CourseMeta>
                {enrolled.includes(course.id) ? (
                  <EnrollButton onClick={() => handleViewCourse(course)} style={{ background: '#3498db' }}>View Course</EnrollButton>
                ) : (
                  <EnrollButton onClick={() => handleEnroll(course)} style={{ background: '#27ae60' }}>Enroll</EnrollButton>
                )}
              </CourseContent>
            </CourseCard>
          ))}
        </CourseGrid>
      </Container>
    </ContentWrapper>
  );
};

export default BrowseCourses; 