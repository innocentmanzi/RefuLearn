import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ProfileDropdown from './ProfileDropdown';
import { useUser } from '../contexts/UserContext';
import { FaChevronDown } from 'react-icons/fa';

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
  justify-content: space-between;
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

const UserInfoSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  background: #000;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  width: 90%;
  min-width: 0;
  box-sizing: border-box;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 auto 0.75rem auto;
  box-shadow: none;
  height: 48px;
  cursor: pointer;
  transition: background 0.2s;
  overflow: hidden;
  position: relative;
`;

const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.95rem;
  color: #000;
  overflow: hidden;
  margin-right: 0.5rem;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const UserName = styled.div`
  font-weight: bold;
  color: #fff;
  font-size: 1.08rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
`;

const UserRole = styled.div`
  color: #bbb;
  font-size: 0.95rem;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  margin-left: 0.5rem;
`;

const linksByRole = {
  refugee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Browse Courses' },
    { to: '/learning-path', label: 'Learning Path' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/peer-learning', label: 'Peer Learning' },
    { to: '/help-tickets', label: 'Requests' },
    { to: '/jobs', label: 'Apply for Jobs' }
  ],
  instructor: [
    { to: '/instructor', label: 'Dashboard' },
    { to: '/manage-courses', label: 'Manage Courses' },
    { to: '/help-management', label: 'Q&A' },
    { to: '/assessments', label: 'Assessments' }
  ],
  mentor: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/mentees', label: 'Mentees' },
    { to: '/resources', label: 'Resources' },
    { to: '/peer-learning', label: 'Peer Learning' },
    { to: '/help-management', label: 'Q&A' }
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/manage-users', label: 'Manage Users' },
    { to: '/help-management', label: 'Requests' }
  ],
  employer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/scholarships', label: 'Scholarships' },
    { to: '/applicants', label: 'View Applicants' }
  ],
};

const Sidebar = ({ role, children, onLogout, headerSpacing }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userInfoRef = useRef(null);
  const navigate = useNavigate();

  const handleToggle = () => setOpen(o => !o);
  const handleClose = () => setOpen(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userInfoRef.current && !userInfoRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleUserInfoClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleMenuItemClick = (action) => {
    setDropdownOpen(false);
    switch (action) {
      case 'profile':
        location.pathname !== '/profile' && (window.location.href = '/profile');
        break;
      case 'settings':
        location.pathname !== '/account-settings' && (window.location.href = '/account-settings');
        break;
      case 'logout':
        onLogout();
        break;
      default:
        break;
    }
  };

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
          {/* User Info Section - now at the bottom of TopSection, scrollable */}
          <div ref={userInfoRef} style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1rem', position: 'relative' }}>
            <UserInfoSection
              style={{ cursor: 'pointer', position: 'relative', background: '#000' }}
              onClick={handleUserInfoClick}
            >
              <UserAvatar>
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="Profile" />
                ) : (
                  ((user?.firstName || user?.lastName) ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U')
                )}
              </UserAvatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserName>{user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</UserName>
                <UserRole>{role?.charAt(0).toUpperCase() + role?.slice(1)}</UserRole>
              </div>
            </UserInfoSection>
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                left: 0,
                bottom: '110%',
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                minWidth: 200,
                width: 220,
                zIndex: 1000,
                border: '1px solid #e0e0e0',
                padding: '0.5rem 0',
                marginBottom: '0.5rem',
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
                  <div style={{ fontWeight: 700, color: '#111', fontSize: '1.08rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.95rem', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', marginLeft: '0.5rem' }}>
                    {role?.charAt(0).toUpperCase() + role?.slice(1)}
                  </div>
                </div>
                <div style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#333', fontSize: '0.9rem' }} onClick={() => handleMenuItemClick('profile')}>
                  <span style={{ fontSize: '1rem', width: 16, textAlign: 'center' }}>👤</span> Edit Profile
                </div>
                <div style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#333', fontSize: '0.9rem' }} onClick={() => handleMenuItemClick('settings')}>
                  <span style={{ fontSize: '1rem', width: 16, textAlign: 'center' }}>⚙️</span> Account Settings
                </div>
                <div style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc3545', fontSize: '0.9rem', borderTop: '1px solid #e0e0e0' }} onClick={() => handleMenuItemClick('logout')}>
                  <span style={{ fontSize: '1rem', width: 16, textAlign: 'center' }}>🚪</span> Logout
                </div>
              </div>
            )}
          </div>
        </TopSection>
      </SidebarContainer>
      <MainContent $open={open} $headerSpacing={headerSpacing}>{children}</MainContent>
    </>
  );
};

export default Sidebar; 