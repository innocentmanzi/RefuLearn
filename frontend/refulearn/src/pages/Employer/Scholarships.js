import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
  max-width: 100vw;
  
  @media (max-width: 900px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.8rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  color: #007bff;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: #6c757d;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
`;

const PostButton = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
  

`;

const FilterButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: 2px solid ${({ active }) => active ? '#007bff' : '#dee2e6'};
  background: ${({ active }) => active ? '#007bff' : '#fff'};
  color: ${({ active }) => active ? '#fff' : '#495057'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active }) => active ? '#0056b3' : '#f8f9fa'};
    transform: translateY(-1px);
  }
`;

const ScholarshipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ScholarshipCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(226, 232, 240, 0.8);
  width: 100%;
  min-height: 450px;
  max-height: 480px;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 12px 12px 0 0;
  }
`;

const CardHeader = styled.div`
  padding: 1rem 1rem 0.5rem 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
`;

const CardBody = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CardFooter = styled.div`
  padding: 1rem;
  border-top: 2px solid #e9ecef;
  background: #f8f9fa;
  margin-top: 0.5rem;
  border-radius: 0 0 12px 12px;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.6rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  min-height: 32px;
  width: 100%;
  
  &:hover {
    background: #f8f9fa;
    border-color: #dee2e6;
  }
  
  @media (max-width: 768px) {
    padding: 0.3rem 0.5rem;
    min-height: 28px;
  }
`;



const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status }) => {
    if (status === 'active') {
      return `
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      `;
    } else {
      return `
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      `;
    }
  }}
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover {
            background: #0056b3;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
          &:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
            transform: translateY(-1px);
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover {
            background: #218838;
            transform: translateY(-1px);
          }
        `;
      case 'warning':
        return `
          background: #ffc107;
          color: #212529;
          &:hover {
            background: #e0a800;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #007bff;
          color: white;
          &:hover {
            background: #0056b3;
          }
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #007bff;
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

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const EmptyState = styled.div`
  color: #888;
  font-size: 1.1rem;
  margin-top: 2rem;
  text-align: center;
`;

const DeleteConfirmation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  text-align: center;
  z-index: 10;
`;

const DeleteMessage = styled.div`
  color: #721c24;
  font-weight: 600;
  margin-bottom: 20px;
`;

const DeleteButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDelete, setShowDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchScholarships();
  }, [statusFilter]);

  const fetchScholarships = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🌐 Fetching scholarships from API...');
      
      let url = '/api/scholarships/employer/scholarships';
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const scholarshipsData = (data.data && data.data.scholarships) ? data.data.scholarships : [];
        setScholarships(scholarshipsData);
      } else {
        throw new Error(data.message || 'Failed to fetch scholarships');
      }
    } catch (error) {
      console.error('Scholarships fetch error:', error);
      setError('Network error. Please try again.');
      setScholarships([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (scholarshipId) => {
    navigate(`/employer/scholarships/${scholarshipId}/edit`);
  };

  const handleDelete = idx => {
    setShowDelete(idx);
  };

  const confirmDelete = async (scholarshipId) => {
    try {
      console.log('🌐 Deleting scholarship...');
      
      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        setSuccessMessage('Scholarship deleted successfully');
        fetchScholarships();
      } else {
        throw new Error('Failed to delete scholarship');
      }
    } catch (error) {
      console.error('❌ Delete scholarship error:', error);
      setError('Failed to delete scholarship. Please try again.');
    } finally {
      setShowDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const cancelDelete = () => {
    setShowDelete(null);
  };

  const toggleScholarshipStatus = async (scholarshipId, currentStatus) => {
    try {
      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (data.success) {
        setScholarships(scholarships.map(sch => 
          sch._id === scholarshipId ? { ...sch, isActive: !currentStatus } : sch
        ));
        setSuccessMessage(`Scholarship ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update scholarship status');
      }
    } catch (err) {
      console.error('Scholarship status update error:', err);
      setError('Network error. Please try again.');
    }
  };

  const filterScholarships = (scholarships, filter) => {
    if (filter === 'active') return scholarships.filter(s => s.isActive);
    if (filter === 'inactive') return scholarships.filter(s => !s.isActive);
    return scholarships;
  };

  const filteredScholarships = filterScholarships(scholarships, statusFilter);

  const calculateDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Container>
        <HeaderRow>
          <div>
            <Title>Scholarship Opportunities</Title>
            <Subtitle>Manage and track your scholarship programs</Subtitle>
          </div>
          <PostButton onClick={() => navigate('/employer/post-scholarship')}>
            Post Scholarship
          </PostButton>
        </HeaderRow>
        
        <LoadingSpinner>Loading scholarships...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderRow>
        <div>
          <Title>Scholarship Opportunities</Title>
          <Subtitle>Manage and track your scholarship programs</Subtitle>
        </div>
        <PostButton onClick={() => navigate('/employer/post-scholarship')}>
          Post Scholarship
        </PostButton>
      </HeaderRow>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <FilterButtons>
        <FilterButton 
          active={statusFilter === ''} 
          onClick={() => setStatusFilter('')}
        >
          All Scholarships
        </FilterButton>
        <FilterButton 
          active={statusFilter === 'active'} 
          onClick={() => setStatusFilter('active')}
        >
          Active
        </FilterButton>
        <FilterButton 
          active={statusFilter === 'inactive'} 
          onClick={() => setStatusFilter('inactive')}
        >
          Inactive
        </FilterButton>
      </FilterButtons>

      {filteredScholarships.length === 0 ? (
        <EmptyState>
          {statusFilter 
            ? `No ${statusFilter} scholarships found`
            : 'No scholarships found'
          }
        </EmptyState>
      ) : (
        <ScholarshipsGrid>
          {filteredScholarships.map((sch, idx) => (
            <ScholarshipCard key={sch._id || idx}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 0.25rem 0', 
                      color: '#1e293b', 
                      fontWeight: 700, 
                      fontSize: '1.1rem', 
                      lineHeight: '1.3'
                    }}>
                      {sch.title}
                    </h3>
                                         <div style={{ 
                       color: '#64748b', 
                       fontSize: '0.75rem',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.25rem'
                     }}>
                       <span>Deadline: {new Date(sch.deadline).toLocaleDateString('en-US', { 
                         month: 'short', 
                         day: 'numeric', 
                         year: 'numeric' 
                       })}</span>
                     </div>
                  </div>
                  <StatusBadge status={sch.isActive ? 'active' : 'inactive'}>
                    {sch.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
              </CardHeader>

              <CardBody>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: '0.4rem' 
                }}>
                  <MetricItem>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      width: '100%' 
                    }}>
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: '#64748b', 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        minWidth: '70px'
                      }}>
                        Provider:
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#1e293b', 
                        fontWeight: 600,
                        marginLeft: '0.3rem',
                        flex: 1,
                        textAlign: 'right',
                        wordBreak: 'break-word'
                      }}>
                        {sch.provider || 'N/A'}
                      </div>
                    </div>
                  </MetricItem>

                  <MetricItem>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      width: '100%' 
                    }}>
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: '#64748b', 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        minWidth: '70px'
                      }}>
                        Location:
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#1e293b', 
                        fontWeight: 600,
                        marginLeft: '0.3rem',
                        flex: 1,
                        textAlign: 'right',
                        wordBreak: 'break-word'
                      }}>
                        {sch.location || 'Global'}
                      </div>
                    </div>
                  </MetricItem>

                  <MetricItem>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      width: '100%' 
                    }}>
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: '#64748b', 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        minWidth: '70px'
                      }}>
                        Days Left:
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: calculateDaysRemaining(sch.deadline) < 7 ? '#dc3545' : '#28a745', 
                        fontWeight: 700,
                        marginLeft: '0.3rem',
                        flex: 1,
                        textAlign: 'right'
                      }}>
                        {calculateDaysRemaining(sch.deadline)} days
                      </div>
                    </div>
                  </MetricItem>
                </div>

                {sch.description && (
                  <div style={{ 
                    background: 'rgba(248, 250, 252, 0.8)', 
                    border: '1px solid rgba(226, 232, 240, 0.6)', 
                    borderRadius: '8px', 
                    padding: '0.65rem',
                    borderLeft: '3px solid #007bff',
                    marginBottom: '0'
                  }}>
                    <div style={{ 
                      fontSize: '0.65rem', 
                      color: '#64748b', 
                      fontWeight: 600, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px', 
                      marginBottom: '0.2rem' 
                    }}>
                      Description
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#475569', 
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {sch.description}
                    </div>
                  </div>
                )}
              </CardBody>

                             <CardFooter>
                 <div style={{ 
                   display: 'grid', 
                   gridTemplateColumns: 'repeat(3, 1fr)',
                   gap: '0.5rem',
                   alignItems: 'center'
                 }}>
                   <ActionButton 
                     variant="primary"
                     onClick={() => handleEdit(sch._id)}
                   >
                     Edit
                   </ActionButton>
                   
                   {sch.isActive ? (
                     <ActionButton 
                       variant="warning"
                       onClick={() => toggleScholarshipStatus(sch._id, sch.isActive)}
                     >
                       Deactivate
                     </ActionButton>
                   ) : (
                     <ActionButton 
                       variant="success"
                       onClick={() => toggleScholarshipStatus(sch._id, sch.isActive)}
                     >
                       Activate
                     </ActionButton>
                   )}
                   
                   <ActionButton 
                     variant="danger"
                     onClick={() => handleDelete(idx)}
                   >
                     Delete
                   </ActionButton>
                 </div>
               </CardFooter>
              
                             {showDelete === idx && (
                 <DeleteConfirmation>
                   <DeleteMessage>
                     Are you sure you want to delete this scholarship?
                     <br />
                     <small style={{ color: '#6c757d', fontWeight: 'normal' }}>This action cannot be undone.</small>
                   </DeleteMessage>
                   <DeleteButtons>
                     <ActionButton variant="danger" onClick={() => confirmDelete(scholarships[showDelete]._id)}>
                       Yes, Delete
                     </ActionButton>
                     <ActionButton variant="secondary" onClick={cancelDelete}>
                       Cancel
                     </ActionButton>
                   </DeleteButtons>
                 </DeleteConfirmation>
               )}
            </ScholarshipCard>
          ))}
        </ScholarshipsGrid>
      )}
    </Container>
  );
};

export default Scholarships; 