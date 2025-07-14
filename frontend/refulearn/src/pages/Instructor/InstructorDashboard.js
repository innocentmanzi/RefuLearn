import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import PageContainer from '../../components/PageContainer';
import ContentWrapper from '../../components/ContentWrapper';
import { useUser } from '../../contexts/UserContext';

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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  const navigate = useNavigate();
  const { user, token } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [studentActivity, setStudentActivity] = useState(null);
  const [reply, setReply] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showSubmissionsList, setShowSubmissionsList] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showMessagesList, setShowMessagesList] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
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
    } catch (err) {
      console.error('Failed to track activity:', err);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Track that user viewed dashboard
      await trackActivity('dashboard_view', 'Instructor viewed dashboard');
      
      // Use mock data endpoint for realistic testing (change back to '/api/instructor/dashboard' for real data)
      const response = await fetch('/api/instructor/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student activity for dynamic graph
  const fetchStudentActivity = async () => {
    try {
      const response = await fetch('/api/instructor/student-activity?period=7', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student activity');
      }

      const data = await response.json();
      setStudentActivity(data.data);
    } catch (err) {
      console.error('Failed to fetch student activity:', err);
    }
  };

  // Fetch student submissions
  const fetchStudentSubmissions = async () => {
    try {
      console.log('🔍 Starting to fetch student submissions...');
      
      // First get all courses for this instructor
      const coursesResponse = await fetch('/api/instructor/courses', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📚 Courses response status:', coursesResponse.status);

      if (!coursesResponse.ok) {
        const errorText = await coursesResponse.text();
        console.error('❌ Failed to fetch courses:', errorText);
        throw new Error('Failed to fetch courses');
      }

      const coursesData = await coursesResponse.json();
      console.log('📚 Courses data received:', coursesData);
      
      const allSubmissions = [];
      
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
            
            // Add course info to each submission (backend now provides student and assessment details)
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
      const response = await fetch('/api/instructor/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      // Set profile data for editing
      setProfileData({
        firstName: data.data.user.firstName || '',
        lastName: data.data.user.lastName || '',
        bio: data.data.user.bio || '',
        phone_number: data.data.user.phone_number || '',
        language_preference: data.data.user.language_preference || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  // Update instructor profile
  const updateProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      setShowProfileModal(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProfileLoading(false);
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

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchStudentActivity();
      fetchStudentSubmissions();
      fetchProfile();
    }
  }, [token]);

  // Removed auto-refresh to prevent unnecessary re-rendering

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= welcomeMessage.length) {
        setWelcomeText(welcomeMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 100);
    return () => clearInterval(typingInterval);
  }, [welcomeMessage]);

  if (loading) {
    return (
      <ContentWrapper>
        <PageContainer>
          <LoadingSpinner>Loading dashboard...</LoadingSpinner>
        </PageContainer>
      </ContentWrapper>
    );
  }

  if (!loading && !dashboardData) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>Instructor Dashboard</Title>
          <div style={{ textAlign: 'center', color: '#888', margin: '2rem 0' }}>
            No dashboard data found.
          </div>
        </PageContainer>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <PageContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <QuickAction onClick={fetchDashboardData}>Retry</QuickAction>
        </PageContainer>
      </ContentWrapper>
    );
  }

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
            {welcomeText}
            {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
          </span>
        </Title>
        
        <OverviewGrid>
          <OverviewCard onClick={() => { setShowCoursesModal(true); trackActivity('courses_view', 'Viewed courses overview'); }} style={{ cursor: 'pointer' }}>
            <Stat>{dashboardData?.overview?.totalCourses || 0}</Stat>
            <StatLabel>Courses</StatLabel>
          </OverviewCard>
          <OverviewCard onClick={() => { setShowStudentsModal(true); trackActivity('students_view', 'Viewed students overview'); }} style={{ cursor: 'pointer' }}>
            <Stat>{dashboardData?.overview?.totalStudents || 0}</Stat>
            <StatLabel>Students</StatLabel>
          </OverviewCard>
          <OverviewCard onClick={() => { setShowAssessmentsModal(true); trackActivity('assessments_view', 'Viewed assessments overview'); }} style={{ cursor: 'pointer' }}>
            <Stat>{dashboardData?.overview?.totalAssessments || 0}</Stat>
            <StatLabel>Assessments</StatLabel>
          </OverviewCard>
          <OverviewCard onClick={() => { setShowSubmissionsList(true); trackActivity('submissions_view', 'Viewed submissions'); }} style={{ cursor: 'pointer' }}>
            <Stat>{dashboardData?.overview?.totalSubmissions || studentSubmissions.length}</Stat>
            <StatLabel>Submissions</StatLabel>
          </OverviewCard>
        </OverviewGrid>

        <SectionTitle>Daily Student Activity & Progress</SectionTitle>
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
        
        <SectionTitle>Course Progress Overview</SectionTitle>
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
        
        <SectionTitle>Quick Actions</SectionTitle>
        <QuickAction onClick={() => { trackActivity('create_course_click', 'Clicked create course'); navigate('/manage-courses'); }}>Create Course</QuickAction>
        <QuickAction onClick={() => { trackActivity('create_assessment_click', 'Clicked create assessment'); navigate('/assessments'); }}>Create Assessment</QuickAction>
        
        <SectionTitle>Recent Activity</SectionTitle>
        <DashboardGrid>
          <Card onClick={() => {
            console.log('🎯 Opening submissions modal, current submissions:', studentSubmissions);
            console.log('📊 Submissions count:', studentSubmissions.length);
            setShowSubmissionsList(true);
          }} style={{ cursor: 'pointer' }}>
            <CardTitle>New Submissions</CardTitle>
                            <p>{dashboardData?.overview?.totalSubmissions || studentSubmissions.length} submissions to review.</p>
            {studentActivity?.summary && (
              <p style={{ color: '#28a745', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Total progress made this week: {studentActivity.summary.totalProgressMade}
              </p>
            )}
          </Card>
          <Card onClick={() => setShowMessagesList(true)} style={{ cursor: 'pointer' }}>
            <CardTitle>Active Students</CardTitle>
            <p>{studentActivity?.summary?.totalActiveUsers || 0} active students this week.</p>
            {studentActivity?.summary && (
              <p style={{ color: '#007BFF', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Average progress: {Math.round(studentActivity.summary.averageProgress || 0)}%
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

        {showMessagesList && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>All Student Messages</ModalTitle>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {messages.map((msg, idx) => (
                  <li key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span><b>{msg.from}</b>: {msg.message}</span>
                      <ActionButton onClick={() => { setSelectedMessage(msg); setShowMessagesList(false); }}>Reply</ActionButton>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#888' }}>Sent: {msg.sentAt}</div>
                  </li>
                ))}
              </ul>
              <StickyFooter>
                <ActionButton color="#888" onClick={() => setShowMessagesList(false)}>Close</ActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {selectedMessage && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Message from {selectedMessage.from}</ModalTitle>
              <div style={{ marginBottom: '1rem' }}>{selectedMessage.message}</div>
              <Input
                placeholder="Type your reply..."
                value={reply}
                onChange={e => setReply(e.target.value)}
              />
              <StickyFooter>
                <ActionButton onClick={() => { setReply(''); setSelectedMessage(null); }}>Send Reply</ActionButton>
                <ActionButton color="#888" onClick={() => setSelectedMessage(null)}>Close</ActionButton>
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
              <ModalTitle>Assessment Statistics</ModalTitle>
              <div><b>Total Assessments:</b> {dashboardData?.overview?.totalAssessments || 0}</div>
              <div><b>Published Assessments:</b> {dashboardData?.overview?.publishedAssessments || 0}</div>
              <div><b>Submissions:</b> {dashboardData?.overview?.totalSubmissions || studentSubmissions.length}</div>
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