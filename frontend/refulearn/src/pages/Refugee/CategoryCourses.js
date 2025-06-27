import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
import ContentWrapper from '../../components/ContentWrapper';
import allCourses from '../../data/courses';

const Container = styled.div`
  padding: 2rem 2rem 2rem 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CategoryHeader = styled.div`
  text-align: left;
  margin-bottom: 3rem;
  padding: 0;
`;

const CategoryTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CategoryDescription = styled.p`
  color: #666;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  text-align: left;
  max-width: none;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CourseCount = styled.div`
  color: #888;
  font-size: 1rem;
  margin-top: 1rem;
  text-align: left;
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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  width: 100%;
  justify-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }
`;

const CourseImage = styled.div`
  height: 200px;
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
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const CourseContent = styled.div`
  padding: 1.5rem;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.3;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EnrollButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyStateTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const EmptyStateText = styled.p`
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const BrowseAllButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;
const SectionTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.primary || '#3498db'};
`;
const ModuleList = styled.ul`
  padding-left: 1.2rem;
  margin-bottom: 1rem;
`;
const ModuleItem = styled.li`
  margin-bottom: 0.5rem;
`;
const ActionRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const CategoryCourses = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState([]);
  const [startedCourses, setStartedCourses] = useState([]); // Track started courses
  const [levelFilter, setLevelFilter] = useState('All');
  const [courses, setCourses] = useState([]);
  const [previewCourse, setPreviewCourse] = useState(null); // For modal

  useEffect(() => {
    db.allDocs({ include_docs: true, startkey: 'enrolled_', endkey: 'enrolled_\ufff0' })
      .then(result => {
        setEnrolled(result.rows.map(row => row.doc.courseId));
        // Simulate started flag from DB (if available)
        setStartedCourses(result.rows.filter(row => row.doc.started).map(row => row.doc.courseId));
      });
    const decodedCategory = decodeURIComponent(categoryName);
    const filteredCourses = allCourses.filter(course => course.category === decodedCategory);
    setCourses(filteredCourses);
  }, [categoryName]);

  const filteredCourses = levelFilter === 'All' 
    ? courses 
    : courses.filter(course => course.level === levelFilter);

  const handleViewCourse = (course) => {
    navigate(`/courses/full/${course.id}`, { state: course });
  };

  const handleEnroll = (course) => {
    // Simulate DB enroll
    setEnrolled(prev => [...prev, course.id]);
    setPreviewCourse({ ...course });
  };

  const handleStartCourse = (course) => {
    // Simulate DB start
    setStartedCourses(prev => [...prev, course.id]);
    alert(`A confirmation email has been sent to your email address for starting the course: ${course.title}`);
    handleViewCourse(course);
  };

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  if (courses.length === 0) {
    return (
      <ContentWrapper>
        <Container>
          <BackButton onClick={() => navigate('/courses')}>
            ← Back to Categories
          </BackButton>
          <EmptyState>
            <EmptyStateTitle>No courses found</EmptyStateTitle>
            <EmptyStateText>
              We couldn't find any courses in the "{decodeURIComponent(categoryName)}" category.
            </EmptyStateText>
            <BrowseAllButton onClick={() => navigate('/categories')}>
              Browse All Categories
            </BrowseAllButton>
          </EmptyState>
        </Container>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Container>
        <BackButton onClick={() => navigate('/courses')}>
          ← Back to Categories
        </BackButton>

        <CategoryHeader>
          <CategoryTitle>{decodeURIComponent(categoryName)}</CategoryTitle>
          <CategoryDescription>
            Explore our comprehensive collection of {decodeURIComponent(categoryName).toLowerCase()} courses designed to help you develop essential skills and advance your career.
          </CategoryDescription>
          <CourseCount>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available</CourseCount>
        </CategoryHeader>

        <FilterSection>
          {levels.map(level => (
            <FilterButton
              key={level}
              active={levelFilter === level}
              onClick={() => setLevelFilter(level)}
            >
              {level}
            </FilterButton>
          ))}
        </FilterSection>

        <CourseGrid>
          {filteredCourses.map(course => (
            <CourseCard key={course.id}>
              <CourseImage image={course.image} />
              <CourseContent>
                <CourseTitle>{course.title}</CourseTitle>
                <CourseDescription>{course.description}</CourseDescription>
                <CourseMeta>
                  <MetaItem>
                    <span>⏱️</span>
                    <span>{course.duration}</span>
                  </MetaItem>
                  <MetaItem>
                    <span>👥</span>
                    <span>{course.students}+ students</span>
                  </MetaItem>
                </CourseMeta>
                {enrolled.includes(course.id) && startedCourses.includes(course.id) ? (
                  <EnrollButton onClick={() => handleViewCourse(course)}>
                    Continue Learning
                  </EnrollButton>
                ) : (
                  <EnrollButton onClick={() => setPreviewCourse(course)}>
                    View More
                  </EnrollButton>
                )}
              </CourseContent>
            </CourseCard>
          ))}
        </CourseGrid>

        {/* Modal for course preview */}
        {previewCourse && (
          <ModalOverlay onClick={() => setPreviewCourse(null)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <CloseButton onClick={() => setPreviewCourse(null)}>&times;</CloseButton>
              <h2>{previewCourse.title}</h2>
              <p style={{ color: '#666', marginBottom: 12 }}>{previewCourse.overview || previewCourse.description}</p>
              <SectionTitle>Learning Outcomes</SectionTitle>
              <ul>
                {previewCourse.learningObjectives && previewCourse.learningObjectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
              <SectionTitle>Modules</SectionTitle>
              <ModuleList>
                {previewCourse.modules && previewCourse.modules.map((mod, idx) => {
                  let label = '';
                  if (typeof mod === 'object' && mod.weeks) {
                    if (mod.weeks.length === 1) {
                      label = `${mod.weeks[0]}. `;
                    } else {
                      label = `${mod.weeks[0]}-${mod.weeks[mod.weeks.length-1]}. `;
                    }
                  } else {
                    label = `${idx + 1}. `;
                  }
                  const title = typeof mod === 'object' ? mod.title : mod;
                  return (
                    <ModuleItem key={idx}>
                      <b>{label}{title}</b>
                      <ul style={{ marginTop: 4, marginBottom: 4 }}>
                        <li>Assignment: [Name]</li>
                        <li>Quiz: [Name]</li>
                      </ul>
                    </ModuleItem>
                  );
                })}
              </ModuleList>
              <ActionRow>
                {!enrolled.includes(previewCourse.id) ? (
                  <EnrollButton onClick={() => handleEnroll(previewCourse)}>Enroll</EnrollButton>
                ) : !startedCourses.includes(previewCourse.id) ? (
                  <EnrollButton onClick={() => handleStartCourse(previewCourse)}>Start Course</EnrollButton>
                ) : (
                  <EnrollButton onClick={() => handleViewCourse(previewCourse)}>Continue Learning</EnrollButton>
                )}
              </ActionRow>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default CategoryCourses; 