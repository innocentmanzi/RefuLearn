import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: #000;
  margin-bottom: 2rem;
  font-weight: 700;
  font-size: 2.2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  border: none;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border: 2px solid ${props => props.active ? '#007bff' : '#e0e0e0'};
  border-bottom: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
    border-color: #007bff;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 320px));
  gap: 1rem;
  margin-top: 1rem;
  justify-content: start;
`;

const ItemCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 3px solid #007bff;
  border: 1px solid #e0e0e0;
  border-left: 3px solid #007bff;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,123,255,0.2);
    border-color: #007bff;
  }
`;

const ItemTitle = styled.h3`
  color: #000;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 1rem;
`;

const ItemInfo = styled.p`
  color: #333;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  line-height: 1.3;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
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
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;
`;



const ClickableCard = styled(ItemCard)`
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,123,255,0.25);
    border-color: #007bff;
  }
`;

const ApprovalManagement = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [pendingItems, setPendingItems] = useState({ courses: [], jobs: [], scholarships: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Fetching pending approvals...');
      
      // Add cache-busting parameter
      const response = await fetch('/api/admin/pending-approvals?t=' + Date.now(), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pending approvals received:', data.data);
        console.log('📊 Counts - Courses:', data.data.courses?.length, 'Jobs:', data.data.jobs?.length, 'Scholarships:', data.data.scholarships?.length);
        setPendingItems(data.data);
      } else {
        console.error('❌ Failed to fetch pending approvals:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailPage = (item) => {
    console.log('🚀 Navigating to detail page with REAL BACKEND DATA:', item);
    console.log('📊 Real data fields being passed:', Object.keys(item));
    // Navigate to detail page with item data
    navigate(`/admin/approvals/detail/${item._id}`, { 
      state: { item, activeTab } 
    });
  };

  const renderItems = () => {
    const items = pendingItems[activeTab] || [];
    
    if (items.length === 0) {
      return <p>No pending {activeTab} for approval.</p>;
    }

    return (
      <ItemsGrid>
        {items.map(item => (
          <ClickableCard key={item._id} onClick={() => openDetailPage(item)}>
            <ItemTitle>{item.title}</ItemTitle>
            <ItemInfo><strong>Description:</strong> {(item.description || item.overview || '').substring(0, 100)}...</ItemInfo>
            {activeTab === 'courses' && (
              <>
                <ItemInfo><strong>Category:</strong> {item.category}</ItemInfo>
                <ItemInfo><strong>Level:</strong> {item.level}</ItemInfo>
                <ItemInfo><strong>Instructor:</strong> {item.instructor}</ItemInfo>
              </>
            )}
            {activeTab === 'jobs' && (
              <>
                <ItemInfo><strong>Company:</strong> {item.company}</ItemInfo>
                <ItemInfo><strong>Location:</strong> {item.location}</ItemInfo>
                <ItemInfo><strong>Type:</strong> {item.job_type}</ItemInfo>
              </>
            )}
            {activeTab === 'scholarships' && (
              <>
                <ItemInfo><strong>Provider:</strong> {item.provider}</ItemInfo>
                <ItemInfo><strong>Amount:</strong> {item.amount}</ItemInfo>
                <ItemInfo><strong>Deadline:</strong> {new Date(item.deadline).toLocaleDateString()}</ItemInfo>
              </>
            )}
            <ItemInfo><strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}</ItemInfo>
            <Badge>Click to view details</Badge>
          </ClickableCard>
        ))}
      </ItemsGrid>
    );
  };

  if (loading) return <Container><p>Loading...</p></Container>;

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Title>Approval Management</Title>
        <button 
          onClick={() => {
            console.log('🔄 Manually refreshing approvals...');
            setLoading(true);
            fetchPendingApprovals();
          }}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🔄 Refresh
        </button>
      </div>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'courses'} 
          onClick={() => setActiveTab('courses')}
        >
          Courses ({pendingItems.courses?.length || 0})
        </Tab>
        <Tab 
          active={activeTab === 'jobs'} 
          onClick={() => setActiveTab('jobs')}
        >
          Jobs ({pendingItems.jobs?.length || 0})
        </Tab>
        <Tab 
          active={activeTab === 'scholarships'} 
          onClick={() => setActiveTab('scholarships')}
        >
          Scholarships ({pendingItems.scholarships?.length || 0})
        </Tab>
      </TabContainer>

            {renderItems()}
    </Container>
  );
};

export default ApprovalManagement; 