import React, { useState } from 'react';
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
const ScholarshipCard = styled.div`
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
const scholarships = [
  { title: 'Tech for Refugees Scholarship', provider: 'TechOrg', location: 'Online', daysRemaining: 14, link: 'https://example.com/tech-scholarship', description: 'Scholarship for refugees interested in technology.' },
  { title: 'Global Education Fund', provider: 'GlobalEd', location: 'Online', daysRemaining: 20, link: 'https://example.com/global-ed', description: 'Support for refugees pursuing higher education.' },
];
const Scholarships = () => {
  const [scholarshipList, setScholarshipList] = useState(scholarships);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDelete, setShowDelete] = useState(null);

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditForm(scholarshipList[idx]);
  };
  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = () => {
    setScholarshipList(scholarshipList.map((sch, idx) => idx === editIdx ? editForm : sch));
    setEditIdx(null);
  };
  const handleDelete = idx => {
    setShowDelete(idx);
  };
  const confirmDelete = () => {
    setScholarshipList(scholarshipList.filter((_, idx) => idx !== showDelete));
    setShowDelete(null);
  };
  const cancelDelete = () => setShowDelete(null);

  return (
    <Container>
      <Title>Scholarship Opportunities</Title>
      {scholarshipList.length === 0 ? (
        <div style={{ color: '#888', fontSize: '1.1rem', marginTop: 32 }}>No scholarships available at the moment.</div>
      ) : (
        scholarshipList.map((sch, idx) => (
          <ScholarshipCard key={idx}>
            {editIdx === idx ? (
              <>
                <input name="title" value={editForm.title} onChange={handleEditChange} />
                <input name="provider" value={editForm.provider} onChange={handleEditChange} />
                <input name="location" value={editForm.location} onChange={handleEditChange} />
                <input name="daysRemaining" value={editForm.daysRemaining} onChange={handleEditChange} />
                <input name="link" value={editForm.link} onChange={handleEditChange} />
                <textarea name="description" value={editForm.description} onChange={handleEditChange} />
                <ActionButton color="#28a745" onClick={handleEditSave}>Save</ActionButton>
                <ActionButton color="#6c757d" onClick={() => setEditIdx(null)}>Cancel</ActionButton>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{sch.title}</div>
                <div style={{ color: '#555', fontSize: '0.98rem' }}>{sch.provider} &bull; {sch.location}</div>
                <div style={{ color: '#888', fontSize: '0.95rem' }}>Ends in {sch.daysRemaining} days</div>
                <div style={{ margin: '8px 0', color: '#444' }}>{sch.description}</div>
                <a href={sch.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 500 }}>View Details / Apply</a>
                <ActionButton color="#007bff" onClick={() => handleEdit(idx)}>Edit</ActionButton>
                <ActionButton color="#dc3545" onClick={() => handleDelete(idx)}>Delete</ActionButton>
              </>
            )}
            {showDelete === idx && (
              <div style={{ marginTop: 8 }}>
                <span>Are you sure you want to delete this scholarship?</span>
                <ActionButton color="#dc3545" onClick={confirmDelete}>Yes</ActionButton>
                <ActionButton color="#6c757d" onClick={cancelDelete}>No</ActionButton>
              </div>
            )}
          </ScholarshipCard>
        ))
      )}
    </Container>
  );
};
export default Scholarships; 