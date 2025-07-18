/**
 * 🔥 SIMPLE INSTRUCTOR DASHBOARD - GUARANTEED TO WORK OFFLINE
 * Created: 2025-01-15-16:55 - COMPLETELY NEW FILE - NO CACHE ISSUES
 * MINIMAL CODE - HARDCODED DATA - NO DEPENDENCIES
 */

import React from 'react';
import styled from 'styled-components';
import PageContainer from '../../components/PageContainer';
import ContentWrapper from '../../components/ContentWrapper';

const Title = styled.h1`
  color: #007bff;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SuccessBanner = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  border: 2px solid #28a745;
  font-weight: bold;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #007bff;
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const StatNumber = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const CourseList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const CourseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SimpleInstructorDashboard = () => {
  console.log('🔥 SIMPLE INSTRUCTOR DASHBOARD LOADED - NEW FILE - NO CACHE');
  
  // Hardcoded data - guaranteed to work
  const dashboardData = {
    totalCourses: 3,
    totalStudents: 25,
    totalAssessments: 8,
    totalSubmissions: 12,
    courses: [
      { name: 'JavaScript Fundamentals', progress: '78%', students: '8/8' },
      { name: 'React Development', progress: '65%', students: '7/10' },
      { name: 'Web Design Basics', progress: '85%', students: '6/7' }
    ]
  };

  return (
    <ContentWrapper>
      <PageContainer>
        <Title>🔥 Instructor Dashboard - Simple Offline Version</Title>
        
        <SuccessBanner>
          ✅ SUCCESS! Simple Dashboard Working Offline - No Complex Dependencies ✅
        </SuccessBanner>

        <StatsGrid>
          <StatCard>
            <StatNumber>{dashboardData.totalCourses}</StatNumber>
            <StatLabel>Courses</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{dashboardData.totalStudents}</StatNumber>
            <StatLabel>Students</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{dashboardData.totalAssessments}</StatNumber>
            <StatLabel>Assessments</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{dashboardData.totalSubmissions}</StatNumber>
            <StatLabel>Submissions</StatLabel>
          </StatCard>
        </StatsGrid>

        <CourseList>
          <h3 style={{ color: '#007bff', marginTop: 0 }}>Course Progress</h3>
          {dashboardData.courses.map((course, index) => (
            <CourseItem key={index}>
              <div>
                <strong>{course.name}</strong>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Students: {course.students}
                </div>
              </div>
              <div style={{ color: '#007bff', fontWeight: 'bold' }}>
                {course.progress}
              </div>
            </CourseItem>
          ))}
        </CourseList>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#666' }}>
            📱 This dashboard works 100% offline with sample data
          </p>
        </div>
      </PageContainer>
    </ContentWrapper>
  );
};

export default SimpleInstructorDashboard; 