import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
  margin: 2rem 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    margin: 1.5rem auto;
    max-width: 500px;
    padding: 0 1.5rem;
  }
  @media (max-width: 600px) {
    gap: 2rem;
    margin: 1rem auto;
    padding: 0 1rem;
    max-width: 100%;
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
    padding: 1.25rem;
  }
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: #007BFF;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const SubTitle = styled.h2`
  color: #007BFF;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Stat = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 1rem;
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

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  width: calc(100% - 2rem);
  max-width: 100%;
  overflow-wrap: break-word;
  color: #333;
  border: 1px solid #e9ecef;
  margin: 2rem 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 900px) {
    width: calc(100% - 3rem);
    margin: 1.5rem 1.5rem;
    padding: 1.25rem;
  }
  
  @media (max-width: 600px) {
    width: calc(100% - 2rem);
    margin: 1rem 1rem;
    padding: 1rem;
  }
`;

const CourseCardTitle = styled.h2`
  color: #007BFF;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const CourseList = styled.div`
  margin-top: 1rem;
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

const AvailableCourses = ({ courses, onCourseClick, t }) => {
  // Filter to show only published courses
  const publishedCourses = courses.filter(course => course.isPublished === true || course.isPublished === 'true');
  
  return (
    <CourseCard>
      <CourseCardTitle>Available Courses ({publishedCourses.length})</CourseCardTitle>
      <CourseList>
        {publishedCourses.map(course => (
          <CourseItemStyled key={course._id} onClick={() => onCourseClick(course)}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{course.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                {course.category} • {course.level || 'Beginner'} • {course.duration || 'Self-paced'}
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
              Available
            </div>
          </CourseItemStyled>
        ))}
      </CourseList>
    </CourseCard>
  );
};

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
    enrolledCourses: 0,
    availableCourses: 0,
    certificates: 0,
    assessmentsCompleted: 0,
    learningPathProgress: 0,
    peerLearningSessions: 0,
    jobApplications: 0,
    scholarships: 0
  });
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(false);

  const fetchDashboardData = async () => {
    // Prevent multiple concurrent API calls
    if (isDataFetching) {
      console.log('⏸️ Data already fetching, skipping...');
      return;
    }
    
    setIsDataFetching(true);
    try {
      setLoading(true);
      console.log('🚀 Starting fetchDashboardData');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token available:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        console.log('❌ No token found, but continuing to fetch data anyway...');
      }
      
      // Initialize data arrays
      let coursesData = [];
      let statsData = {};
      let jobsData = [];
      let scholarshipsData = [];
      let certificatesData = [];
      
      // Fetch courses
      try {
        console.log('📚 Fetching courses...');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.log('⚠️ Fetching courses without authentication token');
        }
        
        const coursesResponse = await fetch('/api/courses', { headers });
        
        console.log('📊 Courses response status:', coursesResponse.status);
        
        if (coursesResponse.status === 429) {
          console.log('⏸️ Rate limited, waiting 2 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retryResponse = await fetch('/api/courses', { headers });
          if (retryResponse.ok) {
            const coursesApiData = await retryResponse.json();
            if (coursesApiData.success && coursesApiData.data && coursesApiData.data.courses) {
              coursesData = coursesApiData.data.courses;
              console.log('✅ Found courses after retry:', coursesData.length);
            }
          }
        } else if (coursesResponse.ok) {
          const coursesApiData = await coursesResponse.json();
          console.log('✅ Courses API response:', coursesApiData);
          
          if (coursesApiData.success && coursesApiData.data && coursesApiData.data.courses) {
            coursesData = coursesApiData.data.courses;
            console.log('✅ Found courses:', coursesData.length);
            coursesData.forEach(course => {
              console.log(`📖 Course: "${course.title}" - Published: ${course.isPublished}`);
            });
          }
        } else {
          console.error('❌ Courses API failed with status:', coursesResponse.status);
        }
      } catch (error) {
        console.error('❌ Courses fetch failed:', error);
      }
      
      // Fetch jobs
      try {
        console.log('💼 Fetching jobs...');
        const jobsHeaders = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          jobsHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const jobsResponse = await fetch('/api/jobs', { headers: jobsHeaders });
        
        if (jobsResponse.ok) {
          const jobsApiData = await jobsResponse.json();
          console.log('✅ Jobs API response:', jobsApiData);
          
          if (jobsApiData.success && jobsApiData.data && jobsApiData.data.jobs) {
            jobsData = jobsApiData.data.jobs;
            console.log('✅ Found jobs:', jobsData.length);
          }
        }
      } catch (error) {
        console.error('❌ Jobs fetch failed:', error);
      }
      
      // Fetch scholarships
      try {
        console.log('🎓 Fetching scholarships...');
        const scholarshipsHeaders = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          scholarshipsHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const scholarshipsResponse = await fetch('/api/scholarships', { headers: scholarshipsHeaders });
        
        if (scholarshipsResponse.ok) {
          const scholarshipsApiData = await scholarshipsResponse.json();
          console.log('✅ Scholarships API response:', scholarshipsApiData);
          
          if (scholarshipsApiData.success && scholarshipsApiData.data && scholarshipsApiData.data.scholarships) {
            scholarshipsData = scholarshipsApiData.data.scholarships;
            console.log('✅ Found scholarships:', scholarshipsData.length);
          }
        }
      } catch (error) {
        console.error('❌ Scholarships fetch failed:', error);
      }
      
      // Fetch peer learning sessions
      let peerLearningData = [];
      try {
        console.log('👥 Fetching peer learning sessions...');
        const peerHeaders = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          peerHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const peerLearningResponse = await fetch('/api/peer-learning/groups', { headers: peerHeaders });
        
        if (peerLearningResponse.ok) {
          const peerLearningApiData = await peerLearningResponse.json();
          console.log('✅ Peer Learning API response:', peerLearningApiData);
          
          if (peerLearningApiData.success && peerLearningApiData.data && peerLearningApiData.data.groups) {
            peerLearningData = peerLearningApiData.data.groups;
            console.log('✅ Found peer learning sessions:', peerLearningData.length);
          }
        }
      } catch (error) {
        console.error('❌ Peer learning fetch failed:', error);
      }
      
      // Fetch certificates
      try {
        console.log('📜 Fetching certificates...');
        const certificatesHeaders = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          certificatesHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const certificatesResponse = await fetch('/api/certificates/user', { headers: certificatesHeaders });
        
        if (certificatesResponse.ok) {
          const certificatesApiData = await certificatesResponse.json();
          console.log('✅ Certificates API response:', certificatesApiData);
          console.log('🔍 Raw API data structure:', JSON.stringify(certificatesApiData, null, 2));
          
          if (certificatesApiData.success && certificatesApiData.data && certificatesApiData.data.certificates) {
            certificatesData = certificatesApiData.data.certificates;
            console.log('✅ Found certificates:', certificatesData.length);
            console.log('📜 Certificate details:', certificatesData);
          } else {
            console.warn('⚠️ Invalid certificates API response structure');
            console.log('📊 Response structure check:');
            console.log('  - success:', certificatesApiData.success);
            console.log('  - data exists:', !!certificatesApiData.data);
            console.log('  - certificates exists:', !!(certificatesApiData.data && certificatesApiData.data.certificates));
          }
        } else {
          console.error('❌ Certificates API failed with status:', certificatesResponse.status);
          const errorText = await certificatesResponse.text();
          console.error('❌ Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Certificates fetch failed:', error);
      }

      // Update state immediately
      setCourses(coursesData);
      setJobs(jobsData);
      setScholarships(scholarshipsData);
      
      // Update stats with real counts
      const publishedCoursesCount = coursesData.filter(course => 
        course.isPublished === true || course.isPublished === 'true'
      ).length;
      
      console.log('📊 Final counts:');
      console.log('  - Published courses:', publishedCoursesCount);
      console.log('  - Jobs:', jobsData.length);
      console.log('  - Scholarships:', scholarshipsData.length);
      console.log('  - Certificates:', certificatesData.length);
      console.log('  - Peer Learning Sessions:', peerLearningData.length);
      console.log('  - Dashboard will show all these counts now!');
      console.log('🎯 CERTIFICATE COUNT THAT WILL BE DISPLAYED:', certificatesData.length);
      
      setStats(prev => ({
        ...prev,
        availableCourses: publishedCoursesCount,
        jobApplications: jobsData.length,
        certificates: certificatesData.length,
        peerLearningSessions: peerLearningData.length,
        scholarships: scholarshipsData.length,
        completedCourses: 0,
        enrolledCourses: 0,
        assessmentsCompleted: 0,
        learningPathProgress: 0
      }));

    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setIsDataFetching(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered');
    
    // Add a small delay to prevent too many requests
    const timer = setTimeout(() => {
      console.log('✅ Fetching dashboard data after delay...');
      fetchDashboardData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
        {isDataFetching && <div style={{ marginTop: '1rem', color: '#666' }}>Fetching data from server...</div>}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <div>Error: {error}</div>
      </div>
    );
  }
  
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '1.5rem 1rem', margin: 0 }}>
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
        <ProgressCard onClick={() => navigate('/courses')}>
          <SubTitle>Available Courses</SubTitle>
          <Stat>{stats.availableCourses}</Stat>
          <StatLabel>Courses Available</StatLabel>
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
          <StatLabel>Applications Released</StatLabel>
          <QuickAction>Browse Jobs</QuickAction>
        </ProgressCard>
        <ProgressCard onClick={() => navigate('/jobs')}>
          <SubTitle>Scholarships</SubTitle>
          <Stat>{stats.scholarships}</Stat>
          <StatLabel>Scholarships Available</StatLabel>
          <QuickAction>Browse Scholarships</QuickAction>
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
                    {job.company} • {job.location} • {job.type}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#007BFF',
                  fontWeight: '600',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  background: '#e3f2fd',
                  border: '1px solid #bbdefb'
                }}>
                  Apply Now
                </div>
              </CourseItemStyled>
            ))}
          </CourseList>
        </CourseCard>
      )}

      {/* Recent Scholarships */}
      {scholarships.length > 0 && (
        <CourseCard>
          <CourseCardTitle>Recent Scholarship Opportunities</CourseCardTitle>
          <CourseList>
            {scholarships.map(scholarship => (
              <CourseItemStyled key={scholarship._id} onClick={() => navigate('/scholarships')}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{scholarship.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    {scholarship.provider} • Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
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
                  Apply
                </div>
              </CourseItemStyled>
            ))}
          </CourseList>
        </CourseCard>
      )}
    </div>
  );
};

export default RefugeeDashboard; 