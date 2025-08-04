import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';
import offlineIntegrationService from '../services/offlineIntegrationService';

const CourseManagerContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 1rem 0;
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0;
  margin-top: 1rem;
`;

const CourseCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const CourseTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const CourseProgress = styled.div`
  margin: 1rem 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.85rem;
  color: #666;
  display: flex;
  justify-content: space-between;
`;

const CourseActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.enrolled {
    background: #d4edda;
    color: #155724;
  }
  
  &.completed {
    background: #d1ecf1;
    color: #0c5460;
  }
  
  &.offline {
    background: #fff3cd;
    color: #856404;
  }
  
  &.downloaded {
    background: #f8d7da;
    color: #721c24;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const OfflineCourseManager = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [processingCourses, setProcessingCourses] = useState(new Set());

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, activeFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await offlineIntegrationService.getOfflineCourses(user?.id);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('❌ Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'enrolled':
        filtered = filtered.filter(course => course.enrolled);
        break;
      case 'completed':
        filtered = filtered.filter(course => course.progress >= 100);
        break;
      case 'downloaded':
        filtered = filtered.filter(course => course.isDownloaded);
        break;
      case 'offline':
        filtered = filtered.filter(course => course.isOfflineCreated);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      setProcessingCourses(prev => new Set(prev).add(courseId));
      
      await offlineIntegrationService.enrollInCourse(courseId);
      
      // Update course in state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, enrolled: true, progress: 0 }
          : course
      ));
      
      console.log('✅ Enrolled in course successfully');
    } catch (error) {
      console.error('❌ Failed to enroll in course:', error);
    } finally {
      setProcessingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleDownloadCourse = async (courseId) => {
    try {
      setProcessingCourses(prev => new Set(prev).add(courseId));
      
      await offlineIntegrationService.downloadCourse(courseId);
      
      // Update course in state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, isDownloaded: true, downloadedAt: Date.now() }
          : course
      ));
      
      console.log('✅ Course downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download course:', error);
    } finally {
      setProcessingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleUpdateProgress = async (courseId, progress) => {
    try {
      await offlineIntegrationService.updateCourseProgress(courseId, progress);
      
      // Update course in state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, progress: progress }
          : course
      ));
      
      console.log('✅ Progress updated successfully');
    } catch (error) {
      console.error('❌ Failed to update progress:', error);
    }
  };

  const handleViewCourse = (courseId) => {
    // Navigate to course content
    window.open(`/course/${courseId}`, '_blank');
  };

  const getCourseStatus = (course) => {
    if (course.progress >= 100) return 'completed';
    if (course.enrolled) return 'enrolled';
    if (course.isDownloaded) return 'downloaded';
    if (course.isOfflineCreated) return 'offline';
    return null;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'enrolled': return 'Enrolled';
      case 'downloaded': return 'Downloaded';
      case 'offline': return 'Offline';
      default: return '';
    }
  };

  if (loading) {
    return (
      <CourseManagerContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          Loading courses...
        </div>
      </CourseManagerContainer>
    );
  }

  return (
    <CourseManagerContainer>
      <h2>Course Management</h2>
      
      <SearchBar
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <FilterButtons>
        <FilterButton
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          All Courses
        </FilterButton>
        <FilterButton
          active={activeFilter === 'enrolled'}
          onClick={() => setActiveFilter('enrolled')}
        >
          Enrolled
        </FilterButton>
        <FilterButton
          active={activeFilter === 'completed'}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </FilterButton>
        <FilterButton
          active={activeFilter === 'downloaded'}
          onClick={() => setActiveFilter('downloaded')}
        >
          Downloaded
        </FilterButton>
        <FilterButton
          active={activeFilter === 'offline'}
          onClick={() => setActiveFilter('offline')}
        >
          Offline
        </FilterButton>
      </FilterButtons>

      {filteredCourses.length === 0 ? (
        <EmptyState>
          <p>No courses found matching your criteria.</p>
        </EmptyState>
      ) : (
        <CourseGrid>
          {filteredCourses.map((course) => {
            const status = getCourseStatus(course);
            const isProcessing = processingCourses.has(course.id);
            
            return (
              <CourseCard key={course.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <CourseTitle>{course.title || 'Untitled Course'}</CourseTitle>
                  {status && (
                    <StatusBadge className={status}>
                      {getStatusText(status)}
                    </StatusBadge>
                  )}
                </div>
                
                <CourseDescription>
                  {course.description || 'No description available'}
                </CourseDescription>
                
                {course.enrolled && (
                  <CourseProgress>
                    <ProgressBar>
                      <ProgressFill progress={course.progress || 0} />
                    </ProgressBar>
                    <ProgressText>
                      <span>Progress</span>
                      <span>{Math.round(course.progress || 0)}%</span>
                    </ProgressText>
                  </CourseProgress>
                )}
                
                <CourseActions>
                  {!course.enrolled ? (
                    <ActionButton
                      className="primary"
                      onClick={() => handleEnrollCourse(course.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <LoadingSpinner /> : ''}
                      Enroll
                    </ActionButton>
                  ) : (
                    <ActionButton
                      className="success"
                      onClick={() => handleViewCourse(course.id)}
                    >
                      View Course
                    </ActionButton>
                  )}
                  
                  {!course.isDownloaded && (
                    <ActionButton
                      className="secondary"
                      onClick={() => handleDownloadCourse(course.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <LoadingSpinner /> : ''}
                      Download
                    </ActionButton>
                  )}
                  
                  {course.enrolled && course.progress < 100 && (
                    <ActionButton
                      className="secondary"
                      onClick={() => handleUpdateProgress(course.id, Math.min(100, (course.progress || 0) + 10))}
                    >
                      Update Progress
                    </ActionButton>
                  )}
                </CourseActions>
              </CourseCard>
            );
          })}
        </CourseGrid>
      )}
    </CourseManagerContainer>
  );
};

export default OfflineCourseManager; 