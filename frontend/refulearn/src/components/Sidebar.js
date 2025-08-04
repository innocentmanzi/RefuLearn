import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ProfileDropdown from './ProfileDropdown';

import { useUser } from '../contexts/UserContext';
import { FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useLanguageRouting } from '../hooks/useLanguageRouting';
import preloader from '../utils/preloader';

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
  flex: 1;
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
  display: block;
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



const navigationItems = {
  refugee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'Courses' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/help', label: 'Help' }
  ],
  instructor: [
    { to: '/instructor/dashboard', label: 'Dashboard' },
    { to: '/instructor/courses', label: 'Manage Courses' },
    { to: '/instructor/quizzes', label: 'Quizzes' },
    { to: '/instructor/help', label: 'Help' }
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Manage Users' },
    { to: '/admin/approvals', label: 'Approve Content' },
    { to: '/admin/help', label: 'Help Management' }
  ],
  employer: [
    { to: '/employer/dashboard', label: 'Dashboard' },
    { to: '/employer/jobs', label: 'Jobs' },
    { to: '/employer/scholarships', label: 'Scholarships' },
    { to: '/employer/notifications', label: 'Notifications' }
  ]
};

const Sidebar = ({ role, children, onLogout, headerSpacing }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userInfoRef = useRef(null);
  const navigate = useNavigate();
  const { getTranslatedPath } = useLanguageRouting();

  // Debug user data changes
  useEffect(() => {
    console.log('Sidebar: User data updated:', {
      firstName: user?.firstName,
      lastName: user?.lastName,
      profilePic: user?.profilePic,
      hasProfilePic: !!user?.profilePic
    });
  }, [user]);

  const handleToggle = () => setOpen(o => !o);
  const handleClose = () => setOpen(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Force re-render when language changes
  useEffect(() => {
    // This will trigger a re-render when the language changes
  }, [i18n.language]);

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
        navigate(getTranslatedPath('/profile'));
        break;
      case 'settings':
        navigate(getTranslatedPath('/account-settings'));
        break;
      case 'logout':
        onLogout();
        break;
      default:
        break;
    }
  };

  const refugeeNavItems = [
    { to: getTranslatedPath('/dashboard'), label: 'navigation.dashboard' },
    { to: getTranslatedPath('/courses'), label: 'navigation.courses' },
    { to: getTranslatedPath('/jobs'), label: 'navigation.jobs' },
    { to: getTranslatedPath('/certificates'), label: 'navigation.certificates' },
    { to: getTranslatedPath('/help'), label: 'navigation.help' }
  ];

  const instructorNavItems = [
    { to: '/instructor/dashboard', label: 'navigation.dashboard' },
    { to: '/instructor/courses', label: 'navigation.manageCourses' },
    { to: '/instructor/quizzes', label: 'Quizzes' },
    { to: '/instructor/help', label: 'navigation.help' }
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'navigation.dashboard' },
    { to: '/admin/users', label: 'navigation.users' },
    { to: '/admin/approvals', label: 'navigation.approvals' },
    { to: '/admin/help', label: 'navigation.help' }
  ];

  const employerNavItems = [
    { to: '/employer/dashboard', label: 'navigation.dashboard' },
    { to: '/employer/jobs', label: 'navigation.jobs' },
    { to: '/employer/scholarships', label: 'navigation.scholarships' },
    { to: '/employer/notifications', label: 'navigation.notifications' }
  ];

  // Map roles to their navigation items
  const navigationItems = {
    refugee: refugeeNavItems,
    instructor: instructorNavItems,
    admin: adminNavItems,
    employer: employerNavItems
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
            {(navigationItems[role] || []).map(link => (
              <div key={link.to}>
                <StyledNavLink 
                  to={link.to}
                  onMouseEnter={() => {
                    // Start preloading when user hovers over navigation items
                    const pageType = link.to.split('/')[1] || 'dashboard';
                    preloader.preloadPageData(pageType);
                  }}
                >
                  {t(link.label)}
                </StyledNavLink>
              </div>
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
                  <img 
                    src={user.profilePic} 
                    alt="Profile" 
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.log('Sidebar profile image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Sidebar profile image loaded successfully:', user.profilePic);
                    }}
                  />
                ) : (
                  ((user?.firstName || user?.lastName) ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U')
                )}
              </UserAvatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserName>{user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</UserName>
                <UserRole>{t(`roles.${role}`, role?.charAt(0).toUpperCase() + role?.slice(1))}</UserRole>
              </div>
            </UserInfoSection>
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                left: 0,
                right: 'auto',
                marginLeft: 12,
                paddingLeft: 8,
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
                boxSizing: 'border-box',
                maxWidth: 'calc(100vw - 32px)',
                ...(window.innerWidth <= 600 ? { left: 0, marginLeft: 12, right: 'auto' } : {}),
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      color: '#000',
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}>
                      {user?.profilePic ? (
                        <img 
                          src={user.profilePic} 
                          alt="Profile" 
                          crossOrigin="anonymous"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.log('Dropdown profile image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        ((user?.firstName || user?.lastName) ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U')
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#111', fontSize: '1.08rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                        {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.95rem', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                        {t(`roles.${role}`, role?.charAt(0).toUpperCase() + role?.slice(1))}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#666'
                }} onClick={() => handleMenuItemClick('profile')}>
                  <span style={{ fontSize: '1rem', width: 16, textAlign: 'center' }}>👤</span> {t('profile.editProfile', 'Edit Profile')}
                </div>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#666'
                }} onClick={() => handleMenuItemClick('settings')}>
                  <span style={{ fontSize: '1rem', width: 16, textAlign: 'center' }}>⚙️</span> {t('profile.accountSettings', 'Account Settings')}
                </div>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#e74c3c'
                }} onClick={() => handleMenuItemClick('logout')}>
                  <span style={{ fontSize: '1rem', width: 16, textAlign: 'center' }}>🚪</span> {t('profile.logout', 'Logout')}
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