import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 1rem;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  
  &:hover {
    background: #545b62;
  }
`;

const Title = styled.h1`
  color: #000;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
`;

const DetailCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailLabel = styled.strong`
  color: #000;
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const DetailValue = styled.div`
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #007bff;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &.approve {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.reject {
    background: #000;
    color: white;
    
    &:hover {
      background: #333;
    }
  }
`;

const Badge = styled.span`
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
`;

const ApprovalDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');

  // Helper function to safely render any field (object, array, or string)
  const renderField = (field) => {
    if (!field) return 'N/A';
    if (typeof field === 'string') return field;
    if (Array.isArray(field)) return field.join(', ');
    if (typeof field === 'object') {
      // Special handling for salary object
      if (field.min !== undefined && field.max !== undefined) {
        return `${field.min || 'N/A'} - ${field.max || 'N/A'} ${field.currency || ''}`;
      }
      return JSON.stringify(field, null, 2);
    }
    return String(field);
  };

  useEffect(() => {
    // Get item data from navigation state or fetch from API
    if (location.state) {
      console.log('📋 REAL BACKEND DATA received for approval detail:', location.state.item);
      console.log('🔍 Item fields from backend:', Object.keys(location.state.item));
      console.log('📝 Item content preview:', {
        title: location.state.item.title,
        description: location.state.item.description?.substring(0, 100),
        createdAt: location.state.item.createdAt,
        _id: location.state.item._id
      });
      setItem(location.state.item);
      setActiveTab(location.state.activeTab);
    } else {
      // If no state, redirect back or fetch from API
      navigate('/admin/approvals');
    }
  }, [location.state, navigate]);

  const handleApproval = async (action, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/${activeTab}/${item._id}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        alert(`${activeTab.slice(0, -1)} ${action}d successfully!`);
        navigate('/admin/approvals');
      } else {
        alert('Error processing approval');
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Error processing approval');
    }
  };

  const handleApprove = () => {
    handleApproval('approve');
  };

  const handleReject = () => {
    const reason = prompt('Reason for rejection (optional):');
    handleApproval('reject', reason);
  };

  if (!item) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin/approvals')}>
          ← Back to Approvals
        </BackButton>
        <Title>{item.title}</Title>
      </Header>

      <DetailCard>
        <Badge>Pending Approval</Badge>

        <DetailSection>
          <DetailLabel>Description:</DetailLabel>
          <DetailValue>{renderField(item.description) || 'No description provided'}</DetailValue>
        </DetailSection>

        {item.provider && (
          <DetailSection>
            <DetailLabel>Provider:</DetailLabel>
            <DetailValue>{renderField(item.provider)}</DetailValue>
          </DetailSection>
        )}

        {item.company && (
          <DetailSection>
            <DetailLabel>Company:</DetailLabel>
            <DetailValue>{renderField(item.company)}</DetailValue>
          </DetailSection>
        )}

        {item.location && (
          <DetailSection>
            <DetailLabel>Location:</DetailLabel>
            <DetailValue>{renderField(item.location)}</DetailValue>
          </DetailSection>
        )}

        {item.category && (
          <DetailSection>
            <DetailLabel>Category:</DetailLabel>
            <DetailValue>{renderField(item.category)}</DetailValue>
          </DetailSection>
        )}

        {item.level && (
          <DetailSection>
            <DetailLabel>Level:</DetailLabel>
            <DetailValue>{renderField(item.level)}</DetailValue>
          </DetailSection>
        )}

        {item.instructor && (
          <DetailSection>
            <DetailLabel>Instructor:</DetailLabel>
            <DetailValue>{renderField(item.instructor)}</DetailValue>
          </DetailSection>
        )}

        {item.job_type && (
          <DetailSection>
            <DetailLabel>Job Type:</DetailLabel>
            <DetailValue>{renderField(item.job_type)}</DetailValue>
          </DetailSection>
        )}

        {item.salary && (
          <DetailSection>
            <DetailLabel>Salary:</DetailLabel>
            <DetailValue>{renderField(item.salary)}</DetailValue>
          </DetailSection>
        )}

        {item.benefits && (
          <DetailSection>
            <DetailLabel>Benefits:</DetailLabel>
            <DetailValue>{renderField(item.benefits)}</DetailValue>
          </DetailSection>
        )}

        {item.requirements && (
          <DetailSection>
            <DetailLabel>Requirements:</DetailLabel>
            <DetailValue>{renderField(item.requirements)}</DetailValue>
          </DetailSection>
        )}

        {item.deadline && (
          <DetailSection>
            <DetailLabel>Deadline:</DetailLabel>
            <DetailValue>{new Date(item.deadline).toLocaleDateString()}</DetailValue>
          </DetailSection>
        )}

        {item.link && (
          <DetailSection>
            <DetailLabel>Link:</DetailLabel>
            <DetailValue>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{color: '#007bff'}}>
                {item.link}
              </a>
            </DetailValue>
          </DetailSection>
        )}

        {item.eligibility && (
          <DetailSection>
            <DetailLabel>Eligibility:</DetailLabel>
            <DetailValue>{renderField(item.eligibility)}</DetailValue>
          </DetailSection>
        )}

        {item.applicationprocess && (
          <DetailSection>
            <DetailLabel>Application Process:</DetailLabel>
            <DetailValue>{renderField(item.applicationprocess)}</DetailValue>
          </DetailSection>
        )}

        <DetailSection>
          <DetailLabel>Created:</DetailLabel>
          <DetailValue>{new Date(item.createdAt).toLocaleString()}</DetailValue>
        </DetailSection>

        <DetailSection>
          <DetailLabel>Status:</DetailLabel>
          <DetailValue>{item.isActive ? 'Active' : 'Inactive'}</DetailValue>
        </DetailSection>
      </DetailCard>

      <ButtonGroup>
        <Button className="approve" onClick={handleApprove}>
          Approve
        </Button>
        <Button className="reject" onClick={handleReject}>
          Reject
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default ApprovalDetail; 