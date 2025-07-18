import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import offlineIntegrationService from '../../services/offlineIntegrationService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  ArcElement
);

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

// const OverviewGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
//   gap: 1.5rem;
//   margin-bottom: 2rem;
// `;

// const OverviewCard = styled.div`
//   background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
//   color: #fff;
//   border-radius: 12px;
//   padding: 1.5rem;
//   box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
// `;

// const Stat = styled.div`
//   font-size: 2.2rem;
//   font-weight: bold;
//   margin-bottom: 0.5rem;
// `;

// const StatLabel = styled.div`
//   font-size: 1rem;
//   opacity: 0.9;
// `;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AnalyticsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ChartContainer = styled.div`
  margin-top: 1rem;
  height: 250px;
`;

const SectionTitle = styled.h2`
  color: #555;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 0.8rem;
    border-bottom: 1px solid #eee;
    text-align: left;
  }
  th {
    background: #f8f9fa;
    color: #666;
    font-weight: 600;
  }
  tr:hover {
    background: #f0f0f0;
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

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError('');
      
      const isOnline = navigator.onLine;
      let analyticsData = null;
      let statisticsData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching admin analytics from API...');
          
          // Fetch analytics data
          const analyticsRes = await fetch('/api/admin/analytics', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          const analyticsResult = await analyticsRes.json();

          // Fetch statistics data
          const statisticsRes = await fetch('/api/admin/statistics', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          const statisticsResult = await statisticsRes.json();

          if (analyticsResult.success && statisticsResult.success) {
            analyticsData = analyticsResult.data;
            statisticsData = statisticsResult.data;
            
            // Store data for offline use
            await offlineIntegrationService.storeAdminAnalytics(analyticsData);
            await offlineIntegrationService.storeAdminStatistics(statisticsData);
            console.log('✅ Admin analytics data stored for offline use');
          } else {
            throw new Error('Failed to fetch analytics data');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          
          // Fall back to offline data if online fails
          analyticsData = await offlineIntegrationService.getAdminAnalytics();
          statisticsData = await offlineIntegrationService.getAdminStatistics();
          
          if (!analyticsData || !statisticsData) {
            throw onlineError;
          }
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline admin analytics data...');
        analyticsData = await offlineIntegrationService.getAdminAnalytics();
        statisticsData = await offlineIntegrationService.getAdminStatistics();
      }

      try {
        setAnalyticsData(analyticsData);
        setStatisticsData(statisticsData);
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <Container>
        <Title>Platform Analytics</Title>
        <LoadingSpinner>Loading analytics data...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Platform Analytics</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container>
        <Title>Platform Analytics</Title>
        <ErrorMessage>No analytics data available</ErrorMessage>
      </Container>
    );
  }

  // Format data from API response
  const { recentActivity, users, courses, jobs, assessments, certificates, help, scholarships } = analyticsData;

  // Create user registration data from statistics (REAL DATA)
  const usersData = {
    labels: statisticsData?.dailyRegistrations?.map((reg, index) => `Day ${index + 1}`) || [],
    datasets: [
      {
        label: 'New Users',
        data: statisticsData?.dailyRegistrations?.map(reg => reg.count) || [],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Create activity data from statistics (REAL DATA, ALL ACTIVITIES)
  const activityData = {
    labels: statisticsData?.dailyPlatformActivity?.map(act => act.date) || [],
    datasets: [
      {
        label: 'Registrations',
        data: statisticsData?.dailyPlatformActivity?.map(act => act.registrations) || [],
        backgroundColor: '#007bff',
      },
      {
        label: 'Logins',
        data: statisticsData?.dailyPlatformActivity?.map(act => act.logins) || [],
        backgroundColor: '#222',
      },
      {
        label: 'Completions',
        data: statisticsData?.dailyPlatformActivity?.map(act => act.completions) || [],
        backgroundColor: '#0056b3',
      },
      {
        label: 'Applications',
        data: statisticsData?.dailyPlatformActivity?.map(act => act.applications) || [],
        backgroundColor: '#333',
      },
      {
        label: 'Tickets',
        data: statisticsData?.dailyPlatformActivity?.map(act => act.tickets) || [],
        backgroundColor: '#666',
      },
      {
        label: 'Assessments',
        data: statisticsData?.dailyPlatformActivity?.map(act => act.assessments) || [],
        backgroundColor: '#b3c6ff',
      },
      {
        label: 'Total',
        data: statisticsData?.dailyPlatformActivity?.map(act => act.total) || [],
        backgroundColor: '#6c757d',
      },
    ],
  };

  // Create course completion data from backend if available (REAL DATA)
  const courseCompletionData = analyticsData.courses?.completionRates
    ? {
        labels: analyticsData.courses.completionRates.map(c => c.name),
        datasets: [
          {
            label: 'Completion Rate (%)',
            data: analyticsData.courses.completionRates.map(c => c.rate),
            backgroundColor: '#007bff',
          },
        ],
      }
    : {
        labels: [],
        datasets: [
          {
            label: 'Completion Rate (%)',
            data: [],
            backgroundColor: '#007bff',
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
        text: 'Default Chart Title',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Format recent registrations from API data
  const recentRegistrations = recentActivity?.users?.map((user, index) => {
    let date = '-';
    if (user.createdAt) {
      const d = new Date(user.createdAt);
      if (!isNaN(d.getTime())) {
        date = d.toISOString().split('T')[0];
      }
    }
    return {
      id: index + 1,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      date
    };
  }) || [];

  return (
    <Container>
      <Title>Platform Analytics</Title>

      <AnalyticsGrid>
        <AnalyticsCard>
          <ChartContainer>
            <Line data={usersData} options={{ 
              ...chartOptions, 
              plugins: { 
                ...chartOptions.plugins, 
                title: { display: true, text: 'New User Registrations' } 
              }
            }} />
          </ChartContainer>
        </AnalyticsCard>

        <AnalyticsCard>
          <ChartContainer>
            <Bar data={activityData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Daily Platform Activity' }
              }
            }} />
          </ChartContainer>
        </AnalyticsCard>

        <AnalyticsCard>
          <ChartContainer>
            <Bar data={courseCompletionData} options={{
              ...chartOptions,
              indexAxis: 'y',
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Course Completion Rates' }
              }
            }} />
          </ChartContainer>
        </AnalyticsCard>
      </AnalyticsGrid>

      <SectionTitle>Recent Activity</SectionTitle>
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData?.recentActivity?.all?.length > 0 ? (
              analyticsData.recentActivity.all.map((activity, idx) => {
                let timeString = '-';
                if (activity.time) {
                  const d = new Date(activity.time);
                  if (!isNaN(d.getTime())) {
                    timeString = d.toLocaleString();
                  }
                }
                return (
                  <tr key={idx}>
                    <td>{timeString}</td>
                    <td>{activity.event}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="2">No recent activity</td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default Analytics; 