import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { useUser } from '../../contexts/UserContext';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTitle, Tooltip, Legend);

const ContentWrapper = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 1.5rem;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const CardTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
`;

const ChartContainer = styled.div`
  height: 300px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`;

const QuickActionLink = styled(NavLink)`
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  margin-right: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
    color: white;
  }
`;

const ActivityList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  
  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);
      
  const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
    try {
      setLoading(true);
      setError('');
          
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token available');
          }
          
      const response = await fetch('/api/admin/dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache'
            }
          });
          
      console.log('🔍 Dashboard response status:', response.status);
      console.log('🔍 Dashboard response ok:', response.ok);
          
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard data received:', data);
        console.log('📊 Dashboard data.data:', data.data);
        setDashboardData(data.data);
      } else {
        const errorText = await response.text();
        console.error('❌ Dashboard response error:', errorText);
        throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts if no real data available
  const defaultUsersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const defaultActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Logins',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: '#007bff',
      },
      {
        label: 'Submissions',
        data: [28, 48, 40, 19, 86, 27, 90],
        backgroundColor: '#6c757d',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>{t('admin.dashboard')}</Title>
          <p>{t('loading')}</p>
        </PageContainer>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>{t('admin.dashboard')}</Title>
          <p style={{ color: 'red' }}>{error}</p>
        </PageContainer>
      </ContentWrapper>
    );
  }

  // Debug: Log the dashboard data structure
  console.log('🔍 Dashboard data structure:', dashboardData);
  console.log('🔍 Overview data:', dashboardData?.overview);
  console.log('🔍 Users data:', dashboardData?.overview?.users);
  console.log('🔍 Courses data:', dashboardData?.overview?.courses);
  console.log('🔍 Jobs data:', dashboardData?.overview?.jobs);

  const stats = {
    users: dashboardData?.overview?.users?.total || 0,
    activeUsers: dashboardData?.overview?.users?.active || 0,
    courses: dashboardData?.overview?.courses?.total || 0,
    jobs: dashboardData?.overview?.jobs?.total || 0,
  };

  console.log('📊 Calculated stats:', stats);

  // Use real data from backend
  const usersData = dashboardData?.monthlyUserGrowth?.length > 0 ? {
    labels: dashboardData.monthlyUserGrowth.map(item => item.month),
    datasets: [
      {
        label: t('admin.newUsers'),
        data: dashboardData.monthlyUserGrowth.map(item => item.users),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : defaultUsersData;

  const activityData = dashboardData?.platformActivity?.length > 0 ? {
    labels: dashboardData.platformActivity.map(item => {
      // Format date to be more readable
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: t('admin.dailyLogins'),
        data: dashboardData.platformActivity.map(item => item.logins),
        backgroundColor: '#007bff',
      },
      {
        label: t('admin.submissions'),
        data: dashboardData.platformActivity.map(item => item.submissions),
        backgroundColor: '#6c757d',
      },
    ],
  } : defaultActivityData;

  return (
    <ContentWrapper>
      <PageContainer>
        <Title>{t('admin.dashboard')}</Title>
        
        <OverviewGrid>
          <OverviewCard>
            <Stat>{stats.users}</Stat>
            <StatLabel>{t('admin.totalUsers')}</StatLabel>
          </OverviewCard>
          <OverviewCard>
            <Stat>{stats.activeUsers}</Stat>
            <StatLabel>{t('admin.activeUsers')}</StatLabel>
          </OverviewCard>
          <OverviewCard>
            <Stat>{stats.courses}</Stat>
            <StatLabel>{t('admin.totalCourses')}</StatLabel>
          </OverviewCard>
          <OverviewCard>
            <Stat>{stats.jobs}</Stat>
            <StatLabel>{t('admin.activeJobs', 'Active Jobs')}</StatLabel>
          </OverviewCard>
        </OverviewGrid>

        <SectionTitle>{t('admin.platformAnalytics')}</SectionTitle>
        <DashboardGrid>
          <Card>
            <CardTitle>{t('admin.userGrowth')}</CardTitle>
            <ChartContainer>
              <Line data={usersData} options={chartOptions} />
            </ChartContainer>
          </Card>
          <Card>
            <CardTitle>{t('admin.dailyActivity')}</CardTitle>
            <ChartContainer>
              <Bar data={activityData} options={chartOptions} />
            </ChartContainer>
          </Card>
        </DashboardGrid>

        <SectionTitle>{t('admin.quickActions')}</SectionTitle>
        <div>
          
        <QuickActionLink to="/admin/users">{t('admin.manageUsers')}</QuickActionLink>
          <QuickActionLink to="/admin/approvals">{t('admin.reviewApprovals')}</QuickActionLink>
          <QuickActionLink to="/admin/help">{t('admin.helpManagement')}</QuickActionLink>
        </div>

        <SectionTitle>{t('admin.recentActivity')}</SectionTitle>
        <Card>
          <ActivityList>
            {dashboardData?.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <ActivityItem key={index}>
                  <span>
                    {activity.icon} {activity.title}
                    <br />
                    <small style={{ color: '#666', fontWeight: 'normal' }}>
                      {activity.description}
                    </small>
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <small>{new Date(activity.timestamp).toLocaleDateString()}</small>
                    <br />
                    <small style={{ color: '#888' }}>
                      {new Date(activity.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </small>
                  </div>
                </ActivityItem>
              ))
            ) : (
              <ActivityItem>
                <span>{t('admin.noRecentActivity')}</span>
                <small>-</small>
              </ActivityItem>
            )}
          </ActivityList>
        </Card>
      </PageContainer>
    </ContentWrapper>
  );
};

export default AdminDashboard; 