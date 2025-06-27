import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@email.com',
  profilePic: null,
  role: 'refugee',
  social: {
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
  },
  interests: [],
  summary: '',
  experiences: [],
  education: [],
  languages: [],
  skills: [],
  certificates: [],
  country: '',
  city: '',
};

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to get user data from localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? { ...defaultUser, ...JSON.parse(savedUser), social: { ...defaultUser.social, ...(JSON.parse(savedUser).social || {}) } } : defaultUser;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'refugee';
  });

  // Update localStorage when user data changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('userRole', userRole);
  }, [user, isAuthenticated, userRole]);

  const updateUser = (newUserData) => {
    setUser(prev => ({
      ...defaultUser,
      ...prev,
      ...newUserData,
      social: {
        ...defaultUser.social,
        ...(prev.social || {}),
        ...(newUserData.social || {}),
      },
    }));
  };

  const login = (userData, role) => {
    setUser({ ...defaultUser, ...userData, social: { ...defaultUser.social, ...(userData.social || {}) } });
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(defaultUser);
    setUserRole('refugee');
    setIsAuthenticated(false);
    localStorage.clear();
  };

  const value = {
    user,
    updateUser,
    isAuthenticated,
    userRole,
    login,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 