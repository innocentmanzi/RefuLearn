import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;
const PostButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;
const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;
const JobCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.3rem 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid #e3e8f0;
`;
const ActionButton = styled.button`
  padding: 0.4rem 1.1rem;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  margin-right: 0.7rem;
  margin-top: 0.5rem;
  cursor: pointer;
  background: ${({ color }) => color || '#007bff'};
  color: #fff;
  transition: background 0.2s;
  &:hover {
    background: ${({ color }) => color ? color + 'cc' : '#0056b3'};
  }
`;
const LargeInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1.05rem;
`;
const LargeTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1.05rem;
  min-height: 90px;
  resize: vertical;
`;
const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;
const jobs = [
  { title: 'Frontend Developer', status: 'active', postedAt: '2025-06-10', company: 'TechOrg', location: 'Remote', daysRemaining: 7, link: 'https://example.com/frontend', requirements: 'React, CSS, JavaScript' },
  { title: 'Backend Developer', status: 'closed', postedAt: '2025-05-20', company: 'CodeInc', location: 'Nairobi, Kenya', daysRemaining: 0, link: 'https://example.com/backend', requirements: 'Node.js, Express, MongoDB' },
  { title: 'Data Analyst', status: 'active', postedAt: '2025-06-01', company: 'DataCorp', location: 'Kigali, Rwanda', daysRemaining: 10, link: 'https://example.com/data-analyst', requirements: 'Python, SQL, Excel' },
  { title: 'UI/UX Designer', status: 'closed', postedAt: '2025-05-15', company: 'Designify', location: 'Remote', daysRemaining: 0, link: 'https://example.com/uiux', requirements: 'Figma, Adobe XD' },
  { title: 'Project Manager', status: 'active', postedAt: '2025-06-12', company: 'ManageIt', location: 'Addis Ababa, Ethiopia', daysRemaining: 12, link: 'https://example.com/pm', requirements: 'Agile, Communication' },
];
function filterJobs(jobs, filter) {
  const now = new Date('2025-06-18');
  if (filter === 'active') return jobs.filter(j => j.status === 'active');
  if (filter === 'closed') return jobs.filter(j => j.status === 'closed');
  if (filter === 'lastMonth') {
    return jobs.filter(j => {
      const posted = new Date(j.postedAt);
      const diff = (now - posted) / (1000 * 60 * 60 * 24);
      return diff <= 31;
    });
  }
  return jobs;
}
const Jobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const filter = params.get('filter') || 'all';
  const [jobList, setJobList] = useState(jobs);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDelete, setShowDelete] = useState(null);

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditForm(jobList[idx]);
  };
  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = () => {
    setJobList(jobList.map((job, idx) => idx === editIdx ? editForm : job));
    setEditIdx(null);
  };
  const handleDelete = idx => {
    setShowDelete(idx);
  };
  const confirmDelete = () => {
    setJobList(jobList.filter((_, idx) => idx !== showDelete));
    setShowDelete(null);
  };
  const cancelDelete = () => setShowDelete(null);

  const filteredJobs = filterJobs(jobList, filter);
  let repeatedJobs = [];
  if (filteredJobs.length > 0) {
    while (repeatedJobs.length < 6) {
      repeatedJobs = repeatedJobs.concat(filteredJobs);
    }
    repeatedJobs = repeatedJobs.slice(0, 6);
  }

  return (
    <Container>
      <HeaderRow>
        <Title>Jobs {filter !== 'all' && `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}</Title>
        <PostButton onClick={() => navigate('/post-jobs')}>Post Job</PostButton>
      </HeaderRow>
      {filteredJobs.length === 0 ? (
        <div style={{ color: '#888', fontSize: '1.1rem', marginTop: 32 }}>No jobs found for this filter.</div>
      ) : (
        <JobsGrid>
          {repeatedJobs.map((job, idx) => (
            <JobCard key={idx}>
              {editIdx === (idx % filteredJobs.length) ? (
                <>
                  <LargeInput name="title" value={editForm.title} onChange={handleEditChange} placeholder="Job Title" />
                  <LargeInput name="company" value={editForm.company} onChange={handleEditChange} placeholder="Company" />
                  <LargeInput name="location" value={editForm.location} onChange={handleEditChange} placeholder="Location" />
                  <LargeInput name="postedAt" value={editForm.postedAt} onChange={handleEditChange} placeholder="Posted Date" />
                  <LargeInput name="link" value={editForm.link || ''} onChange={handleEditChange} placeholder="Application Link" />
                  <LargeTextarea name="requirements" value={editForm.requirements || ''} onChange={handleEditChange} placeholder="Requirements" />
                  <select name="status" value={editForm.status} onChange={handleEditChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, fontSize: '1.05rem', marginBottom: '1rem' }}>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                  <ButtonRow>
                    <ActionButton color="#28a745" onClick={handleEditSave}>Save</ActionButton>
                    <ActionButton color="#6c757d" onClick={() => setEditIdx(null)}>Cancel</ActionButton>
                  </ButtonRow>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{job.title}</div>
                  <div style={{ color: '#555', fontSize: '0.98rem' }}>{job.company} &bull; {job.location}</div>
                  <div style={{ color: '#888', fontSize: '0.95rem' }}>Posted: {job.postedAt}</div>
                  <div style={{ color: job.status === 'active' ? '#28a745' : '#dc3545', fontWeight: 500, marginTop: 4 }}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</div>
                  <div style={{ color: '#444', margin: '8px 0', fontSize: '0.98rem' }}><b>Requirements:</b> {job.requirements}</div>
                  {job.link && (
                    <a href={job.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 500, marginBottom: 8, display: 'inline-block' }}>View / Apply</a>
                  )}
                  <ButtonRow>
                    <ActionButton color="#007bff" onClick={() => handleEdit(idx % filteredJobs.length)}>Edit</ActionButton>
                    <ActionButton color="#dc3545" onClick={() => handleDelete(idx % filteredJobs.length)}>Delete</ActionButton>
                  </ButtonRow>
                </>
              )}
              {showDelete === (idx % filteredJobs.length) && (
                <div style={{ marginTop: 8 }}>
                  <span>Are you sure you want to delete this job?</span>
                  <ActionButton color="#dc3545" onClick={confirmDelete}>Yes</ActionButton>
                  <ActionButton color="#6c757d" onClick={cancelDelete}>No</ActionButton>
                </div>
              )}
            </JobCard>
          ))}
        </JobsGrid>
      )}
    </Container>
  );
};
export default Jobs; 