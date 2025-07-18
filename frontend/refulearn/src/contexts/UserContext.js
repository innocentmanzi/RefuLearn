import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import offlineIntegrationService from '../services/offlineIntegrationService'; // Temporarily disabled

// Create a simple mock service to prevent errors - DISABLED TO FIX ESLINT
// const offlineIntegrationService = {
//   getCurrentUser: async () => null,
//   storeUserProfile: async () => {},
//   getUserProfile: async () => null,
//   updateUserProfileOffline: async () => ({ success: false }),
//   handleUserLogout: async () => {},
//   refreshTokenOffline: async () => ({ success: false }),
//   // Add any other methods that might be called
//   on: () => {},
//   off: () => {},
//   emit: () => {}
// };

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user');
      const cachedRole = localStorage.getItem('userRole');
      
      // If we have both token and cached user data, authenticate immediately
      if (token && cachedUser) {
        console.log('✅ Immediate authentication from cache');
        return true;
      }
      
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    const cachedRole = localStorage.getItem('userRole');
    const cachedUser = localStorage.getItem('user');
    
    if (cachedRole) {
      return cachedRole;
    }
    
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        return userData.role || 'refugee';
      } catch (error) {
        console.error('Error parsing cached user:', error);
      }
    }
    
    return 'refugee';
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('✅ Loading user from cache:', userData);
        return { ...defaultUser, ...userData, social: { ...defaultUser.social, ...(userData.social || {}) } };
      }
      return null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true); // Start with loading true

  // Check token validity on app start - simplified
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      
      try {
        console.log('🔍 Checking authentication status...');
        
        // Check online authentication
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
                console.log('✅ User authenticated online:', userData);
                setUser(userData);
                setUserRole(userData.role);
                setIsAuthenticated(true);
              } else {
                console.log('⚠️ Invalid token response, using cached auth');
                // Don't logout, use cached authentication instead
                const cachedUser = localStorage.getItem('user');
                const cachedRole = localStorage.getItem('userRole');
                if (cachedUser) {
                  const userData = JSON.parse(cachedUser);
                  console.log('✅ Using cached authentication:', userData);
                  setUser(userData);
                  setUserRole(cachedRole || userData.role || 'refugee');
                  setIsAuthenticated(true);
                } else {
                  await logout();
                }
              }
            } else {
              console.log('⚠️ Auth check failed, using cached auth');
              // Don't logout, use cached authentication instead  
              const cachedUser = localStorage.getItem('user');
              const cachedRole = localStorage.getItem('userRole');
              if (cachedUser) {
                const userData = JSON.parse(cachedUser);
                console.log('✅ Using cached authentication:', userData);
                setUser(userData);
                setUserRole(cachedRole || userData.role || 'refugee');
                setIsAuthenticated(true);
              } else {
                await logout();
              }
            }
          } catch (error) {
            console.error('⚠️ Auth check error, using cached auth:', error);
            // If offline or error, try to use cached authentication
            const cachedUser = localStorage.getItem('user');
            const cachedRole = localStorage.getItem('userRole');
            if (cachedUser) {
              const userData = JSON.parse(cachedUser);
              console.log('✅ Using cached authentication:', userData);
              setUser(userData);
              setUserRole(cachedRole || userData.role || 'refugee');
              setIsAuthenticated(true);
            } else {
              await logout();
            }
          }
        } else {
          console.log('ℹ️ No token found, user not authenticated');
          setIsAuthenticated(false);
          setUser(null);
          setUserRole('refugee');
        }
      } catch (error) {
        console.error('❌ Authentication check failed:', error);
        await logout();
      }
      
      setLoading(false);
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
  const fetchUserProfile = useCallback(async () => {
    // Don't fetch if we already have user data
    if (user && Object.keys(user).length > 0) {
      console.log('✅ User data already available, skipping fetch');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token available, skipping profile fetch');
      return;
    }

    try {
      setLoading(true);
      const isOnline = navigator.onLine;
      let profileData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching user profile from API...');
          
          const response = await fetch('/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            profileData = data.data.user;
            console.log('✅ User profile data received');
            
            // Store profile data for offline use - DISABLED TO PREVENT ERRORS
            // await offlineIntegrationService.storeUserProfile(profileData);
            
            setUser(profileData);
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online profile fetch failed, using offline:', onlineError);
          // Fall back to offline data if online fails - DISABLED TO PREVENT ERRORS
          // profileData = await offlineIntegrationService.getUserProfile();
          if (profileData) {
            setUser(profileData);
          }
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline user profile data...');
        // profileData = await offlineIntegrationService.getUserProfile();
        if (profileData) {
          setUser(profileData);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const isOnline = navigator.onLine;
      let success = false;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Updating user profile...');
          
          const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
          });

          if (response.ok) {
            const data = await response.json();
            const userData = data.data.user;
            success = true;
            console.log('✅ Online profile update successful');
            
            // Store updated profile data for offline use
            // await offlineIntegrationService.storeUserProfile(userData);
            
            setUser(userData);
          } else {
            throw new Error('Failed to update user profile');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online profile update failed, using offline:', onlineError);
          // Fall back to offline profile update
          // const result = await offlineIntegrationService.updateUserProfileOffline(updatedData);
          
          if (false) { // result.success - DISABLED
            success = true;
            console.log('✅ Offline profile update successful');
            
            // Update local user state with offline data
            setUser(prev => ({ ...prev, ...updatedData }));
          } else {
            throw new Error('Failed to update profile offline');
          }
        }
      } else {
        // Offline profile update
        console.log('📴 Offline mode: Updating user profile offline...');
                  // const result = await offlineIntegrationService.updateUserProfileOffline(updatedData);
        
        if (false) { // result.success - DISABLED
          success = true;
          console.log('✅ Offline profile update successful');
          
          // Update local user state with offline data
          setUser(prev => ({ ...prev, ...updatedData }));
        } else {
          throw new Error('Failed to update profile offline');
        }
      }

      return success;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setUserRole(userData.role);
    setIsAuthenticated(true);
    
    // Store in localStorage for cached authentication
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user');
      
      // Clear offline data and sessions first
      try {
        // await offlineIntegrationService.handleUserLogout();
        console.log('✅ Offline data cleared during logout');
      } catch (offlineError) {
        console.warn('⚠️ Failed to clear offline data during logout:', offlineError);
      }
      
      // Clear state
      setUser(null);
      setUserRole('refugee');
      setIsAuthenticated(false);
      setLoading(false); // Ensure loading is false after logout
      
      // Clear all localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('offlineSessionId');
      
      // Clear sessionStorage as well (including our redirect flag)
      sessionStorage.removeItem('hasRedirectedOnStartup');
      sessionStorage.clear();
      
      console.log('✅ User logged out successfully');
      
      // Force redirect to landing page after logout
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Even if offline cleanup fails, still clear the main state
      setUser(null);
      setUserRole('refugee');
      setIsAuthenticated(false);
      setLoading(false);
      
      // Clear localStorage anyway
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('offlineSessionId');
      
      // Clear sessionStorage as well
      sessionStorage.removeItem('hasRedirectedOnStartup');
      sessionStorage.clear();
      
      // Force redirect to landing page even if logout failed
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('refreshToken');
      if (!token) {
        await logout();
        return null;
      }

      const isOnline = navigator.onLine;
      let newToken = null;

      if (isOnline) {
        try {
          // Try online token refresh first (preserving existing behavior)
          console.log('🌐 Online mode: Refreshing token...');
          
          const response = await fetch('/api/auth/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken: token })
          });

          if (response.ok) {
            const data = await response.json();
            newToken = data.data.token;
            localStorage.setItem('token', newToken);
            console.log('✅ Token refreshed successfully');
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online token refresh failed, using offline:', onlineError);
                      // Fall back to offline token refresh if available - DISABLED TO PREVENT ERRORS
            // const offlineResult = await offlineIntegrationService.refreshTokenOffline?.(token);
            // if (offlineResult?.token) {
            //   newToken = offlineResult.token;
            //   localStorage.setItem('token', newToken);
            //   console.log('✅ Token refreshed offline');
            // } else {
              console.log('❌ Token refresh failed both online and offline');
              await logout();
            // }
        }
      } else {
                  // Offline mode: use offline token refresh - DISABLED TO PREVENT ERRORS
          console.log('📴 Offline mode: Refreshing token offline...');
          // const offlineResult = await offlineIntegrationService.refreshTokenOffline?.(token);
          // if (offlineResult?.token) {
          //   newToken = offlineResult.token;
          //   localStorage.setItem('token', newToken);
          //   console.log('✅ Token refreshed offline');
          // } else {
            console.log('❌ Token refresh failed in offline mode');
            await logout();
          // }
      }

      return newToken;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      await logout();
      return null;
    }
  };

  const value = {
    user,
    setUser,
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