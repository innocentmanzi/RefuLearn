import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line, Bar } from 'react-chartjs-2';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import PageContainer from '../../components/PageContainer';
import ContentWrapper from '../../components/ContentWrapper';
import { useTranslation } from 'react-i18next';
import offlineIntegrationService from '../../services/offlineIntegrationService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

// const Container = styled.div`
//   padding: 2rem;
//   background: ${({ theme }) => theme.colors.white};
//   min-height: 100vh;
//   max-width: 100vw;
//   @media (max-width: 900px) {
//     padding: 1rem;
//   }
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
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const OverviewCard = styled.div`
  background: #007bff;
  color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 150px;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  color: #fff;
`;

const SectionTitle = styled.h2`
  color: #222;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  width: 100%;
  max-width: 100vw;
  margin-bottom: 1rem;
  @media (max-width: 900px) {
    padding: 1rem;
    font-size: 0.98rem;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1rem;
`;

const ChartContainer = styled.div`
  margin-top: 1rem;
  height: 200px;
  width: 100%;
  overflow-x: auto;
  @media (max-width: 600px) {
    height: 160px;
  }
`;

const ApplicantList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ApplicantItem = styled.li`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuickActionLink = styled(NavLink)`
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  margin-top: 0.5rem;
  transition: background 0.2s;
  text-decoration: none;
  display: inline-block;
  &:hover {
    background: #0056b3;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const ResponsiveWrapper = styled.div`
  @media (max-width: 900px) {
    ${OverviewGrid} {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    ${DashboardGrid} {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    ${Card} {
      margin-bottom: 1rem;
    }
  }
`;

// New styled components for improved UI
const SectionContainer = styled.div`
  margin-bottom: 3rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ViewAllLink = styled.button`
  background: transparent;
  border: none;
  color: #007bff;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 123, 255, 0.1);
    color: #0056b3;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ItemCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #007bff, #6c5ce7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.25rem;
`;

const UserMeta = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'reviewed': return '#d4edda';
      case 'hired': return '#d1ecf1';
      case 'rejected': return '#f8d7da';
      case 'shortlisted': return '#d1ecf1';
      default: return '#e9ecef';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'reviewed': return '#155724';
      case 'hired': return '#0c5460';
      case 'rejected': return '#721c24';
      case 'shortlisted': return '#0c5460';
      default: return '#495057';
    }
  }};
  
  border: 1px solid ${props => {
    switch (props.status) {
      case 'pending': return '#ffeaa7';
      case 'reviewed': return '#c3e6cb';
      case 'hired': return '#bee5eb';
      case 'rejected': return '#f5c6cb';
      case 'shortlisted': return '#bee5eb';
      default: return '#dee2e6';
    }
  }};
`;

const ItemContent = styled.div`
  margin-bottom: 1rem;
`;

const JobTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const DateInfo = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    const primary = props.primary || false;
    
    if (primary) {
      return `
        background: #007bff;
        color: white;
        
        &:hover {
          background: #0056b3;
        }
      `;
    }
    
    return `
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
      
      &:hover {
        background: #e9ecef;
      }
    `;
  }}
`;

const StatsCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const StatDescription = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const PerformanceBar = styled.div`
  background: #f8f9fa;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
`;

const PerformanceProgress = styled.div`
  background: linear-gradient(90deg, #28a745, #20c997);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  .title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

const EmptyStateButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
`;

const EmployerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRequestTime, setLastRequestTime] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async (isRefresh = false) => {
      // Rate limiting protection - prevent requests more frequent than 30 seconds
      const now = Date.now();
      if (isRefresh && (now - lastRequestTime) < 30000) {
        console.log('⏰ Rate limiting: Skipping refresh request (too soon)');
        return;
      }
      
      if (!isRefresh) setLoading(true);
      setError('');
      setLastRequestTime(now);
      
      const isOnline = navigator.onLine;
      let dashboardData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching employer dashboard from API...');
          
          const response = await fetch('/api/employer/dashboard', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            if (response.status === 429) {
              console.warn('⚠️ Rate limited by server, using cached data');
              // For rate limiting, use cached data instead of throwing error
              dashboardData = await offlineIntegrationService.getEmployerDashboard();
              if (dashboardData) {
                setDashboardData(dashboardData);
                if (!isRefresh) setLoading(false);
                return;
              }
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.success) {
            dashboardData = data.data;
            
            // Store dashboard data for offline use
            await offlineIntegrationService.storeEmployerDashboard(dashboardData);
            console.log('✅ Employer dashboard stored for offline use');
            
            if (isRefresh) {
              console.log('🔄 Dashboard charts auto-updated with latest database changes');
            } else {
              console.log('✅ Dashboard data loaded from database');
            }
          } else {
            throw new Error(data.message || 'Failed to fetch dashboard data');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          
          // Fall back to offline data if online fails
          dashboardData = await offlineIntegrationService.getEmployerDashboard();
          
          if (!dashboardData && !isRefresh) {
            throw onlineError;
          }
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline employer dashboard data...');
        dashboardData = await offlineIntegrationService.getEmployerDashboard();
      }

      try {
        setDashboardData(dashboardData);
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        if (!isRefresh) {
          setError(`Network error: ${err.message}`);
        }
      } finally {
        if (!isRefresh) setLoading(false);
      }
    };

    // Initial load
    fetchDashboardData();

    // Auto-refresh every 60 seconds for real-time chart updates (reduced frequency to prevent rate limiting)
    const refreshInterval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);

    // Refresh when window becomes visible (user returns to tab) - with rate limiting
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Only refresh if it's been more than 30 seconds since last request
        const now = Date.now();
        if (now - lastRequestTime > 30000) {
          fetchDashboardData(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>{t('employerDashboard.title')}</Title>
          <LoadingSpinner>Loading dashboard data...</LoadingSpinner>
        </PageContainer>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>{t('employerDashboard.title')}</Title>
          <ErrorMessage>{error}</ErrorMessage>
        </PageContainer>
      </ContentWrapper>
    );
  }

  if (!dashboardData) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>{t('employerDashboard.title')}</Title>
          <ErrorMessage>No dashboard data available</ErrorMessage>
        </PageContainer>
      </ContentWrapper>
    );
  }

  // Extract data from API response - ALL DATA COMES FROM DATABASE
  const { overview, charts, recentActivity, topJobs } = dashboardData;

  const stats = {
    jobsPosted: overview?.jobs?.total || 0,
    activeJobs: overview?.jobs?.active || 0,
    closedJobs: overview?.jobs?.closed || 0,
    totalApplications: overview?.applications?.total || 0,
    pendingApplications: overview?.applications?.pending || 0,
    hiredApplications: overview?.applications?.hired || 0,
    totalScholarships: overview?.scholarships?.total || 0,
    activeScholarships: overview?.scholarships?.active || 0,
  };

  // Format recent applicants from API data
  const recentApplicants = recentActivity?.applications?.map((app: any) => ({
    name: `${app.user?.firstName || ''} ${app.user?.lastName || ''}`,
    job: app.jobTitle || 'Unknown Job',
    jobId: app.jobId,
    status: app.status,
    appliedAt: app.appliedAt
  })) || [];

  // Format recent scholarship applications from API data
  const recentScholarshipApplications = recentActivity?.scholarshipApplications?.map((app: any) => ({
    name: app.user?.firstName && app.user?.lastName ? `${app.user.firstName} ${app.user.lastName}` : (app.applicant || 'Unknown Applicant'),
    scholarship: app.scholarshipTitle || 'Unknown Scholarship',
    scholarshipId: app.scholarshipId,
    appliedAt: app.appliedAt
  })) || [];

  // Format real-time chart data from database API
  const jobPostingLastMonthData = {
    labels: charts?.monthlyJobPostings?.map((item: any) => item.monthLabel || item.month) || [],
    datasets: [
      {
        label: 'Jobs Posted',
        data: charts?.monthlyJobPostings?.map((item: any) => item.jobs) || [],
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderWidth: 2,
      },
    ],
  };

  const applicationTrendsData = {
    labels: charts?.applicationTrends?.map((item: any) => item.monthLabel || item.month) || [],
    datasets: [
      {
        label: 'Applications Received',
        data: charts?.applicationTrends?.map((item: any) => item.applications) || [],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const applicationStatusData = {
    labels: charts?.applicationStatusDistribution?.map((item: any) => 
      item.status.charAt(0).toUpperCase() + item.status.slice(1)
    ) || [],
    datasets: [
      {
        label: 'Applications by Status',
        data: charts?.applicationStatusDistribution?.map((item: any) => item.count) || [],
        backgroundColor: [
          '#28a745', // hired - green
          '#ffc107', // pending - yellow  
          '#17a2b8', // shortlisted - blue
          '#dc3545', // rejected - red
          '#6f42c1'  // reviewed - purple
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Log chart data for debugging
  console.log('📊 Live chart data:', {
    jobPostings: jobPostingLastMonthData.datasets[0].data,
    applications: applicationTrendsData.datasets[0].data,
    statusDistribution: applicationStatusData.datasets[0].data
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#007bff',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          font: {
            size: 11
          }
        }
      }
    },
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        display: false
      }
    }
  };

  return (
    <ContentWrapper>
      <PageContainer>
        <ResponsiveWrapper>
          <Title>Employer Dashboard</Title>
          <OverviewGrid>
            <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/employer/jobs')}>
              <Stat>{stats.jobsPosted}</Stat>
              <StatLabel>Jobs Posted</StatLabel>
            </OverviewCard>
            <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/employer/jobs?filter=active')}>
              <Stat>{stats.activeJobs}</Stat>
              <StatLabel>Active Jobs</StatLabel>
            </OverviewCard>
            <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/employer/jobs?filter=closed')}>
              <Stat>{stats.closedJobs}</Stat>
              <StatLabel>Closed Jobs</StatLabel>
            </OverviewCard>
            <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/employer/scholarships')}>
              <Stat>{stats.totalScholarships}</Stat>
              <StatLabel>Scholarship Opportunities</StatLabel>
            </OverviewCard>
          </OverviewGrid>

          <SectionTitle>Applications Analytics</SectionTitle>
          <DashboardGrid>
            <Card>
              <CardTitle>Job Posting Activity (Last 6 Months)</CardTitle>
              <ChartContainer>
                <Bar data={jobPostingLastMonthData} options={barChartOptions} />
              </ChartContainer>
            </Card>
            <Card>
              <CardTitle>Application Trends (Last 6 Months)</CardTitle>
              <ChartContainer>
                <Line data={applicationTrendsData} options={chartOptions} />
              </ChartContainer>
            </Card>
            <Card>
              <CardTitle>Application Status Distribution</CardTitle>
              <ChartContainer>
                <Bar data={applicationStatusData} options={barChartOptions} />
              </ChartContainer>
            </Card>
          </DashboardGrid>

          <SectionTitle>Quick Actions</SectionTitle>
          <QuickActionLink to="/employer/post-jobs">Post New Job</QuickActionLink>
          <QuickActionLink to="/employer/applicants">View Applicants</QuickActionLink>
          <QuickActionLink to="/employer/post-scholarship">Post Scholarship</QuickActionLink>

          <SectionContainer>
            <SectionHeader>
              <SectionTitle>Recent Applicants</SectionTitle>
              <ViewAllLink onClick={() => navigate('/employer/applicants')}>
                View All Applications →
              </ViewAllLink>
            </SectionHeader>
            
            {recentApplicants.length > 0 ? (
              <ItemsGrid>
                {recentApplicants.slice(0, 6).map((app, idx) => (
                  <ItemCard key={idx}>
                    <ItemHeader>
                      <UserInfo>
                        <Avatar>
                          {app.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                        <UserDetails>
                          <UserName>{app.name}</UserName>
                          <UserMeta>Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}</UserMeta>
                        </UserDetails>
                      </UserInfo>
                      <StatusBadge status={app.status}>{app.status}</StatusBadge>
                    </ItemHeader>
                    
                    <ItemContent>
                      <JobTitle>{app.job}</JobTitle>
                      <DateInfo>
                        📅 {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recent'}
                      </DateInfo>
                    </ItemContent>
                    
                    <ItemActions>
                      <ActionButton primary onClick={() => navigate(`/employer/applicants?jobId=${app.jobId}`)}>Review Application</ActionButton>
                    </ItemActions>
                  </ItemCard>
                ))}
              </ItemsGrid>
            ) : (
              <EmptyState>
                <div className="icon">👥</div>
                <div className="title">No Recent Applicants</div>
                <div className="subtitle">Applications will appear here once candidates start applying to your jobs</div>
                <EmptyStateButton onClick={() => navigate('/employer/post-jobs')}>
                  Post Your First Job
                </EmptyStateButton>
              </EmptyState>
            )}
          </SectionContainer>

          {topJobs && topJobs.length > 0 && (
            <SectionContainer>
              <SectionHeader>
                <SectionTitle>Top Performing Jobs</SectionTitle>
                <ViewAllLink onClick={() => navigate('/employer/jobs')}>
                  View All Jobs →
                </ViewAllLink>
              </SectionHeader>
              
              <ItemsGrid>
                {topJobs.slice(0, 6).map((job, idx) => {
                  // Use success rate from database (hired + shortlisted / total applications)
                  const successRate = job.successRate || 0;
                  const processingRate = job.processingRate || 0;
                  
                  // Use success rate as the main performance metric
                  const performancePercentage = successRate;
                  
                  console.log(`📊 Job "${job.title}": ${job.applicationCount} applications, Success Rate: ${successRate}%, Processing Rate: ${processingRate}%`);
                  
                  return (
                    <StatsCard key={idx}>
                      <JobTitle style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        {job.title}
                      </JobTitle>
                      <StatNumber>{job.applicationCount}</StatNumber>
                      <StatDescription>Applications Received</StatDescription>
                      
                      {/* Success Rate */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                        <span>Success Rate</span>
                        <span>{successRate}%</span>
                      </div>
                      
                      <PerformanceBar>
                        <PerformanceProgress style={{ width: `${Math.max(performancePercentage, 5)}%` }} />
                      </PerformanceBar>
                      
                      {/* Application Status Breakdown */}
                      <div style={{ fontSize: '0.7rem', color: '#666', textAlign: 'center', marginTop: '0.5rem', lineHeight: '1.3' }}>
                        {job.hiredCount > 0 && <div>✅ Hired: {job.hiredCount}</div>}
                        {job.shortlistedCount > 0 && <div>⭐ Shortlisted: {job.shortlistedCount}</div>}
                        {job.pendingCount > 0 && <div>⏳ Pending: {job.pendingCount}</div>}
                        {job.rejectedCount > 0 && <div>❌ Rejected: {job.rejectedCount}</div>}
                        {job.applicationCount === 0 && <div style={{color: '#999'}}>No applications yet</div>}
                      </div>
                      
                      <ItemActions style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
                        <ActionButton primary onClick={() => navigate('/employer/jobs')}>View Details</ActionButton>
                      </ItemActions>
                    </StatsCard>
                  );
                })}
              </ItemsGrid>
            </SectionContainer>
          )}

          <SectionContainer>
            <SectionHeader>
              <SectionTitle>Recent Scholarship Applications</SectionTitle>
              <ViewAllLink onClick={() => navigate('/employer/scholarships')}>
                View All Scholarships →
              </ViewAllLink>
            </SectionHeader>
            
            {recentScholarshipApplications.length > 0 ? (
              <ItemsGrid>
                {recentScholarshipApplications.slice(0, 6).map((app, idx) => (
                  <ItemCard key={idx}>
                    <ItemHeader>
                      <UserInfo>
                        <Avatar style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}>
                          {app.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                        <UserDetails>
                          <UserName>{app.name}</UserName>
                          <UserMeta>Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}</UserMeta>
                        </UserDetails>
                      </UserInfo>
                      <StatusBadge status="pending">New</StatusBadge>
                    </ItemHeader>
                    
                    <ItemContent>
                      <JobTitle style={{ color: '#6c5ce7' }}>🎓 {app.scholarship}</JobTitle>
                      <DateInfo>
                        📅 {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recent'}
                      </DateInfo>
                    </ItemContent>
                    
                    <ItemActions>
                      <ActionButton primary onClick={() => navigate(`/employer/applicants?scholarshipId=${app.scholarshipId}`)}>Review Application</ActionButton>
                    </ItemActions>
                  </ItemCard>
                ))}
              </ItemsGrid>
            ) : (
              <EmptyState>
                <div className="icon">🎓</div>
                <div className="title">No Recent Scholarship Applications</div>
                <div className="subtitle">Scholarship applications will appear here once students start applying</div>
                <EmptyStateButton onClick={() => navigate('/employer/post-scholarship')}>
                  Post Your First Scholarship
                </EmptyStateButton>
              </EmptyState>
            )}
          </SectionContainer>


        </ResponsiveWrapper>
      </PageContainer>
    </ContentWrapper>
  );
};

export default EmployerDashboard; 