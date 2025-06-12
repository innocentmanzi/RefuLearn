import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { NavLink } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1rem;
`;

const SessionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SessionItem = styled.li`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuickAction = styled.button`
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
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ResourceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ResourceItem = styled.li`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;
const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;
const StickyFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;
const ActionButton = styled.button`
  background: ${({ color }) => color || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ color }) => color && `${color}cc`};
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
`;

const NotificationButton = styled.button`
  background: none;
  border: none;
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 1rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const NotificationPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
  
  ${({ unread }) => unread && `
    background: #f0f7ff;
  `}
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const AnalyticsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ChartContainer = styled.div`
  margin-top: 1rem;
  height: 200px;
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

const SessionItemLink = styled(NavLink)`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const ResourceItemLink = styled(NavLink)`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
  text-decoration: none;
  display: block;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const SessionDetailsText = styled.span`
  font-size: 0.95rem;
  color: #888;
`;

const MentorDashboard = () => {
  // Animated welcome
  const [mentorName] = useState('Grace Mentor');
  const [welcomeText, setWelcomeText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const welcomeMessage = `Welcome back, ${mentorName}!`;
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= welcomeMessage.length) {
        setWelcomeText(welcomeMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 70);
    return () => clearInterval(typingInterval);
  }, [welcomeMessage]);

  // Stats and modals
  const [showMenteesModal, setShowMenteesModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'session',
      message: 'New session request from Alice Johnson',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'mentee',
      message: 'Bob Smith completed his learning goal',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'resource',
      message: 'New resource shared in JavaScript Fundamentals group',
      time: '2 hours ago',
      unread: false
    }
  ]);

  const mentees = [
    'Alice Johnson',
    'Bob Smith',
    'Carlos Lee',
    'Dina Patel',
    'Fatima Noor',
    'Samuel Kim',
    'Lina Zhang',
  ];
  const upcomingSessions = [
    { id: 1, title: 'Introduction to JavaScript', mentee: 'Alice Johnson', date: '2025-06-10', time: '10:00 AM', link: '/sessions', relatedResources: ['JavaScript Basics.pdf'] },
    { id: 2, title: 'Data Structures Review', mentee: 'Bob Smith', date: '2025-06-12', time: '2:00 PM', link: '/sessions', relatedResources: ['DSA Cheatsheet.docx'] },
    { id: 3, title: 'React Project Kickoff', mentee: 'Carlos Lee', date: '2025-06-15', time: '4:30 PM', link: '/sessions', relatedResources: ['React Best Practices.pptx'] },
  ];
  const resources = [
    { id: 1, name: 'Mentoring Best Practices.pdf', link: '/resources' },
    { id: 2, name: 'Effective Communication.pptx', link: '/resources' },
    { id: 3, name: 'Goal Setting Worksheet.docx', link: '/resources' },
  ];

  // Analytics data
  const sessionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sessions Conducted',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#007bff',
        tension: 0.4
      }
    ]
  };

  const progressData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Mentee Progress',
        data: [65, 70, 75, 80, 85, 90],
        borderColor: '#28a745',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, unread: false }
        : notification
    ));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Container>
      <Title>
        <span>
          {welcomeText}
          {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
        </span>
        <NotificationButton onClick={() => setShowNotifications(!showNotifications)}>
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
        </NotificationButton>
        {showNotifications && (
          <NotificationPanel>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                unread={notification.unread}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div style={{ fontWeight: notification.unread ? 'bold' : 'normal' }}>
                  {notification.message}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  {notification.time}
                </div>
              </NotificationItem>
            ))}
          </NotificationPanel>
        )}
      </Title>
      <OverviewGrid>
        <OverviewCard onClick={() => setShowMenteesModal(true)} style={{ cursor: 'pointer' }}>
          <Stat>{mentees.length}</Stat>
          <StatLabel>Mentees</StatLabel>
        </OverviewCard>
        <OverviewCard onClick={() => setShowSessionsModal(true)} style={{ cursor: 'pointer' }}>
          <Stat>{upcomingSessions.length}</Stat>
          <StatLabel>Upcoming Sessions</StatLabel>
        </OverviewCard>
        <OverviewCard onClick={() => setShowResourcesModal(true)} style={{ cursor: 'pointer' }}>
          <Stat>{resources.length}</Stat>
          <StatLabel>Resources</StatLabel>
        </OverviewCard>
      </OverviewGrid>

      <AnalyticsGrid>
        <AnalyticsCard>
          <h3>Session Analytics</h3>
          <ChartContainer>
            <Line data={sessionData} options={chartOptions} />
          </ChartContainer>
        </AnalyticsCard>
        <AnalyticsCard>
          <h3>Mentee Progress</h3>
          <ChartContainer>
            <Line data={progressData} options={chartOptions} />
          </ChartContainer>
        </AnalyticsCard>
      </AnalyticsGrid>

      <SectionTitle>Upcoming Sessions</SectionTitle>
      <SessionList>
        {upcomingSessions.map((session) => (
          <SessionItemLink key={session.id} to={session.link}>
            <span><b>{session.title}</b> with {session.mentee}</span>
            <SessionDetailsText>{session.date} at {session.time}</SessionDetailsText>
          </SessionItemLink>
        ))}
      </SessionList>

      <SectionTitle>Quick Actions</SectionTitle>
      <QuickActionLink to="/sessions">Schedule Session</QuickActionLink>
      <QuickActionLink to="/mentees">View Mentees</QuickActionLink>
      <QuickActionLink to="/resources">View Resources</QuickActionLink>
      <QuickActionLink to="/peer-learning">View Peer Learning</QuickActionLink>

      <SectionTitle>Resources</SectionTitle>
      <ResourceList>
        {resources.map((res) => (
          <ResourceItemLink key={res.id} to={res.link}>
            {res.name}
          </ResourceItemLink>
        ))}
      </ResourceList>

      {/* Mentees Modal */}
      {showMenteesModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Mentees</ModalTitle>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {mentees.map((mentee, idx) => (
                  <li key={idx} style={{ marginBottom: 10 }}>{mentee}</li>
                ))}
              </ul>
            </div>
            <StickyFooter>
              <ActionButton color="#888" onClick={() => setShowMenteesModal(false)}>Close</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      {/* Sessions Modal */}
      {showSessionsModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Upcoming Sessions</ModalTitle>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {upcomingSessions.map((session, idx) => (
                  <li key={idx} style={{ marginBottom: 10 }}>
                    <b>{session.title}</b> - {session.date} at {session.time}
                  </li>
                ))}
              </ul>
            </div>
            <StickyFooter>
              <ActionButton color="#888" onClick={() => setShowSessionsModal(false)}>Close</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      {/* Resources Modal */}
      {showResourcesModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Resources</ModalTitle>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {resources.map((res, idx) => (
                  <li key={idx} style={{ marginBottom: 10 }}>{res.name}</li>
                ))}
              </ul>
            </div>
            <StickyFooter>
              <ActionButton color="#888" onClick={() => setShowResourcesModal(false)}>Close</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default MentorDashboard; 