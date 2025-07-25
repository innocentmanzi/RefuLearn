import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Download, Person, Assessment, Quiz } from '@mui/icons-material';


const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #0056b3;
  padding: 0;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: 1rem;
  
  &:hover {
    color: #004494;
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #0056b3;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const GradesTable = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 100px;
  gap: 1rem;
  font-weight: 600;
  color: #374151;
`;

const TableRow = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 100px;
  gap: 1rem;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f9fafb;
  }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StudentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0056b3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const StudentDetails = styled.div``;

const StudentName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
`;

const StudentEmail = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const GradeDisplay = styled.div`
  font-weight: 600;
  color: ${props => {
    if (props.grade >= 90) return '#10b981';
    if (props.grade >= 80) return '#f59e0b';
    if (props.grade >= 70) return '#ef4444';
    return '#6b7280';
  }};
`;

const ViewButton = styled.button`
  background: #0056b3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background: #004494;
  }
`;

const ExportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1rem;
  
  &:hover {
    background: #059669;
  }
`;

export default function Grades() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageGrade: 0,
    passRate: 0,
    totalAssignments: 0
  });

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        console.log('🔄 Fetching grades...');
        
        let gradesData = [];
        let courseData = null;
        
        // Fetch grades
        const gradesResponse = await fetch(`/api/instructor/courses/${courseId}/grades`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (gradesResponse.ok) {
          const gradesApiData = await gradesResponse.json();
          gradesData = gradesApiData.data.grades || [];
          console.log('✅ Grades data received:', gradesData.length);
        } else {
          throw new Error('Failed to fetch grades');
        }

        // Fetch course info
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (courseResponse.ok) {
          const courseApiData = await courseResponse.json();
          courseData = courseApiData.data.course;
          console.log('✅ Course info received');
        } else {
          throw new Error('Failed to fetch course info');
        }

        setGrades(gradesData);
        setCourseInfo(courseData);
        
        // Calculate stats
        if (gradesData.length > 0) {
          const totalStudents = gradesData.length;
          const averageGrade = gradesData.reduce((sum, grade) => sum + (grade.score || 0), 0) / totalStudents;
          const passRate = (gradesData.filter(grade => (grade.score || 0) >= 70).length / totalStudents) * 100;
          
          setStats({
            totalStudents,
            averageGrade: averageGrade.toFixed(1),
            passRate: passRate.toFixed(1),
            totalAssignments: gradesData[0]?.assignments?.length || 0
          });
        }

      } catch (err) {
        console.error('❌ Error fetching grades:', err);
        setError(err.message || 'Failed to load grades');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchGrades();
    }
  }, [courseId]);

  const exportGrades = () => {
    const csvContent = [
      ['Student Name', 'Email', 'Overall Grade', 'Total Assessments', 'Status'].join(','),
      ...grades.map(student => [
        student.studentName,
        student.studentEmail,
        student.overallGrade,
        student.totalAssessments,
        student.overallGrade >= 70 ? 'Passed' : 'Failed'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseInfo?.title || 'course'}_grades.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading grades...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/instructor/courses/${courseId}/overview`)}>
          <ArrowBack style={{ fontSize: '1rem' }} />
          Back to Course
        </BackButton>
        <Title>Course Grades</Title>
        <Subtitle>{courseInfo?.title}</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalStudents}</StatValue>
          <StatLabel>Total Students</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averageGrade}%</StatValue>
          <StatLabel>Average Grade</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.passRate}%</StatValue>
          <StatLabel>Pass Rate</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalAssignments}</StatValue>
          <StatLabel>Total Submissions</StatLabel>
        </StatCard>
      </StatsGrid>

      <ExportButton onClick={exportGrades}>
        <Download style={{ fontSize: '1rem' }} />
        Export Grades
      </ExportButton>

      <GradesTable>
        <TableHeader>
          <div>Student</div>
          <div>Overall Grade</div>
          <div>Assessments</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>
        
        {grades.map((student) => (
          <TableRow key={student.studentId}>
            <StudentInfo>
              <StudentAvatar>
                {student.studentName.charAt(0).toUpperCase()}
              </StudentAvatar>
              <StudentDetails>
                <StudentName>{student.studentName}</StudentName>
                <StudentEmail>{student.studentEmail}</StudentEmail>
              </StudentDetails>
            </StudentInfo>
            
            <GradeDisplay grade={student.overallGrade}>
              {student.overallGrade}%
            </GradeDisplay>
            
            <div>{student.totalAssessments}</div>
            
            <div style={{ 
              color: student.overallGrade >= 70 ? '#10b981' : '#ef4444',
              fontWeight: '600'
            }}>
              {student.overallGrade >= 70 ? 'Passed' : 'Failed'}
            </div>
            
            <ViewButton onClick={() => navigate(`/instructor/courses/${courseId}/student/${student.studentId}/grades`)}>
              View Details
            </ViewButton>
          </TableRow>
        ))}
        
        {grades.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No student grades available yet.
          </div>
        )}
      </GradesTable>
    </Container>
  );
} 