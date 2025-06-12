import React from 'react';
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

const AdminDashboard = () => {
  // Example stats (replace with real data fetching in a real app)
  const stats = {
    users: 1200,
    activeUsers: 340,
    courses: 45,
    jobs: 18,
  };

  const recentActivity = [
    'User John Doe registered',
    'Course "Digital Skills" published',
    'Employer posted a new job',
    'Assessment "English Test" created',
    'Mentor session scheduled',
  ];

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
    <Container>
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
        {recentActivity.map((item, idx) => (
          <RecentItem key={idx}>{item}</RecentItem>
        ))}
      </RecentList>
    </Container>
  );
};

export default AdminDashboard; 