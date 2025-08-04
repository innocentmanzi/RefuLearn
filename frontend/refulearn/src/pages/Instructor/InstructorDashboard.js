/**
 * 🔥 INSTRUCTOR DASHBOARD v5.0 - ONLINE ONLY
 * Cache buster: v5.0 - 2025-01-15-18:00 - REAL DATA ONLY
 * REAL DASHBOARD FUNCTIONALITY - ONLINE ONLY
 * SHOWS ACTUAL INSTRUCTOR DATA FROM API
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import PageContainer from '../../components/PageContainer';
import ContentWrapper from '../../components/ContentWrapper';
import { useUser } from '../../contexts/UserContext';
import { useTranslation } from 'react-i18next';

// const Container = styled.div`
//   padding: 2rem;
//   background: ${({ theme }) => theme.colors.white};
//   min-height: 100vh;
// `;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Stat = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const SectionTitle = styled.h2`
  color: #555;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 300px));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1rem;
`;

// const ChartPlaceholder = styled.div`
//   background: #f7f7f7;
//   border-radius: 8px;
//   height: 180px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: #aaa;
//   font-size: 1.1rem;
//   margin-bottom: 1.5rem;
// `;

const StudentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StudentItem = styled.li`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuickAction = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  margin-top: 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const StickyFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ color }) => color || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ color }) => color && `${color}cc`};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const InstructorDashboard = () => {
  const { t } = useTranslation();
  console.log('🔥 INSTRUCTOR DASHBOARD v5.0 - ONLINE ONLY - 2025-01-15-18:00');
  
  const navigate = useNavigate();
  const { user, token } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalCourses: 0,
      totalStudents: 0,
      totalQuizzes: 0,
      totalSubmissions: 0
    },
    studentProgress: []
  });
  
  console.log('🔥 INSTRUCTOR DASHBOARD v5.0 STARTING');
  console.log('🔐 User available:', !!user);
  console.log('🎫 Token available:', !!token);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [studentActivity, setStudentActivity] = useState(null);
  const [reply, setReply] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showSubmissionsList, setShowSubmissionsList] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showAssessmentsModal, setShowAssessmentsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone_number: '',
    language_preference: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const welcomeMessage = isFirstLogin ? `Welcome ${user?.firstName || 'Instructor'}!` : `Welcome back ${user?.firstName || 'Instructor'}!`;

  // Track user activity
  const trackActivity = async (activityType, details = '') => {
    try {
      await fetch('/api/user/track-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_type: activityType,
          details: details
        })
      });
      console.log('✅ Activity tracked:', activityType);
    } catch (err) {
      console.error('❌ Failed to track activity:', err);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching instructor dashboard data...');
      
      const response = await fetch('/api/instructor/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard data loaded successfully');
        setDashboardData(data.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('❌ Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  // Fetch student activity for dynamic graph
  const fetchStudentActivity = async () => {
    try {
      console.log('🔄 Fetching student activity...');
      
      const response = await fetch('/api/instructor/student-activity?period=7', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Student activity data received');
        setStudentActivity(data.data);
      } else {
        throw new Error('Failed to fetch student activity');
      }
    } catch (err) {
      console.error('❌ Failed to fetch student activity:', err);
    }
  };

  // Fetch admin notifications
  const fetchAdminNotifications = async () => {
    console.log('🔔 Fetching admin notifications...');
    
    try {
      const response = await fetch('/api/instructor/notifications', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔔 Notifications response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notifications data received:', data);
        
        if (data.data && data.data.notifications) {
          setAdminNotifications(data.data.notifications);
        }
      } else {
        console.warn('⚠️ Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch notifications:', error);
    }
  };

  // Fetch student submissions
  const fetchStudentSubmissions = async () => {
    try {
      console.log('🔍 Starting to fetch student submissions...');
      let allSubmissions = [];

      // Get all courses for this instructor
      const coursesResponse = await fetch('/api/instructor/courses', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📚 Courses response status:', coursesResponse.status);

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log('📚 Courses data received:', coursesData);
        
        // For each course, fetch submissions
        for (const course of coursesData.data.courses) {
          console.log(`🔍 Fetching submissions for course: ${course.title} (${course._id})`);
          
          try {
            const submissionsResponse = await fetch(`/api/courses/${course._id}/submissions`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            console.log(`📋 Submissions response for ${course.title}:`, submissionsResponse.status);

            if (submissionsResponse.ok) {
              const submissionsData = await submissionsResponse.json();
              console.log(`📋 Submissions data for ${course.title}:`, submissionsData);
              
              // Add course info to each submission
              for (const submission of submissionsData.data.submissions) {
                console.log('📝 Adding submission:', submission);
                allSubmissions.push({
                  ...submission,
                  courseName: course.title,
                  courseId: course._id
                });
              }
            } else {
              const errorText = await submissionsResponse.text();
              console.error(`❌ Error response for ${course.title}:`, errorText);
            }
          } catch (submissionError) {
            console.error(`❌ Error fetching submissions for course ${course._id}:`, submissionError);
          }
        }
      } else {
        throw new Error('Failed to fetch courses');
      }
      
      console.log('📋 All submissions fetched:', allSubmissions);
      console.log('📊 Total submissions count:', allSubmissions.length);
      setStudentSubmissions(allSubmissions);
    } catch (err) {
      console.error('❌ Failed to fetch submissions:', err);
    }
  };

  // Fetch instructor profile
  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching instructor profile...');
      
      const response = await fetch('/api/instructor/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const profileData = data.data.user;
        console.log('✅ Instructor profile data received');
        
        // Set profile data for editing
        setProfileData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          bio: profileData.bio || '',
          phone_number: profileData.phone_number || '',
          language_preference: profileData.language_preference || ''
        });
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
    }
  };

  // Update instructor profile
  const updateProfile = async () => {
    try {
      setProfileLoading(true);
      
      console.log('🔄 Updating instructor profile...');
      
      const response = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        console.log('✅ Profile update successful');
        setSuccess('Profile updated successfully');
        setShowProfileModal(false);
        
        // Update stored profile data
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/instructor/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setAdminNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        console.log('✅ Notification marked as read');
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
    }
  };

  // Grade submission
  const gradeSubmission = async (assessmentId, submissionId, score, feedback) => {
    try {
      const response = await fetch(`/api/instructor/assessments/${assessmentId}/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: parseFloat(score),
          feedback: feedback || '',
          comments: ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to grade submission');
      }

      setSuccess('Submission graded successfully');
      setSelectedStudent(null);
      setGrade('');
      setFeedback('');
      fetchStudentSubmissions(); // Refresh submissions
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to grade submission');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Load dashboard data
  useEffect(() => {
    console.log('🔥 INSTRUCTOR DASHBOARD v5.0 - ONLINE ONLY');
    
    if (token) {
      fetchDashboardData();
      fetchStudentActivity();
      fetchStudentSubmissions();
      fetchAdminNotifications();
      fetchProfile();
    }
  }, [user, token]); // Re-run when user or token changes

  // Typing animation effect for welcome message
  useEffect(() => {
    const text = welcomeMessage;
    let index = 0;
    setWelcomeText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      setWelcomeText(text.slice(0, index));
      index++;
      if (index > text.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [welcomeMessage]);

  // INSTRUCTOR DASHBOARD v5.0 - ONLINE ONLY
  console.log('🔥 INSTRUCTOR DASHBOARD v5.0 RENDERING NOW');

  // Use real-time student activity data for the graph (now in percentages)
  const progressData = studentActivity?.dailyActivity?.map(day => ({
    name: day.day,
    progress: day.activeUsers, // Already in percentage (0-100)
    progressMade: day.progressMade, // Already in percentage (0-100)
    fullDate: day.formattedDate,
    rawActiveUsers: day.rawActiveUsers,
    rawProgressMade: day.rawProgressMade
  })) || [];

  const studentProgress = dashboardData?.studentProgress?.map(progress => ({
    name: progress.courseName || 'Course',
    progress: `${Math.round(progress.completionPercentage || 0)}%`,
    enrolled: progress.enrolledStudents || 0,
    completed: progress.completedStudents || 0
  })) || [];

  return (
    <ContentWrapper>
      <PageContainer>
        {success && <SuccessMessage>{success}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Title>
          <span>
            {welcomeText || `${t('instructor.dashboard')} ${user?.firstName || 'Instructor'}!`}
            {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
          </span>
        </Title>
        
        {loading && (
          <div style={{ 
            background: '#d1ecf1', 
            color: '#0c5460', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center',
            border: '1px solid #bee5eb'
          }}>
            🔄 {t('loading')} {t('instructor.dashboard').toLowerCase()}...
          </div>
        )}

        <OverviewGrid>
          <OverviewCard onClick={() => { setShowCoursesModal(true); trackActivity('courses_view', 'Viewed courses overview'); }} style={{ cursor: 'pointer' }}>
            <Stat>{dashboardData?.overview?.totalCourses || 0}</Stat>
            <StatLabel>{t('instructor.totalCourses')}</StatLabel>
          </OverviewCard>
          <OverviewCard onClick={() => { setShowStudentsModal(true); trackActivity('students_view', 'Viewed students overview'); }} style={{ cursor: 'pointer' }}>
            <Stat>{dashboardData?.overview?.totalStudents || 0}</Stat>
            <StatLabel>{t('instructor.totalStudents')}</StatLabel>
          </OverviewCard>
                        <OverviewCard onClick={() => { setShowAssessmentsModal(true); trackActivity('quizzes_view', 'Viewed quizzes overview'); }} style={{ cursor: 'pointer' }}>
                <Stat>{dashboardData?.overview?.totalQuizzes || 0}</Stat>
                <StatLabel>Total Quizzes</StatLabel>
          </OverviewCard>
        </OverviewGrid>
        
        {dashboardData?.overview?.totalCourses === 0 && !loading && (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center',
            marginBottom: '1rem',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ color: '#6c757d', marginTop: 0 }}>{t('instructor.dashboard')}</h4>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              {t('instructor.dashboard')} {t('loading')}. {t('instructor.dashboard')}!
            </p>
            <QuickAction onClick={() => navigate('/manage-courses')}>
              {t('instructor.dashboard')}
            </QuickAction>
          </div>
        )}

        <SectionTitle>{t('instructor.studentActivity')}</SectionTitle>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6c757d' }}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6c757d' }}
            />
            <Tooltip 
              formatter={(value, name, props) => [
                `${value}%`, 
                name === 'progress' ? 'Active Users' : 'Progress Made'
              ]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="progress" fill="#007BFF" name="Active Users %" radius={[2, 2, 0, 0]} />
            <Bar dataKey="progressMade" fill="#28a745" name="Progress Made %" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        <SectionTitle>{t('instructor.coursePerformance')}</SectionTitle>
        {studentProgress.length > 0 ? (
          <StudentList>
            {studentProgress.map((course, idx) => (
              <StudentItem key={idx}>
                <span>{course.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: '#007BFF', fontSize: '0.95rem', fontWeight: 'bold' }}>{course.progress}</span>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>{course.completed}/{course.enrolled} completed</span>
                </div>
              </StudentItem>
            ))}
          </StudentList>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#6c757d',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <p>No course progress data available</p>
            <p style={{ fontSize: '0.9rem' }}>
              Data is loading or you haven't created any courses yet
            </p>
          </div>
        )}
        
        <SectionTitle>Quick Actions</SectionTitle>
                  <QuickAction onClick={() => { trackActivity('create_course_click', 'Clicked create course'); navigate('/instructor/courses/create'); }}>Create Course</QuickAction>
                      <QuickAction onClick={() => { trackActivity('create_quiz_click', 'Clicked create quiz'); navigate('/instructor/quizzes'); }}>Create Quiz</QuickAction>
        
        <SectionTitle>Recent Activity</SectionTitle>
        <DashboardGrid>
          <Card onClick={() => setShowNotificationsList(true)} style={{ cursor: 'pointer' }}>
            <CardTitle>New Messages</CardTitle>
            <p>{adminNotifications.filter(n => !n.isRead).length} unread messages from admin.</p>
            {adminNotifications.length > 0 && (
              <p style={{ color: '#007BFF', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Latest: {adminNotifications[0]?.title || 'No messages'}
              </p>
            )}
          </Card>
        </DashboardGrid>

        {showSubmissionsList && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>All Student Submissions</ModalTitle>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {studentSubmissions.map((sub, idx) => (
                  <li key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span><b>{sub.student?.firstName} {sub.student?.lastName}</b> - {sub.assessmentTitle}</span>
                      <ActionButton onClick={() => { setSelectedStudent(sub); setShowSubmissionsList(false); }}>View & Grade</ActionButton>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#888' }}>
                      Submitted: {new Date(sub.submittedAt).toLocaleDateString()} | Status: {sub.status}
                    </div>
                  </li>
                ))}
              </ul>
              <StickyFooter>
                <ActionButton color="#888" onClick={() => setShowSubmissionsList(false)}>Close</ActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {selectedStudent && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Submission: {selectedStudent.student?.firstName} {selectedStudent.student?.lastName}</ModalTitle>
              <div><b>Assessment:</b> {selectedStudent.assessmentTitle}</div>
              <div><b>Submitted At:</b> {new Date(selectedStudent.submittedAt).toLocaleString()}</div>
              <div><b>Status:</b> {selectedStudent.status}</div>
              <div style={{ margin: '1rem 0', background: '#f7f7f7', padding: '1rem', borderRadius: 8 }}>
                <b>Student's Work:</b>
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Submission Type:</strong> {selectedStudent.submissionType === 'file' ? 'File Upload' : 'Link Submission'}
                  </div>
                  
                  {selectedStudent.submissionType === 'file' && selectedStudent.fileName && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>File:</strong> {selectedStudent.fileName}
                      {selectedStudent.fileSize && (
                        <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                          ({(selectedStudent.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                      {selectedStudent.filePath && (
                        <div style={{ marginTop: '0.5rem' }}>
                                                  <a 
                          href={`/api/submission-file/${selectedStudent._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007BFF', 
                            textDecoration: 'none',
                            padding: '0.5rem 1rem',
                            background: '#e3f2fd',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}
                        >
                          👁️ View File
                        </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedStudent.submissionType === 'link' && selectedStudent.submissionLink && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Submitted Link:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <a 
                          href={selectedStudent.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007BFF', 
                            textDecoration: 'none',
                            wordBreak: 'break-all'
                          }}
                        >
                          🔗 {selectedStudent.submissionLink}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {selectedStudent.submissionText && selectedStudent.submissionText.trim() && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Additional Comments:</strong>
                      <div style={{ 
                        marginTop: '0.5rem', 
                        padding: '0.5rem', 
                        background: '#fff', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedStudent.submissionText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label>Enter Grade:</label>
                <Input
                  placeholder="e.g. 85"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  type="number"
                  min="0"
                  max="100"
                />
                <label>Feedback:</label>
                <TextArea
                  placeholder="Write feedback for the student..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>
              <StickyFooter>
                <ActionButton
                  onClick={() => gradeSubmission(selectedStudent.assessmentId, selectedStudent._id, grade, feedback)}
                  disabled={!grade || !feedback}
                >
                  Release Grade
                </ActionButton>
                <ActionButton color="#888" onClick={() => { setSelectedStudent(null); setGrade(''); setFeedback(''); }}>Close</ActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {showNotificationsList && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Admin Messages</ModalTitle>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {adminNotifications.length > 0 ? (
                  adminNotifications.map((notification, idx) => (
                    <li key={idx} style={{ 
                      marginBottom: 12, 
                      borderBottom: '1px solid #eee', 
                      paddingBottom: 8,
                      backgroundColor: notification.isRead ? '#f8f9fa' : '#fff',
                      padding: '12px',
                      borderRadius: '8px',
                      border: notification.isRead ? '1px solid #e9ecef' : '1px solid #007bff'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: notification.isRead ? '#6c757d' : '#007bff' }}>
                            {notification.title}
                          </div>
                          <div style={{ marginTop: '4px', color: '#495057' }}>
                            {notification.message}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '4px' }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <ActionButton 
                            onClick={() => markNotificationAsRead(notification._id)}
                            style={{ marginLeft: '12px' }}
                          >
                            Mark Read
                          </ActionButton>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                    No messages from admin yet.
                  </li>
                )}
              </ul>
              <StickyFooter>
                <ActionButton color="#888" onClick={() => setShowNotificationsList(false)}>Close</ActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {showCoursesModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Courses & Enrolled Students</ModalTitle>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {dashboardData?.recentCourses?.map((course, idx) => (
                  <li key={idx}>
                    <b>{course.title}</b>: {course.enrolledStudents?.length || 0} students enrolled
                  </li>
                ))}
              </ul>
              <StickyFooter>
                <ActionButton color="#888" onClick={() => setShowCoursesModal(false)}>Close</ActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {showStudentsModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Student Statistics</ModalTitle>
              <div><b>Total Students:</b> {dashboardData?.overview?.totalStudents || 0}</div>
              <div><b>Completion Rate:</b> {dashboardData?.overview?.completionRate || 0}%</div>
              <div><b>Active Students:</b> {dashboardData?.overview?.activeStudents || 0}</div>
              <StickyFooter>
                <ActionButton color="#888" onClick={() => setShowStudentsModal(false)}>Close</ActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {showAssessmentsModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Quiz Statistics</ModalTitle>
              <div><b>Total Quizzes:</b> {dashboardData?.overview?.totalQuizzes || 0}</div>
              <div><b>Published Quizzes:</b> {dashboardData?.overview?.publishedQuizzes || 0}</div>
              <StickyFooter>
                <ActionButton color="#888" onClick={() => setShowAssessmentsModal(false)}>Close</ActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}

                 {showProfileModal && (
           <ModalOverlay>
             <ModalContent>
               <ModalTitle>Instructor Profile</ModalTitle>
               
               <div style={{ marginBottom: '1rem' }}>
                 <label>First Name:</label>
                 <Input
                   placeholder="First Name"
                   value={profileData.firstName}
                   onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                 />
               </div>
               
               <div style={{ marginBottom: '1rem' }}>
                 <label>Last Name:</label>
                 <Input
                   placeholder="Last Name"
                   value={profileData.lastName}
                   onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                 />
               </div>
               
               <div style={{ marginBottom: '1rem' }}>
                 <label>Bio:</label>
                 <TextArea
                   placeholder="Tell us about yourself..."
                   value={profileData.bio}
                   onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                   rows="3"
                 />
               </div>
               
               <div style={{ marginBottom: '1rem' }}>
                 <label>Phone Number:</label>
                 <Input
                   placeholder="Phone Number"
                   value={profileData.phone_number}
                   onChange={e => setProfileData({ ...profileData, phone_number: e.target.value })}
                 />
               </div>
               
               <div style={{ marginBottom: '1rem' }}>
                 <label>Language Preference:</label>
                 <Input
                   placeholder="Preferred language"
                   value={profileData.language_preference}
                   onChange={e => setProfileData({ ...profileData, language_preference: e.target.value })}
                 />
               </div>
               
               <StickyFooter>
                 <ActionButton
                   onClick={updateProfile}
                   disabled={profileLoading || !profileData.firstName || !profileData.lastName}
                 >
                   {profileLoading ? 'Updating...' : 'Update Profile'}
                 </ActionButton>
                 <ActionButton color="#888" onClick={() => setShowProfileModal(false)}>Close</ActionButton>
               </StickyFooter>
             </ModalContent>
           </ModalOverlay>
         )}
      </PageContainer>
    </ContentWrapper>
  );
};

export default InstructorDashboard; 