import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const SidebarContainer = styled.div`
  width: 240px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  position: fixed;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  z-index: 1000;
`;

const TopSection = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow-y: auto;
`;

const LogoWrapper = styled.div`
  padding: 2rem 1rem 1.5rem 1rem;
  text-align: center;
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.colors.white};
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  font-size: 1.08rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  &.active {
    background: ${({ theme }) => theme.colors.secondary};
    color: #fff;
  }
  &:hover {
    background: rgba(0,0,0,0.08);
    color: #fff;
  }
`;

const BottomSection = styled.div`
  flex-shrink: 0;
  padding: 1.5rem 1rem 1.5rem 1rem;
`;

const LogoutButton = styled.button`
  width: 100%;
  background: #000;
  color: #fff;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 500;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    color: #fff;
  }
`;

const linksByRole = {
  refugee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Browse Courses' },
    { to: '/learning-path', label: 'Learning Path' },
    { to: '/assessments', label: 'Assessments' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/peer-learning', label: 'Peer Learning' },
    { to: '/jobs', label: 'Apply for Jobs' },
    { to: '/profile', label: 'Profile' },
  ],
  instructor: [
    { to: '/instructor', label: 'Dashboard' },
    { to: '/manage-courses', label: 'Manage Courses' },
    { to: '/assessments', label: 'Assessments' },
    { to: '/profile', label: 'Profile' },
  ],
  mentor: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/mentees', label: 'Mentees' },
    { to: '/resources', label: 'Resources' },
    { to: '/peer-learning', label: 'Peer Learning' },
    { to: '/profile', label: 'Profile' }
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/manage-users', label: 'Manage Users' },
    { to: '/profile', label: 'Profile' },
  ],
  employer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/post-jobs', label: 'Post Jobs' },
    { to: '/applicants', label: 'View Applicants' },
    { to: '/profile', label: 'Profile' },
  ],
};

const Sidebar = ({ role, children, onLogout }) => (
  <div style={{ display: 'flex' }}>
    <SidebarContainer>
      <TopSection>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        <NavLinks>
          {linksByRole[role]?.map(link => (
            <StyledNavLink key={link.to} to={link.to} activeClassName="active">
              {link.label}
            </StyledNavLink>
          ))}
        </NavLinks>
      </TopSection>
      <BottomSection>
        <LogoutButton onClick={onLogout}>Logout</LogoutButton>
      </BottomSection>
    </SidebarContainer>
    <div style={{ marginLeft: 240, width: '100%' }}>{children}</div>
  </div>
);

export default Sidebar; 