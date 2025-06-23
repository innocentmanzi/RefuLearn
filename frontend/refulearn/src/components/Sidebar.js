import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';

const HamburgerButton = styled.button`
  display: none;
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 1100;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  cursor: pointer;
  @media (max-width: 900px) {
    display: ${({ $open }) => $open ? 'none' : 'flex'};
  }
`;

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
  left: 0;
  top: 0;
  transition: transform 0.3s ease;
  @media (max-width: 900px) {
    transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 999;
  }
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

const MainContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  transition: margin-left 0.3s, padding-top 0.3s;
  @media (max-width: 900px) {
    margin-left: 0;
    padding: 5rem 1rem 1rem 1rem;
    width: 100vw;
    box-sizing: border-box;
  }
  @media (min-width: 901px) {
    margin-left: 240px;
    padding: 2rem;
    width: 100%;
    max-width: calc(100vw - 240px);
    box-sizing: border-box;
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
    { to: '/help', label: 'Help' },
    { to: '/help-tickets', label: 'My Help Tickets' },
    { to: '/jobs', label: 'Apply for Jobs' },
    { to: '/profile', label: 'Profile' },
  ],
  instructor: [
    { to: '/instructor', label: 'Dashboard' },
    { to: '/manage-courses', label: 'Manage Courses' },
    { to: '/help-management', label: 'Q&A' },
    { to: '/assessments', label: 'Assessments' },
    { to: '/profile', label: 'Profile' },
  ],
  mentor: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/mentees', label: 'Mentees' },
    { to: '/resources', label: 'Resources' },
    { to: '/peer-learning', label: 'Peer Learning' },
    { to: '/help-management', label: 'Q&A' },
    { to: '/profile', label: 'Profile' }
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/manage-users', label: 'Manage Users' },
    { to: '/help-management', label: 'Q&A' },
    { to: '/profile', label: 'Profile' },
  ],
  employer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/post-jobs', label: 'Post Jobs' },
    { to: '/post-scholarship', label: 'Post Scholarship' },
    { to: '/applicants', label: 'View Applicants' },
    { to: '/profile', label: 'Profile' },
  ],
};

const Sidebar = ({ role, children, onLogout, headerSpacing }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const handleToggle = () => setOpen(o => !o);
  const handleClose = () => setOpen(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <HamburgerButton aria-label="Open sidebar" onClick={handleToggle} $open={open}>
        <span aria-hidden="true">&#9776;</span>
      </HamburgerButton>
      <Overlay $open={open} onClick={handleClose} />
      <SidebarContainer $open={open}>
        <TopSection>
          <LogoWrapper>
            <Logo />
          </LogoWrapper>
          <NavLinks>
            {linksByRole[role]?.map(link => (
              <StyledNavLink key={link.to} to={link.to} activeClassName="active" onClick={handleClose}>
                {link.label}
              </StyledNavLink>
            ))}
          </NavLinks>
        </TopSection>
        <BottomSection>
          <LogoutButton onClick={onLogout}>Logout</LogoutButton>
        </BottomSection>
      </SidebarContainer>
      <MainContent $open={open} $headerSpacing={headerSpacing}>{children}</MainContent>
    </>
  );
};

export default Sidebar; 