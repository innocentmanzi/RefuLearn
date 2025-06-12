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
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

const EmployerDashboard = () => {
  // Example stats (replace with real data fetching in a real app)
  const stats = {
    jobsPosted: 8,
    activeJobs: 3,
    applicants: 27,
  };

  const recentApplicants = [
    { name: 'Alice Johnson', job: 'Frontend Developer' },
    { name: 'Bob Smith', job: 'Data Analyst' },
    { name: 'Carlos Lee', job: 'Project Manager' },
    { name: 'Dina Patel', job: 'UI/UX Designer' },
  ];

  const applicationTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications Received',
        data: [15, 20, 18, 25, 22, 30],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const jobPostingActivityData = {
    labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'],
    datasets: [
      {
        label: 'Jobs Posted',
        data: [5, 8, 7, 10],
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
        text: 'Default Chart Title',
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
      <Title>Employer Dashboard</Title>
      <OverviewGrid>
        <OverviewCard>
          <Stat>{stats.jobsPosted}</Stat>
          <StatLabel>Jobs Posted</StatLabel>
        </OverviewCard>
        <OverviewCard>
          <Stat>{stats.activeJobs}</Stat>
          <StatLabel>Active Jobs</StatLabel>
        </OverviewCard>
        <OverviewCard>
          <Stat>{stats.applicants}</Stat>
          <StatLabel>Total Applicants</StatLabel>
        </OverviewCard>
      </OverviewGrid>

      <SectionTitle>Applications Analytics</SectionTitle>
      <DashboardGrid>
        <Card>
          <CardTitle>Application Trends</CardTitle>
          <ChartContainer>
            <Line data={applicationTrendsData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Application Trends' }
              }
            }} />
          </ChartContainer>
        </Card>
        <Card>
          <CardTitle>Job Posting Activity</CardTitle>
          <ChartContainer>
            <Bar data={jobPostingActivityData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Job Posting Activity' }
              }
            }} />
          </ChartContainer>
        </Card>
      </DashboardGrid>

      <SectionTitle>Quick Actions</SectionTitle>
      <QuickActionLink to="/post-jobs">Post New Job</QuickActionLink>
      <QuickActionLink to="/applicants">View Applicants</QuickActionLink>

      <SectionTitle>Recent Applicants</SectionTitle>
      <ApplicantList>
        {recentApplicants.map((app, idx) => (
          <ApplicantItem key={idx}>
            <span>{app.name}</span>
            <span style={{ color: '#888', fontSize: '0.95rem' }}>{app.job}</span>
          </ApplicantItem>
        ))}
      </ApplicantList>
    </Container>
  );
};

export default EmployerDashboard; 