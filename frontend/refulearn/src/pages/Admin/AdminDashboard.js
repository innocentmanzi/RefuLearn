import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line, Bar } from 'react-chartjs-2';
import { NavLink } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';
import PageContainer from '../../components/PageContainer';
import ContentWrapper from '../../components/ContentWrapper';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

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
  background: #007bff; /* solid blue */
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
  color: #fff;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  color: #fff;
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

const ChartContainer = styled.div`
  margin-top: 1rem;
  height: 200px;
`;

const RecentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecentItem = styled.li`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
`;

const QuickActionLink = styled(NavLink)`
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
  text-decoration: none;
  display: inline-block;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
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

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivityData, setRecentActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setDashboardData(data.data);
        } else {
          setError(data.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchActivityData = async () => {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        const data = await res.json();
        if (data.success && data.data?.recentActivity?.all) {
          setRecentActivityData(data.data.recentActivity.all);
        } else {
          setRecentActivityData([]);
        }
      } catch (err) {
        setRecentActivityData([]);
      }
    };

    fetchDashboardData();
    fetchActivityData();
    // Optionally, poll for real-time updates every 30 seconds
    const interval = setInterval(fetchActivityData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>Admin Dashboard</Title>
          <LoadingSpinner>Loading dashboard data...</LoadingSpinner>
        </PageContainer>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>Admin Dashboard</Title>
          <ErrorMessage>{error}</ErrorMessage>
        </PageContainer>
      </ContentWrapper>
    );
  }

  if (!dashboardData) {
    return (
      <ContentWrapper>
        <PageContainer>
          <Title>Admin Dashboard</Title>
          <ErrorMessage>No data available</ErrorMessage>
        </PageContainer>
      </ContentWrapper>
    );
  }

  // Extract data from API response
  const { overview, recentActivity, monthlyUserGrowth, platformActivity } = dashboardData;

  const stats = {
    users: overview?.users?.total || 0,
    activeUsers: overview?.users?.active || 0,
    courses: overview?.courses?.total || 0,
    jobs: overview?.jobs?.total || 0,
  };

  // Format recent activity
  const formattedRecentActivity = [];
  if (recentActivity?.users) {
    recentActivity.users.forEach(user => {
      formattedRecentActivity.push(`User ${user.firstName} ${user.lastName} registered`);
    });
  }
  if (recentActivity?.courses) {
    recentActivity.courses.forEach(course => {
      formattedRecentActivity.push(`Course "${course.title}" published`);
    });
  }
  if (recentActivity?.jobs) {
    recentActivity.jobs.forEach(job => {
      formattedRecentActivity.push(`Job "${job.title}" posted by ${job.company}`);
    });
  }

  // Format chart data
  const usersData = {
    labels: monthlyUserGrowth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'New Users',
        data: monthlyUserGrowth?.map(item => item.users) || [],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const activityData = {
    labels: platformActivity?.map(item => item.day) || [],
    datasets: [
      {
        label: 'Platform Activity',
        data: platformActivity?.map(item => item.activity) || [],
        backgroundColor: '#28a745',
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
      title: {
        display: true,
        text: 'Chart Title',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <ContentWrapper>
      <PageContainer>
        <Title>Admin Dashboard</Title>
        <OverviewGrid>
          <OverviewCard>
            <Stat>{stats.users}</Stat>
            <StatLabel>Total Users</StatLabel>
          </OverviewCard>
          <OverviewCard>
            <Stat>{stats.activeUsers}</Stat>
            <StatLabel>Active Users</StatLabel>
          </OverviewCard>
          <OverviewCard>
            <Stat>{stats.courses}</Stat>
            <StatLabel>Courses</StatLabel>
          </OverviewCard>
          <OverviewCard>
            <Stat>{stats.jobs}</Stat>
            <StatLabel>Jobs Posted</StatLabel>
          </OverviewCard>
        </OverviewGrid>

        <SectionTitle>Platform Analytics</SectionTitle>
        <DashboardGrid>
          <Card>
            <CardTitle>New User Registrations</CardTitle>
            <ChartContainer>
              <Line data={usersData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </ChartContainer>
          </Card>
          <Card>
            <CardTitle>Daily Platform Activity</CardTitle>
            <ChartContainer>
              <Bar data={activityData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </ChartContainer>
          </Card>
        </DashboardGrid>

        <SectionTitle>Quick Actions</SectionTitle>
        <QuickActionLink to="/analytics">View Analytics</QuickActionLink>
        <QuickActionLink to="/manage-users">Manage Users</QuickActionLink>

        <SectionTitle>Recent Activity</SectionTitle>
        <RecentList>
          {recentActivityData.length > 0 ? (
            recentActivityData.map((activity, idx) => {
              let timeString = '-';
              if (activity.time) {
                const d = new Date(activity.time);
                if (!isNaN(d.getTime())) {
                  timeString = d.toLocaleString();
                }
              }
              return (
                <RecentItem key={idx}>
                  <strong>{timeString}:</strong> {activity.event}
                </RecentItem>
              );
            })
          ) : (
            <RecentItem>No recent activity</RecentItem>
          )}
        </RecentList>
      </PageContainer>
    </ContentWrapper>
  );
};

export default AdminDashboard; 