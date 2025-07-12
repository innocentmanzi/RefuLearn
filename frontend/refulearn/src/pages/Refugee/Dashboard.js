import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    margin-top: 1.2rem;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }
  @media (max-width: 600px) {
    gap: 1rem;
    margin-top: 1rem;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  color: #333;
  border: 1px solid #e9ecef;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 900px) {
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const SubTitle = styled.h2`
  color: #007BFF;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 4px;
  margin: 1rem 0;
`;

const Progress = styled.div`
  width: ${props => props.$value}%;
  height: 100%;
  background: #007BFF;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const Stat = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
`;

const QuickAction = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.2s ease;
  font-weight: 600;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
`;

const ProgressCard = Card;

const OverviewText = styled.span`
  display: inline-block;
  min-height: 1.5rem;
  color: #666;
  font-size: 1.1rem;
`;

const CourseList = styled.div`
  margin-top: 1rem;
`;

const CourseItem = styled.div`
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

// New styled components for Available Courses section
const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  color: #333;
  border: 1px solid #e9ecef;
  margin-top: 2rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 900px) {
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CourseCardTitle = styled.h2`
  color: #007BFF;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const CourseItemStyled = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const AvailableCourses = ({ courses, onCourseClick, t }) => (
  <CourseCard>
    <CourseCardTitle>Available Courses</CourseCardTitle>
    <CourseList>
      {courses.map(course => (
        <CourseItemStyled key={course._id} onClick={() => onCourseClick(course)}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{course.title}</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              {course.category} • {course.level || 'Beginner'} • {course.duration || 'Self-paced'}
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: course.isPublished ? '#28a745' : '#007BFF',
            fontWeight: '600',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            background: course.isPublished ? '#d4edda' : '#e3f2fd',
            border: `1px solid ${course.isPublished ? '#c3e6cb' : '#bbdefb'}`
          }}>
            {course.isPublished ? 'Available' : 'Coming Soon'}
          </div>
        </CourseItemStyled>
      ))}
    </CourseList>
  </CourseCard>
);

const RefugeeDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const [isFirstLogin] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Debug user context
  console.log('Dashboard user context:', user);
  
  // Check if user has refugee role
  if (user && user.role !== 'refugee') {
    console.log('User role is not refugee:', user.role);
  }
  const [welcomeText, setWelcomeText] = useState('');
  const [overviewText, setOverviewText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isTypingOverview, setIsTypingOverview] = useState(false);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    completedCourses: 0,
    totalCourses: 0,
    certificates: 0,
    assessmentsCompleted: 0,
    learningPathProgress: 0,
    peerLearningSessions: 0,
    jobApplications: 0
  });
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Fetch user profile
      const profileResponse = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserName(profileData.data.user.firstName || 'User');
      } else {
        const text = await profileResponse.text();
        console.error('Profile fetch failed:', text);
        throw new Error('Profile fetch failed: ' + text);
      }
      // Fetch all released courses instead of just enrolled courses
      const coursesResponse = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Courses API response status:', coursesResponse.status);
      
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log('Courses API response:', coursesData);
        
        if (coursesData.success) {
          setCourses(coursesData.data.courses || []);
          console.log('✅ Courses set:', coursesData.data.courses?.length || 0, 'courses');
          
          // Log debug information if available
          if (coursesData.data.debug) {
            console.log('📋 Debug info:', coursesData.data.debug);
          }
        } else {
          console.error('❌ Courses API returned success=false:', coursesData);
          setCourses([]); // Set empty array instead of throwing error
          setError(`Courses API error: ${coursesData.message || 'Unknown error'}`);
        }
      } else {
        const errorText = await coursesResponse.text();
        console.error('❌ Courses API HTTP error:', coursesResponse.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.log('📋 Error details:', errorData);
          setError(`Courses fetch failed: ${errorData.message || 'Server error'}`);
        } catch (parseError) {
          setError(`Courses fetch failed: HTTP ${coursesResponse.status}`);
        }
        
        setCourses([]); // Set empty array instead of throwing error
      }
      // Fetch user stats
      const userId = user?._id || user?.id;
      console.log('Using user ID for stats:', userId);
      
      if (!userId) {
        console.error('No user ID available for stats fetch');
        setError('User authentication error: No user ID available');
        return;
      }
      
      const statsResponse = await fetch(`/api/courses/user/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Stats API response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats API response:', statsData);
        
        if (statsData.success) {
          setStats({
            completedCourses: statsData.data.completedCourses || 0,
            totalCourses: statsData.data.totalCourses || 0,
            certificates: statsData.data.certificates || 0,
            assessmentsCompleted: statsData.data.assessmentsCompleted || 0,
            learningPathProgress: statsData.data.learningPathProgress || 0,
            peerLearningSessions: statsData.data.peerLearningSessions || 0,
            jobApplications: statsData.data.jobApplications || 0
          });
        } else {
          console.error('❌ Stats API returned success=false:', statsData);
          // Don't throw error for stats, just log it and use default values
          console.warn('Using default stats values due to API error');
        }
      } else {
        const errorText = await statsResponse.text();
        console.error('❌ Stats API HTTP error:', statsResponse.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.log('📋 Stats error details:', errorData);
          
          // If it's a user not found error, it might be a new user - don't show error
          if (errorData.message && errorData.message.includes('User not found')) {
            console.warn('User not found in database, using default stats (might be a new user)');
          } else {
            console.warn('Stats fetch failed, using default values:', errorData.message);
          }
        } catch (parseError) {
          console.warn('Stats fetch failed, using default values');
        }
        
        // Don't throw error for stats - just continue with default values
      }
      // Fetch certificates count
      const certificatesResponse = await fetch('/api/certificates/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (certificatesResponse.ok) {
        const certificatesData = await certificatesResponse.json();
        setStats(prev => ({
          ...prev,
          certificates: certificatesData.data.certificates?.length || 0
        }));
      } else {
        const text = await certificatesResponse.text();
        console.error('Certificates fetch failed:', text);
        throw new Error('Certificates fetch failed: ' + text);
      }

      // Fetch recent active jobs (limit to 3 for dashboard)
      try {
        const jobsResponse = await fetch('/api/jobs?limit=3', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData.data.jobs || []);
          console.log('✅ Jobs fetched for dashboard:', jobsData.data.jobs?.length || 0, 'jobs');
        } else {
          console.error('❌ Jobs fetch failed:', jobsResponse.status);
        }
      } catch (err) {
        console.error('Jobs fetch error:', err);
        // Don't throw error - just continue without jobs
      }

      // Fetch recent active scholarships (limit to 3 for dashboard)
      try {
        const scholarshipsResponse = await fetch('/api/scholarships?limit=3', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (scholarshipsResponse.ok) {
          const scholarshipsData = await scholarshipsResponse.json();
          setScholarships(scholarshipsData.data.scholarships || []);
          console.log('✅ Scholarships fetched for dashboard:', scholarshipsData.data.scholarships?.length || 0, 'scholarships');
        } else {
          console.error('❌ Scholarships fetch failed:', scholarshipsResponse.status);
        }
      } catch (err) {
        console.error('Scholarships fetch error:', err);
        // Don't throw error - just continue without scholarships
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      console.log('No user context available, dashboard will not load data');
      setLoading(false);
    }
  }, [user]);

  const welcomeMessage = isFirstLogin 
    ? t('dashboard.welcome', { userName })
    : t('dashboard.welcomeBack', { userName });

  const overviewMessage = t('dashboard.overview');

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= welcomeMessage.length) {
        setWelcomeText(welcomeMessage.slice(0, currentIndex));
      }
      currentIndex++;
      if (currentIndex > welcomeMessage.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
        setIsTypingOverview(true);
      }
    }, 40);
    return () => clearInterval(typingInterval);
  }, [welcomeMessage]);

  useEffect(() => {
    if (!isTypingOverview) return;
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= overviewMessage.length) {
        setOverviewText(overviewMessage.slice(0, currentIndex));
      }
      currentIndex++;
      if (currentIndex > overviewMessage.length) {
        clearInterval(typingInterval);
        setIsTypingOverview(false);
      }
    }, 20);
    return () => clearInterval(typingInterval);
  }, [overviewMessage, isTypingOverview]);

  const handleCourseClick = (course) => {
    // Navigate to the course overview page for better user experience
    navigate(`/courses/${course._id}/overview`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <div>{error}</div>
        <button onClick={() => {
          setError('');
          setLoading(true);
          if (user) {
            fetchDashboardData();
          }
        }}>Retry</button>
        <button onClick={() => window.location.reload()} style={{ marginLeft: '1rem' }}>Reload Page</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: 0, margin: 0 }}>
      {/* Animated Welcome Message */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <Title style={{ color: '#007BFF', fontSize: '2rem', marginBottom: '0.5rem' }}>{welcomeText}<span style={{ opacity: isTyping ? 1 : 0 }}>|</span></Title>
        <OverviewText style={{ color: '#333' }}>{overviewText}<span style={{ opacity: isTypingOverview ? 1 : 0 }}>|</span></OverviewText>
      </div>
      <ul style={{ color: '#1976d2', display: 'none' }}>
        {courses.map(course => (
          <li key={course._id}>{course.title} - Progress: {course.progress || 0}%</li>
        ))}
      </ul>
      <DashboardGrid>
        <ProgressCard onClick={() => navigate('/learning-path')}>
          <SubTitle>Learning Path Progress</SubTitle>
          <Stat> {stats.learningPathProgress}% </Stat>
          <ProgressBar>
            <Progress $value={stats.learningPathProgress} />
          </ProgressBar>
          <StatLabel>Continue your learning journey</StatLabel>
        </ProgressCard>
        <ProgressCard onClick={() => navigate('/courses')}>
          <SubTitle>Course Progress</SubTitle>
          <Stat>{stats.completedCourses}/{stats.totalCourses}</Stat>
          <StatLabel>Courses Completed</StatLabel>
          <QuickAction>Browse Courses</QuickAction>
        </ProgressCard>
        <ProgressCard onClick={() => navigate('/certificates')}>
          <SubTitle>Certificates</SubTitle>
          <Stat>{stats.certificates}</Stat>
          <StatLabel>Certificates Earned</StatLabel>
          <QuickAction>View Certificates</QuickAction>
        </ProgressCard>
        <ProgressCard onClick={() => navigate('/peer-learning')}>
          <SubTitle>Peer Learning</SubTitle>
          <Stat>{stats.peerLearningSessions}</Stat>
          <StatLabel>Learning Sessions</StatLabel>
          <QuickAction>Join Session</QuickAction>
        </ProgressCard>
        <ProgressCard onClick={() => navigate('/jobs')}>
          <SubTitle>Job Applications</SubTitle>
          <Stat>{stats.jobApplications}</Stat>
          <StatLabel>Applications Submitted</StatLabel>
          <QuickAction>Browse Jobs</QuickAction>
        </ProgressCard>
      </DashboardGrid>
      <AvailableCourses courses={courses} onCourseClick={handleCourseClick} t={t} />

      {/* Recent Job Opportunities */}
      {jobs.length > 0 && (
        <CourseCard>
          <CourseCardTitle>Recent Job Opportunities</CourseCardTitle>
          <CourseList>
            {jobs.map(job => (
              <CourseItemStyled key={job._id} onClick={() => navigate('/jobs')}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{job.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    {job.company} • {job.location} • {job.job_type}
                    {job.application_deadline && (
                      <span> • Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#28a745',
                  fontWeight: '600',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  background: '#d4edda',
                  border: '1px solid #c3e6cb'
                }}>
                  Apply Now
                </div>
              </CourseItemStyled>
            ))}
          </CourseList>
          <QuickAction onClick={() => navigate('/jobs')}>
            View All Jobs
          </QuickAction>
        </CourseCard>
      )}

      {/* Recent Scholarship Opportunities */}
      {scholarships.length > 0 && (
        <CourseCard>
          <CourseCardTitle>Recent Scholarship Opportunities</CourseCardTitle>
          <CourseList>
            {scholarships.map(scholarship => (
              <CourseItemStyled key={scholarship._id} onClick={() => navigate('/jobs')}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{scholarship.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    {scholarship.provider} • {scholarship.location}
                    {scholarship.deadline && (
                      <span> • Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#6f42c1',
                  fontWeight: '600',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  background: '#e8d5ff',
                  border: '1px solid #d1b3ff'
                }}>
                  Apply Now
                </div>
              </CourseItemStyled>
            ))}
          </CourseList>
          <QuickAction onClick={() => navigate('/jobs')}>
            View All Scholarships
          </QuickAction>
        </CourseCard>
      )}
    </div>
  );
};

export default RefugeeDashboard; 