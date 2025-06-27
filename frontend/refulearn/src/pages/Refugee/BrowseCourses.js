import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
import ContentWrapper from '../../components/ContentWrapper';
import allCourses from '../../data/courses';

const Container = styled.div`
  padding: 2rem 2.5rem 2rem 2.5rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const HeroSection = styled.div`
  text-align: left;
  margin-bottom: 3rem;
  padding: 2rem 0 2rem 0;
`;

const MainTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: 0;
  margin-right: 0;
  line-height: 1.6;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 4rem 1rem 1.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const CategoriesSection = styled.div`
  margin-bottom: 3rem;
`;

const CategoriesTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
`;

const CategoryCard = styled.div`
  background: ${({ bgColor }) => bgColor || 'white'};
  border: 2px solid #f0f0f0;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors.primary};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const CategoryIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: white;
`;

const CategoryName = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const CourseCount = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
`;

const CoursesSection = styled.div`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const FilterButton = styled.button`
  background: ${({ active, theme }) => active ? theme.colors.primary : '#f5f5f5'};
  color: ${({ active }) => active ? 'white' : '#333'};
  border: none;
  border-radius: 25px;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: translateY(-2px);
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

// Category data with icons and colors
const categories = [
  { name: 'Data Science', icon: '📊', color: '#FF6B6B', bgColor: '#FFF5F5', count: 0 },
  { name: 'IT & Software', icon: '💻', color: '#4ECDC4', bgColor: '#F0FFFD', count: 0 },
  { name: 'Web Development', icon: '🌐', color: '#96CEB4', bgColor: '#F0FFF4', count: 0 },
  { name: 'Finance', icon: '💰', color: '#FFEAA7', bgColor: '#FFFBEB', count: 0 },
  { name: 'Medical', icon: '🏥', color: '#DDA0DD', bgColor: '#FDF0FF', count: 0 },
  { name: 'Architecture', icon: '🏗️', color: '#98D8C8', bgColor: '#F0FFFA', count: 0 },
  { name: 'Art & Design', icon: '🎨', color: '#F7DC6F', bgColor: '#FFFBEB', count: 0 },
  { name: 'Marketing', icon: '📈', color: '#BB8FCE', bgColor: '#F8F0FF', count: 0 },
  { name: 'Accounting', icon: '📋', color: '#85C1E9', bgColor: '#F0F8FF', count: 0 },
  { name: 'Language', icon: '🗣️', color: '#FF9F43', bgColor: '#FFF8F0', count: 0 },
  { name: 'Business', icon: '💼', color: '#5F27CD', bgColor: '#F8F0FF', count: 0 }
];

const BrowseCourses = () => {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    db.allDocs({ include_docs: true, startkey: 'enrolled_', endkey: 'enrolled_\ufff0' })
      .then(result => setEnrolled(result.rows.map(row => row.doc.courseId)));
  }, []);

  // Calculate course counts for each category
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: allCourses.filter(course => course.category === category.name).length
  }));

  // Filter courses by search
  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  );

  // Find matching category if no course matches
  const matchingCategory = categories.find(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handler for viewing more details about a course
  const handleViewMore = (course) => {
    navigate(`/courses/full/${course.id}`, { state: course });
  };

  return (
    <ContentWrapper>
      <Container>
        <HeroSection>
          <MainTitle>What do you want to learn?</MainTitle>
          <Subtitle>Grow your skills with the most reliable online courses and certifications</Subtitle>
          <SearchContainer>
            <SearchInput
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for courses, skills, or topics..."
            />
          </SearchContainer>
        </HeroSection>
        {search.trim() ? (
          <>
            {filteredCourses.length > 0 ? (
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
                      <div style={{ margin: '0.5rem 0', color: '#888', fontSize: '0.95rem' }}>
                        Category: <b>{course.category}</b>
                      </div>
                      <EnrollButton style={{ background: '#3498db' }} onClick={() => handleViewMore(course)}>
                        View More
                      </EnrollButton>
                    </CourseContent>
                  </CourseCard>
                ))}
              </CourseGrid>
            ) : matchingCategory ? (
              <div style={{ margin: '2rem 0', color: '#666', fontSize: '1.1rem' }}>
                No course found, but you can explore the <b>{matchingCategory.name}</b> category.
                <br />
                <button
                  style={{
                    marginTop: '1rem',
                    background: matchingCategory.color,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                  onClick={() => navigate(`/courses/category/${encodeURIComponent(matchingCategory.name)}`)}
                >
                  Go to {matchingCategory.name}
                </button>
              </div>
            ) : (
              <div style={{ margin: '2rem 0', color: '#666', fontSize: '1.1rem' }}>
                No courses or categories found matching your search.
              </div>
            )}
          </>
        ) : (
          <CategoriesSection>
            <CategoriesTitle>Choose Categories</CategoriesTitle>
            <CategoriesGrid>
              {categoriesWithCounts.map((category, index) => (
                <CategoryCard 
                  key={index} 
                  onClick={() => navigate(`/courses/category/${encodeURIComponent(category.name)}`)}
                  bgColor={category.bgColor}
                >
                  <CategoryIcon color={category.color}>
                    {category.icon}
                  </CategoryIcon>
                  <CategoryName>{category.name}</CategoryName>
                  <CourseCount>{category.count} courses</CourseCount>
                </CategoryCard>
              ))}
            </CategoriesGrid>
          </CategoriesSection>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default BrowseCourses;
