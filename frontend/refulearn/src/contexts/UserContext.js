import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultUser = {
  firstName: '',
  lastName: '',
  email: '',
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

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to get user data from localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? { ...defaultUser, ...JSON.parse(savedUser), social: { ...defaultUser.social, ...(JSON.parse(savedUser).social || {}) } } : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'refugee';
  });

  const [loading, setLoading] = useState(false);

  // Check token validity on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const userData = {
                ...data.data.user,
                role: data.data.user.role || 'refugee',
                profilePic: data.data.user.profilePic || null
              };
              console.log('🔍 User data from /api/auth/me:', userData);
              console.log('🔍 User ID fields - _id:', userData._id, 'id:', userData.id);
              setUser(userData);
              setUserRole(userData.role);
              setIsAuthenticated(true);
            } else {
              // Token is invalid, clear everything
              logout();
            }
          } else {
            // Token is invalid, clear everything
            logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
    };

    checkAuthStatus();
  }, []);

  // Update localStorage when user data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('userRole', userRole);
  }, [user, isAuthenticated, userRole]);

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data.user;
        setUser(userData);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile in backend
  const updateUserProfile = async (profileData) => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
              const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
        });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data.user;
        setUser(prevUser => ({ ...prevUser, ...userData }));
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, message: 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setUserRole(userData.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setUserRole('refugee');
    setIsAuthenticated(false);
    
    // Clear all localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    updateUserProfile,
    isAuthenticated,
    userRole,
    login,
    logout,
    refreshToken,
    loading,
    setLoading,
    fetchUserProfile,
    token: localStorage.getItem('token'),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 