import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ProfileContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfilePhoto = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  ${props => props.upwards ? 'bottom: 100%;' : 'top: 100%;'}
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  width: 220px;
  max-width: 90vw;
  z-index: 1000;
  margin-bottom: ${props => props.upwards ? '0.5rem' : '0'};
  margin-top: ${props => props.upwards ? '0' : '0.5rem'};
  overflow: hidden;
  border: 1px solid #e0e0e0;

  @media (max-width: 600px) {
    left: 50%;
    transform: translateX(-50%);
    width: 95vw;
    min-width: unset;
    max-width: 95vw;
  }
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #333;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
  
  &.logout {
    color: #dc3545;
    border-top: 1px solid #e0e0e0;
    
    &:hover {
      background-color: #fff5f5;
    }
  }
`;

const UserInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const UserRole = styled.div`
  color: #666;
  font-size: 0.8rem;
  text-transform: capitalize;
`;

const Icon = styled.span`
  font-size: 1rem;
  width: 16px;
  text-align: center;
`;

const ProfileDropdown = ({ user, onLogout, role, upwards }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action) => {
    setIsOpen(false);
    
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/account-settings');
        break;
      case 'logout':
        onLogout();
        break;
      default:
        break;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      refugee: 'Refugee',
      instructor: 'Instructor',
      admin: 'Admin',
      employer: 'Employer'
    };
    return roleNames[role] || role;
  };

  return (
    <ProfileContainer ref={dropdownRef}>
      <ProfilePhoto onClick={handleProfileClick}>
        {user?.profilePic ? (
          <img 
            src={(() => {
              if (user.profilePic) {
                // Convert Windows backslashes to forward slashes
                const normalizedPath = user.profilePic.replace(/\\/g, '/');
                
                if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
                  return normalizedPath;
                } else if (normalizedPath.startsWith('/uploads/')) {
                  return normalizedPath;
                } else if (normalizedPath.startsWith('uploads/')) {
                  return `/${normalizedPath}`;
                } else {
                  return `/uploads/${normalizedPath}`;
                }
              }
              return user.profilePic;
            })()} 
            alt="Profile" 
            onError={(e) => {
              console.log('Profile image failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
        ) : (
          getInitials(user?.firstName + ' ' + user?.lastName)
        )}
      </ProfilePhoto>
      
      {isOpen && (
        <DropdownMenu upwards={upwards}>
          <UserInfo>
            <UserName>
              {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
            </UserName>
            <UserRole>{getRoleDisplayName(role)}</UserRole>
          </UserInfo>
          
          <DropdownItem onClick={() => handleMenuItemClick('profile')}>
            <Icon>👤</Icon>
            Edit Profile
          </DropdownItem>
          
          <DropdownItem onClick={() => handleMenuItemClick('settings')}>
            <Icon>⚙️</Icon>
            Account Settings
          </DropdownItem>
          
          <DropdownItem 
            className="logout" 
            onClick={() => handleMenuItemClick('logout')}
          >
            <Icon>🚪</Icon>
            Logout
          </DropdownItem>
        </DropdownMenu>
      )}
    </ProfileContainer>
  );
};

export default ProfileDropdown; 