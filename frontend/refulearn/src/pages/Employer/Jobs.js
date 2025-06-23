import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;
const JobCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.3rem 1.1rem;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid #e3e8f0;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 0.8rem 0.5rem;
    font-size: 0.98rem;
  }
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
const jobs = [
  { title: 'Frontend Developer', status: 'active', postedAt: '2025-06-10', company: 'TechOrg', location: 'Remote', daysRemaining: 7 },
  { title: 'Backend Developer', status: 'closed', postedAt: '2025-05-20', company: 'CodeInc', location: 'Nairobi, Kenya', daysRemaining: 0 },
  { title: 'Data Analyst', status: 'active', postedAt: '2025-06-01', company: 'DataCorp', location: 'Kigali, Rwanda', daysRemaining: 10 },
  { title: 'UI/UX Designer', status: 'closed', postedAt: '2025-05-15', company: 'Designify', location: 'Remote', daysRemaining: 0 },
  { title: 'Project Manager', status: 'active', postedAt: '2025-06-12', company: 'ManageIt', location: 'Addis Ababa, Ethiopia', daysRemaining: 12 },
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
  return (
    <Container>
      <Title>Jobs {filter !== 'all' && `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}</Title>
      {filteredJobs.length === 0 ? (
        <div style={{ color: '#888', fontSize: '1.1rem', marginTop: 32 }}>No jobs found for this filter.</div>
      ) : (
        filteredJobs.map((job, idx) => (
          <JobCard key={idx}>
            {editIdx === idx ? (
              <>
                <input name="title" value={editForm.title} onChange={handleEditChange} />
                <input name="company" value={editForm.company} onChange={handleEditChange} />
                <input name="location" value={editForm.location} onChange={handleEditChange} />
                <input name="postedAt" value={editForm.postedAt} onChange={handleEditChange} />
                <select name="status" value={editForm.status} onChange={handleEditChange}>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
                <ActionButton color="#28a745" onClick={handleEditSave}>Save</ActionButton>
                <ActionButton color="#6c757d" onClick={() => setEditIdx(null)}>Cancel</ActionButton>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{job.title}</div>
                <div style={{ color: '#555', fontSize: '0.98rem' }}>{job.company} &bull; {job.location}</div>
                <div style={{ color: '#888', fontSize: '0.95rem' }}>Posted: {job.postedAt}</div>
                <div style={{ color: job.status === 'active' ? '#28a745' : '#dc3545', fontWeight: 500, marginTop: 4 }}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</div>
                <ActionButton color="#007bff" onClick={() => handleEdit(idx)}>Edit</ActionButton>
                <ActionButton color="#dc3545" onClick={() => handleDelete(idx)}>Delete</ActionButton>
              </>
            )}
            {showDelete === idx && (
              <div style={{ marginTop: 8 }}>
                <span>Are you sure you want to delete this job?</span>
                <ActionButton color="#dc3545" onClick={confirmDelete}>Yes</ActionButton>
                <ActionButton color="#6c757d" onClick={cancelDelete}>No</ActionButton>
              </div>
            )}
          </JobCard>
        ))
      )}
    </Container>
  );
};
export default Jobs; 