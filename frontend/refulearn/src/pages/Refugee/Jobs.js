import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0.3rem 0 0.7rem 0;
`;

const Badge = styled.span`
  display: inline-block;
  background: ${({ color }) => color || '#e3e8f0'};
  color: ${({ $textcolor }) => $textcolor || '#333'};
  border-radius: 12px;
  padding: 0.2rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 500;
  margin-right: 0.5rem;
`;

const Card = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.3rem 1.1rem;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100%;
  word-break: break-word;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1px solid #e3e8f0;
  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    transform: translateY(-2px) scale(1.01);
    border-color: #b3c6e0;
  }
`;

const CardTitle = styled.div`
  font-weight: bold;
  font-size: 1.15rem;
  margin-bottom: 0.2rem;
`;

const CardMeta = styled.div`
  color: #555;
  font-size: 1rem;
  margin-bottom: 0.2rem;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ViewMoreButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
`;

const ApplyButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: #fff;
  padding: 2rem 1rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const jobs = [
  { title: 'Frontend Developer', company: 'TechOrg', location: 'Remote', daysRemaining: 7, link: 'https://example.com/job/frontend', description: 'Work on building user interfaces for web applications.', offer: 'Remote work, competitive salary, growth opportunities.' },
  { title: 'Backend Developer', company: 'CodeInc', location: 'Nairobi, Kenya', daysRemaining: 5, link: 'https://example.com/job/backend', description: 'Develop and maintain server-side logic and APIs.', offer: 'Health insurance, flexible hours, team environment.' },
  { title: 'Data Analyst', company: 'DataCorp', location: 'Kigali, Rwanda', daysRemaining: 10, link: 'https://example.com/job/data', description: 'Analyze data to help drive business decisions.', offer: 'Training, mentorship, and a dynamic team.' },
  { title: 'UI/UX Designer', company: 'Designify', location: 'Remote', daysRemaining: 3, link: 'https://example.com/job/uiux', description: 'Design user experiences and interfaces for digital products.', offer: 'Creative environment, remote work, project bonuses.' },
  { title: 'Project Manager', company: 'ManageIt', location: 'Addis Ababa, Ethiopia', daysRemaining: 12, link: 'https://example.com/job/pm', description: 'Lead project teams to deliver results on time.', offer: 'Leadership training, travel opportunities, bonuses.' },
];

const scholarships = {
  tertiary: [
    { title: 'Tech for Refugees Scholarship', provider: 'TechOrg', location: 'Online', daysRemaining: 14, link: 'https://example.com/tech-scholarship', description: 'Scholarship for refugees interested in technology.', offer: 'Full tuition, mentorship, online resources.' },
    { title: 'Global Education Fund', provider: 'GlobalEd', location: 'Online', daysRemaining: 20, link: 'https://example.com/global-ed', description: 'Support for refugees pursuing higher education.', offer: 'Partial tuition, networking, online support.' },
  ],
  masters: [
    { title: 'Women in STEM Grant', provider: 'STEM Foundation', location: 'Online', daysRemaining: 18, link: 'https://example.com/women-stem', description: 'Grant for women refugees in STEM fields.', offer: 'Grant funding, mentorship, online workshops.' },
    { title: 'International Masters Scholarship', provider: 'EduWorld', location: 'UK', daysRemaining: 25, link: 'https://example.com/masters', description: 'Scholarship for international master\'s students.', offer: 'Full tuition, living stipend, travel support.' },
  ],
  fellowships: [
    { title: 'Young Leaders Fellowship', provider: 'LeadersOrg', location: 'USA', daysRemaining: 30, link: 'https://example.com/young-leaders', description: 'Fellowship for young leaders making a difference.', offer: 'Leadership training, networking, travel.' },
    { title: 'Global Health Fellowship', provider: 'HealthOrg', location: 'Online', daysRemaining: 15, link: 'https://example.com/health-fellowship', description: 'Fellowship for those interested in global health.', offer: 'Mentorship, online courses, project funding.' },
  ],
  other: [
    { title: 'Open Opportunity Scholarship', provider: 'OpenEd', location: 'Online', daysRemaining: 40, link: 'https://example.com/open-opportunity', description: 'Open scholarship for refugees in any field.', offer: 'Flexible funding, online resources, community support.' },
  ],
};

const Jobs = () => {
  const [search, setSearch] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [filteredTertiary, setFilteredTertiary] = useState(scholarships.tertiary);
  const [filteredMasters, setFilteredMasters] = useState(scholarships.masters);
  const [filteredFellowships, setFilteredFellowships] = useState(scholarships.fellowships);
  const [filteredOther, setFilteredOther] = useState(scholarships.other);

  const [viewJob, setViewJob] = useState(null);
  const [viewScholarship, setViewScholarship] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

    if (searchTerm.trim() === '') {
      setFilteredJobs(jobs);
      setFilteredTertiary(scholarships.tertiary);
      setFilteredMasters(scholarships.masters);
      setFilteredFellowships(scholarships.fellowships);
      setFilteredOther(scholarships.other);
    } else {
      setFilteredJobs(jobs.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.company.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm)
      ));
      setFilteredTertiary(scholarships.tertiary.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.provider.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm)
      ));
      setFilteredMasters(scholarships.masters.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.provider.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm)
      ));
      setFilteredFellowships(scholarships.fellowships.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.provider.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm)
      ));
      setFilteredOther(scholarships.other.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.provider.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm)
      ));
    }
  };

  const renderDetails = (item, isJob = true) => (
    <Card>
      <CardTitle>{item.title}</CardTitle>
      <CardMeta>{isJob ? `Company: ${item.company}` : `School/Organization: ${item.provider}`}</CardMeta>
      <CardRow>
        <Badge color="#fff3e0" textcolor="#e65100">{isJob ? `Location: ${item.location}` : `Location: ${item.location}`}</Badge>
        <Badge color="#fff3e0" textcolor="#e65100">Ends in: {isJob ? item.daysRemaining : item.daysRemaining}</Badge>
      </CardRow>
      {isJob ? (
        <CardActions>
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <ApplyButton as="span">Apply</ApplyButton>
          </a>
          <ViewMoreButton onClick={() => (isJob ? setViewJob(null) : setViewScholarship(null))}>Close</ViewMoreButton>
        </CardActions>
      ) : (
        <CardActions>
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <ApplyButton as="span">Apply</ApplyButton>
          </a>
          <ViewMoreButton onClick={() => setViewScholarship(null)}>Close</ViewMoreButton>
        </CardActions>
      )}
    </Card>
  );

  return (
    <Container>
      <Title>Apply for Jobs</Title>
      <SearchBar
        type="text"
        placeholder="Search for jobs, scholarships, or opportunities..."
        value={search}
        onChange={handleSearch}
      />
      {viewJob && renderDetails(viewJob, true)}
      {viewScholarship && renderDetails(viewScholarship, false)}
      {!viewJob && !viewScholarship && (
        <GridContainer>
          <Section>
            <SectionTitle>Job Listings</SectionTitle>
            {filteredJobs.map((job, idx) => (
              <Card key={idx}>
                <CardTitle>{job.title}</CardTitle>
                <CardMeta>Company: {job.company}</CardMeta>
                <CardRow>
                  <Badge color="#fff3e0" textcolor="#e65100">{job.location}</Badge>
                  <Badge color="#fff3e0" textcolor="#e65100">Ends in: {job.daysRemaining}</Badge>
                </CardRow>
                <CardActions>
                  <ViewMoreButton onClick={() => navigate('/jobs/detail', { state: job })}>View More</ViewMoreButton>
                </CardActions>
              </Card>
            ))}
          </Section>

          <Section>
            <SectionTitle>Scholarship Opportunities</SectionTitle>
            <h3>Tertiary Education</h3>
            {filteredTertiary.map((sch, idx) => (
              <Card key={sch.title + idx}>
                <CardTitle>{sch.title}</CardTitle>
                <CardMeta>School/Organization: {sch.provider}</CardMeta>
                <CardRow>
                  <Badge color="#fff3e0" textcolor="#e65100">{sch.location}</Badge>
                  <Badge color="#fff3e0" textcolor="#e65100">Ends in: {sch.daysRemaining}</Badge>
                </CardRow>
                <CardActions>
                  <ViewMoreButton onClick={() => navigate('/jobs/detail', { state: sch })}>View More</ViewMoreButton>
                </CardActions>
              </Card>
            ))}
            
            <h3>Masters Degree</h3>
            {filteredMasters.map((sch, idx) => (
              <Card key={sch.title + idx}>
                <CardTitle>{sch.title}</CardTitle>
                <CardMeta>School/Organization: {sch.provider}</CardMeta>
                <CardRow>
                  <Badge color="#fff3e0" textcolor="#e65100">{sch.location}</Badge>
                  <Badge color="#fff3e0" textcolor="#e65100">Ends in: {sch.daysRemaining}</Badge>
                </CardRow>
                <CardActions>
                  <ViewMoreButton onClick={() => navigate('/jobs/detail', { state: sch })}>View More</ViewMoreButton>
                </CardActions>
              </Card>
            ))}
          </Section>

          <Section>
            <SectionTitle>Other Opportunities</SectionTitle>
            <h3>Fellowships</h3>
            {filteredFellowships.map((sch, idx) => (
              <Card key={sch.title + idx}>
                <CardTitle>{sch.title}</CardTitle>
                <CardMeta>School/Organization: {sch.provider}</CardMeta>
                <CardRow>
                  <Badge color="#fff3e0" textcolor="#e65100">{sch.location}</Badge>
                  <Badge color="#fff3e0" textcolor="#e65100">Ends in: {sch.daysRemaining}</Badge>
                </CardRow>
                <CardActions>
                  <ViewMoreButton onClick={() => navigate('/jobs/detail', { state: sch })}>View More</ViewMoreButton>
                </CardActions>
              </Card>
            ))}
            
            <h3>Other</h3>
            {filteredOther.map((sch, idx) => (
              <Card key={sch.title + idx}>
                <CardTitle>{sch.title}</CardTitle>
                <CardMeta>School/Organization: {sch.provider}</CardMeta>
                <CardRow>
                  <Badge color="#fff3e0" textcolor="#e65100">{sch.location}</Badge>
                  <Badge color="#fff3e0" textcolor="#e65100">Ends in: {sch.daysRemaining}</Badge>
                </CardRow>
                <CardActions>
                  <ViewMoreButton onClick={() => navigate('/jobs/detail', { state: sch })}>View More</ViewMoreButton>
                </CardActions>
              </Card>
            ))}
          </Section>
        </GridContainer>
      )}
    </Container>
  );
};

export default Jobs; 