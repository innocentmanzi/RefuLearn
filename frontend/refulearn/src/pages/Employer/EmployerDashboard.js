import React from 'react';
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
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
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
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
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
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
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
  const navigate = useNavigate();
  // Example stats (replace with real data fetching in a real app)
  const stats = {
    jobsPosted: 8,
    activeJobs: 3,
    closedJobs: 5, // Example value
  };

  // Example scholarships (replace with backend data)
  const scholarships = [
    { title: 'Tech for Refugees Scholarship', provider: 'TechOrg', location: 'Online', daysRemaining: 14, link: 'https://example.com/tech-scholarship', description: 'Scholarship for refugees interested in technology.' },
    { title: 'Global Education Fund', provider: 'GlobalEd', location: 'Online', daysRemaining: 20, link: 'https://example.com/global-ed', description: 'Support for refugees pursuing higher education.' },
  ];

  // Example recent applicants (replace with backend data)
  const recentApplicants = [
    { name: 'Alice Johnson', job: 'Frontend Developer' },
    { name: 'Bob Smith', job: 'Data Analyst' },
    { name: 'Carlos Lee', job: 'Project Manager' },
    { name: 'Dina Patel', job: 'UI/UX Designer' },
  ];

  // Example analytics for jobs posted in the last month
  const jobPostingLastMonthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Jobs Posted',
        data: [1, 0, 1, 1], // Example data
        backgroundColor: '#28a745',
      },
    ],
  };

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
    <ContentWrapper>
      <PageContainer>
        <Title>Employer Dashboard</Title>
        <OverviewGrid>
          <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/jobs?filter=lastMonth')}>
            <Stat>{stats.jobsPosted}</Stat>
            <StatLabel>Jobs Posted</StatLabel>
          </OverviewCard>
          <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/jobs?filter=active')}>
            <Stat>{stats.activeJobs}</Stat>
            <StatLabel>Active Jobs</StatLabel>
          </OverviewCard>
          <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/jobs?filter=closed')}>
            <Stat>{stats.closedJobs}</Stat>
            <StatLabel>Closed Jobs</StatLabel>
          </OverviewCard>
          <OverviewCard style={{ cursor: 'pointer' }} onClick={() => navigate('/scholarships')}>
            <Stat style={{ fontSize: '1.2rem', marginBottom: 8 }}>Scholarship Opportunities</Stat>
          </OverviewCard>
        </OverviewGrid>

        <SectionTitle>Applications Analytics</SectionTitle>
        <DashboardGrid>
          <Card>
            <CardTitle>Job Posting Activity (Last Month)</CardTitle>
            <ChartContainer>
              <Bar data={jobPostingLastMonthData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Jobs Posted (Last Month)' }
                },
                scales: { y: { beginAtZero: true } }
              }} />
            </ChartContainer>
          </Card>
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
      </PageContainer>
    </ContentWrapper>
  );
};

export default EmployerDashboard; 