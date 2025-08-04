import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
`;

const NotificationCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  ${props => !props.isRead && `
    border-left: 3px solid #007bff;
    background: #f8f9ff;
  `}
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
`;

const NotificationTitle = styled.h3`
  color: #333;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
`;

const NotificationTime = styled.span`
  color: #666;
  font-size: 0.8rem;
`;

const NotificationMessage = styled.p`
  color: #555;
  margin: 0.25rem 0;
  line-height: 1.4;
  font-size: 0.85rem;
`;

const NotificationCategory = styled.span`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    switch (props.category) {
      case 'job_approval':
        return 'background: #d4edda; color: #155724;';
      case 'job_rejection':
        return 'background: #f8d7da; color: #721c24;';
      case 'scholarship_approval':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'scholarship_rejection':
        return 'background: #f5c6cb; color: #721c24;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const ActionButton = styled.button`
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return 'background: #007bff; color: white; &:hover { background: #0056b3; }';
      case 'secondary':
        return 'background: #6c757d; color: white; &:hover { background: #545b62; }';
      default:
        return 'background: #e9ecef; color: #333; &:hover { background: #dde2e6; }';
    }
  }}
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.pagination.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Clear any existing error messages
      setError('');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update the notification in the local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Clear any existing error messages
      setError('');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update all notifications to read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      setUnreadCount(0);
      setSuccessMessage('All notifications marked as read');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Clear any existing error messages
      setError('');
      console.log('🗑️ Deleting notification:', notificationId);
      
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      console.log('📡 Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Delete failed:', errorData);
        throw new Error(errorData.message || 'Failed to delete notification');
      }

      const responseData = await response.json();
      console.log('✅ Delete successful:', responseData);

      // Remove the notification from local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );

      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Show success message
      setSuccessMessage('Notification deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(error.message || 'Failed to delete notification');
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'job_approval':
        return 'Job Approved';
      case 'job_rejection':
        return 'Job Rejected';
      case 'scholarship_approval':
        return 'Scholarship Approved';
      case 'scholarship_rejection':
        return 'Scholarship Rejected';
      default:
        return 'General';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.category === filter;
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <Container>
        <Title>Notifications</Title>
        <LoadingSpinner>Loading notifications...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      <FilterContainer>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton 
          active={filter === 'unread'} 
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </FilterButton>
        <FilterButton 
          active={filter === 'job_approval'} 
          onClick={() => setFilter('job_approval')}
        >
          Job Approvals
        </FilterButton>
        <FilterButton 
          active={filter === 'job_rejection'} 
          onClick={() => setFilter('job_rejection')}
        >
          Job Rejections
        </FilterButton>
        <FilterButton 
          active={filter === 'scholarship_approval'} 
          onClick={() => setFilter('scholarship_approval')}
        >
          Scholarship Approvals
        </FilterButton>
        <FilterButton 
          active={filter === 'scholarship_rejection'} 
          onClick={() => setFilter('scholarship_rejection')}
        >
          Scholarship Rejections
        </FilterButton>
      </FilterContainer>

      {unreadCount > 0 && (
        <ButtonContainer>
          <ActionButton variant="primary" onClick={markAllAsRead}>
            Mark All as Read
          </ActionButton>
        </ButtonContainer>
      )}

      {filteredNotifications.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🔔</EmptyStateIcon>
          <h3>No notifications</h3>
          <p>You're all caught up! No new notifications to show.</p>
        </EmptyState>
      ) : (
        filteredNotifications.map((notification) => (
          <NotificationCard 
            key={notification._id} 
            isRead={notification.isRead}
            onClick={() => !notification.isRead && markAsRead(notification._id)}
          >
            <NotificationHeader>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <NotificationTime>{formatDate(notification.createdAt)}</NotificationTime>
            </NotificationHeader>
            
            <NotificationMessage>{notification.message}</NotificationMessage>
            
            <NotificationCategory category={notification.category}>
              {getCategoryLabel(notification.category)}
            </NotificationCategory>
            
            <ButtonContainer>
              {!notification.isRead && (
                <ActionButton 
                  variant="primary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification._id);
                  }}
                >
                  Mark as Read
                </ActionButton>
              )}
              <ActionButton 
                variant="secondary" 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification._id);
                }}
              >
                Delete
              </ActionButton>
            </ButtonContainer>
          </NotificationCard>
        ))
      )}
    </Container>
  );
};

export default Notifications; 