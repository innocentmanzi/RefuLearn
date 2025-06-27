import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
const ScholarshipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;
const ScholarshipCard = styled.div`
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
const scholarships = [
  { title: 'Tech for Refugees Scholarship', provider: 'TechOrg', location: 'Online', daysRemaining: 14, link: 'https://example.com/tech-scholarship', description: 'Scholarship for refugees interested in technology.' },
  { title: 'Global Education Fund', provider: 'GlobalEd', location: 'Online', daysRemaining: 20, link: 'https://example.com/global-ed', description: 'Support for refugees pursuing higher education.' },
];
const Scholarships = () => {
  const [scholarshipList, setScholarshipList] = useState(scholarships);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDelete, setShowDelete] = useState(null);
  const navigate = useNavigate();

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

  let repeatedScholarships = [];
  if (scholarshipList.length > 0) {
    while (repeatedScholarships.length < 6) {
      repeatedScholarships = repeatedScholarships.concat(scholarshipList);
    }
    repeatedScholarships = repeatedScholarships.slice(0, 6);
  }

  return (
    <Container>
      <HeaderRow>
        <Title>Scholarship Opportunities</Title>
        <PostButton onClick={() => navigate('/post-scholarship')}>Post Scholarship</PostButton>
      </HeaderRow>
      {scholarshipList.length === 0 ? (
        <div style={{ color: '#888', fontSize: '1.1rem', marginTop: 32 }}>No scholarships available at the moment.</div>
      ) : (
        <ScholarshipsGrid>
          {repeatedScholarships.map((sch, idx) => (
            <ScholarshipCard key={idx}>
              {editIdx === (idx % scholarshipList.length) ? (
                <>
                  <LargeInput name="title" value={editForm.title} onChange={handleEditChange} placeholder="Scholarship Title" />
                  <LargeInput name="provider" value={editForm.provider} onChange={handleEditChange} placeholder="Provider" />
                  <LargeInput name="location" value={editForm.location} onChange={handleEditChange} placeholder="Location" />
                  <LargeInput name="daysRemaining" value={editForm.daysRemaining} onChange={handleEditChange} placeholder="Days Remaining" />
                  <LargeInput name="link" value={editForm.link || ''} onChange={handleEditChange} placeholder="Application Link" />
                  <LargeTextarea name="description" value={editForm.description || ''} onChange={handleEditChange} placeholder="Description" />
                  <ButtonRow>
                    <ActionButton color="#28a745" onClick={handleEditSave}>Save</ActionButton>
                    <ActionButton color="#6c757d" onClick={() => setEditIdx(null)}>Cancel</ActionButton>
                  </ButtonRow>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{sch.title}</div>
                  <div style={{ color: '#555', fontSize: '0.98rem' }}>{sch.provider} &bull; {sch.location}</div>
                  <div style={{ color: '#888', fontSize: '0.95rem' }}>Ends in {sch.daysRemaining} days</div>
                  <div style={{ margin: '8px 0', color: '#444' }}>{sch.description}</div>
                  {sch.link && (
                    <a href={sch.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 500, marginBottom: 8, display: 'inline-block' }}>View / Apply</a>
                  )}
                  <ButtonRow>
                    <ActionButton color="#007bff" onClick={() => handleEdit(idx % scholarshipList.length)}>Edit</ActionButton>
                    <ActionButton color="#dc3545" onClick={() => handleDelete(idx % scholarshipList.length)}>Delete</ActionButton>
                  </ButtonRow>
                </>
              )}
              {showDelete === (idx % scholarshipList.length) && (
                <div style={{ marginTop: 8 }}>
                  <span>Are you sure you want to delete this scholarship?</span>
                  <ActionButton color="#dc3545" onClick={confirmDelete}>Yes</ActionButton>
                  <ActionButton color="#6c757d" onClick={cancelDelete}>No</ActionButton>
                </div>
              )}
            </ScholarshipCard>
          ))}
        </ScholarshipsGrid>
      )}
    </Container>
  );
};
export default Scholarships; 