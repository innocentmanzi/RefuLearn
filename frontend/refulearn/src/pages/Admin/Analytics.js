import React from 'react';
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

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
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

const Analytics = () => {
  const usersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [50, 65, 80, 70, 90, 110],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const activityData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Platform Activity',
        data: [120, 150, 130, 160, 140, 90, 70],
        backgroundColor: '#28a745',
      },
    ],
  };

  const courseCompletionData = {
    labels: ['Web Dev', 'Mobile Dev', 'Data Science', 'UI/UX'],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: [85, 70, 75, 60],
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545'],
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

  const recentRegistrations = [
    { id: 1, name: 'Aisha Khan', role: 'Refugee', date: '2025-06-01' },
    { id: 2, name: 'David Lee', role: 'Mentor', date: '2025-05-28' },
    { id: 3, name: 'Maria Garcia', role: 'Instructor', date: '2025-05-25' },
    { id: 4, name: 'Omar Hassan', role: 'Employer', date: '2025-05-20' },
  ];

  const analyticsStats = {
    totalUsers: 1250,
    activeCourses: 50,
    completedCourses: 38,
    totalSessions: 230,
  };

  return (
    <Container>
      <Title>Platform Analytics</Title>

      <OverviewGrid>
        <OverviewCard>
          <Stat>{analyticsStats.totalUsers}</Stat>
          <StatLabel>Total Users</StatLabel>
        </OverviewCard>
        <OverviewCard>
          <Stat>{analyticsStats.activeCourses}</Stat>
          <StatLabel>Active Courses</StatLabel>
        </OverviewCard>
        <OverviewCard>
          <Stat>{analyticsStats.completedCourses}</Stat>
          <StatLabel>Completed Courses</StatLabel>
        </OverviewCard>
        <OverviewCard>
          <Stat>{analyticsStats.totalSessions}</Stat>
          <StatLabel>Total Sessions</StatLabel>
        </OverviewCard>
      </OverviewGrid>

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

      <SectionTitle>Recent Registrations</SectionTitle>
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentRegistrations.map(reg => (
              <tr key={reg.id}>
                <td>{reg.id}</td>
                <td>{reg.name}</td>
                <td>{reg.role}</td>
                <td>{reg.date}</td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default Analytics; 