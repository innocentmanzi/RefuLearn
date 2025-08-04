import CryptoJS from 'crypto-js';

class OfflineAuthManager {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.authDatabase = null;
    this.pendingRegistrations = [];
    this.eventListeners = new Map();
    this.secretKey = 'RefuLearn_Offline_2024'; // In production, use environment variable
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    console.log('🔐 OfflineAuthManager initialized');
  }

  // Initialize the offline authentication system
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing OfflineAuthManager...');
      
      // Initialize IndexedDB for user storage
      await this.initializeAuthDatabase();
      
      // Load current session
      await this.loadCurrentSession();
      
      // Setup session management
      this.setupSessionManagement();
      
      this.isInitialized = true;
      console.log('✅ OfflineAuthManager initialization complete');
      
      this.emit('initialized');
    } catch (error) {
      console.error('❌ OfflineAuthManager initialization failed:', error);
      throw error;
    }
  }

  // Initialize IndexedDB for authentication
  async initializeAuthDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RefuLearnOfflineAuth', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('username', 'username', { unique: true });
          usersStore.createIndex('role', 'role', { unique: false });
          usersStore.createIndex('isActive', 'isActive', { unique: false });
        }
        
        // Create sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('userId', 'userId', { unique: false });
          sessionsStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
        
        // Create pending actions store
        if (!db.objectStoreNames.contains('pendingActions')) {
          const pendingStore = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
          pendingStore.createIndex('type', 'type', { unique: false });
          pendingStore.createIndex('userId', 'userId', { unique: false });
          pendingStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.authDatabase = event.target.result;
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // Load current session
  async loadCurrentSession() {
    try {
      const sessionId = localStorage.getItem('offlineSessionId');
      if (!sessionId) return;
      
      const session = await this.getSession(sessionId);
      if (session && session.expiresAt > Date.now()) {
        const user = await this.getUserById(session.userId);
        if (user) {
          this.currentUser = user;
          this.emit('userLoggedIn', user);
        }
      } else {
        // Clean up expired session
        localStorage.removeItem('offlineSessionId');
      }
    } catch (error) {
      console.error('Failed to load current session:', error);
    }
  }

  // Setup session management
  setupSessionManagement() {
    // Check session validity periodically
    setInterval(() => {
      this.validateCurrentSession();
    }, 60000); // Check every minute
    
    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.validateCurrentSession();
      }
    });
  }

  // Validate current session
  async validateCurrentSession() {
    if (!this.currentUser) return;
    
    const sessionId = localStorage.getItem('offlineSessionId');
    if (!sessionId) {
      await this.logout();
      return;
    }
    
    const session = await this.getSession(sessionId);
    if (!session || session.expiresAt <= Date.now()) {
      await this.logout();
    }
  }

  // Register new user (offline)
  async register(userData) {
    try {
      const { email, password, firstName, lastName, role = 'refugee' } = userData;
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        throw new Error('All fields are required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create user object
      const user = {
        email,
        username: email, // Use email as username
        firstName,
        lastName,
        role,
        passwordHash: this.hashPassword(password),
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isOfflineCreated: true,
        syncStatus: 'pending'
      };
      
      // Store user in IndexedDB
      const userId = await this.storeUser(user);
      user.id = userId;
      
      // Queue for sync when online
      await this.queuePendingAction({
        type: 'register',
        data: {
          ...userData,
          userId,
          timestamp: Date.now()
        }
      });
      
      console.log('✅ User registered offline:', email);
      this.emit('userRegistered', user);
      
      return {
        success: true,
        user: this.sanitizeUser(user),
        message: 'Registration successful. Account will be synced when online.'
      };
      
    } catch (error) {
      console.error('❌ Offline registration failed:', error);
      throw error;
    }
  }

  // Login user (offline)
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Validate credentials
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Get user by email
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      if (!this.verifyPassword(password, user.passwordHash)) {
        throw new Error('Invalid email or password');
      }
      
      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is disabled');
      }
      
      // Create session
      const session = await this.createSession(user.id);
      
      // Set current user
      this.currentUser = user;
      
      // Store session ID
      localStorage.setItem('offlineSessionId', session.id);
      
      // Update localStorage for compatibility
      localStorage.setItem('user', JSON.stringify(this.sanitizeUser(user)));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('isAuthenticated', 'true');
      
      console.log('✅ User logged in offline:', email);
      this.emit('userLoggedIn', user);
      
      return {
        success: true,
        user: this.sanitizeUser(user),
        accessToken: session.token,
        message: 'Login successful'
      };
      
    } catch (error) {
      console.error('❌ Offline login failed:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      const sessionId = localStorage.getItem('offlineSessionId');
      if (sessionId) {
        await this.deleteSession(sessionId);
      }
      
      // Clear current user
      this.currentUser = null;
      
      // Clear localStorage
      localStorage.removeItem('offlineSessionId');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      console.log('✅ User logged out');
      this.emit('userLoggedOut');
      
      return {
        success: true,
        message: 'Logout successful'
      };
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser ? this.sanitizeUser(this.currentUser) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get user role
  getUserRole() {
    return this.currentUser ? this.currentUser.role : null;
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const updatedUser = {
        ...this.currentUser,
        ...updates,
        updatedAt: Date.now()
      };
      
      // Update in database
      await this.updateUser(updatedUser);
      
      // Update current user
      this.currentUser = updatedUser;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(this.sanitizeUser(updatedUser)));
      
      // Queue for sync
      await this.queuePendingAction({
        type: 'updateProfile',
        data: {
          userId: updatedUser.id,
          updates,
          timestamp: Date.now()
        }
      });
      
      console.log('✅ Profile updated offline');
      this.emit('profileUpdated', updatedUser);
      
      return {
        success: true,
        user: this.sanitizeUser(updatedUser)
      };
      
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Verify current password
      if (!this.verifyPassword(currentPassword, this.currentUser.passwordHash)) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      const updatedUser = {
        ...this.currentUser,
        passwordHash: this.hashPassword(newPassword),
        updatedAt: Date.now()
      };
      
      await this.updateUser(updatedUser);
      this.currentUser = updatedUser;
      
      // Queue for sync
      await this.queuePendingAction({
        type: 'changePassword',
        data: {
          userId: updatedUser.id,
          timestamp: Date.now()
        }
      });
      
      console.log('✅ Password changed offline');
      this.emit('passwordChanged');
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
      
    } catch (error) {
      console.error('❌ Password change failed:', error);
      throw error;
    }
  }

  // Database operations
  async storeUser(user) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(user);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(user) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createSession(userId) {
    const session = {
      id: this.generateSessionId(),
      userId,
      token: this.generateAccessToken(),
      createdAt: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.add(session);
      
      request.onsuccess = () => resolve(session);
      request.onerror = () => reject(request.error);
    });
  }

  async getSession(sessionId) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.get(sessionId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(sessionId) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.delete(sessionId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Queue pending action for sync
  async queuePendingAction(action) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.add({
        ...action,
        createdAt: Date.now(),
        syncStatus: 'pending'
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending actions
  async getPendingActions() {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync with server when online
  async syncWithServer() {
    try {
      if (!navigator.onLine) {
        console.log('⚠️ Cannot sync - offline');
        return;
      }
      
      console.log('🔄 Starting auth sync with server...');
      
      const pendingActions = await this.getPendingActions();
      
      for (const action of pendingActions) {
        try {
          await this.processPendingAction(action);
        } catch (error) {
          console.error('Failed to process pending action:', error);
        }
      }
      
      console.log('✅ Auth sync completed');
      this.emit('syncCompleted');
      
    } catch (error) {
      console.error('❌ Auth sync failed:', error);
      this.emit('syncFailed', error);
    }
  }

  // Process pending action
  async processPendingAction(action) {
    const { type, data } = action;
    
    switch (type) {
      case 'register':
        await this.syncRegistration(data);
        break;
      case 'updateProfile':
        await this.syncProfileUpdate(data);
        break;
      case 'changePassword':
        await this.syncPasswordChange(data);
        break;
      default:
        console.warn('Unknown pending action type:', type);
    }
    
    // Mark as processed
    await this.markActionProcessed(action.id);
  }

  // Sync registration with server
  async syncRegistration(data) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update user with server ID
        const user = await this.getUserById(data.userId);
        if (user) {
          user.serverId = result.data.user.id;
          user.syncStatus = 'synced';
          await this.updateUser(user);
        }
      }
    } catch (error) {
      console.error('Failed to sync registration:', error);
    }
  }

  // Sync profile update with server
  async syncProfileUpdate(data) {
    try {
      const user = await this.getUserById(data.userId);
      if (user && user.serverId) {
        await fetch(`/api/users/${user.serverId}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.updates)
        });
      }
    } catch (error) {
      console.error('Failed to sync profile update:', error);
    }
  }

  // Sync password change with server
  async syncPasswordChange(data) {
    try {
      const user = await this.getUserById(data.userId);
      if (user && user.serverId) {
        await fetch(`/api/users/${user.serverId}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'updated' }) // Don't send actual password
        });
      }
    } catch (error) {
      console.error('Failed to sync password change:', error);
    }
  }

  // Mark action as processed
  async markActionProcessed(actionId) {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.delete(actionId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility functions
  hashPassword(password) {
    return CryptoJS.SHA256(password + this.secretKey).toString();
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateAccessToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }

  sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  // Event emitter functionality
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Get all users (admin function)
  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const transaction = this.authDatabase.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const users = request.result.map(user => this.sanitizeUser(user));
        resolve(users);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all offline data
  async clearAllData() {
    try {
      await this.logout();
      
      if (this.authDatabase) {
        this.authDatabase.close();
      }
      
      // Delete the entire database
      const deleteRequest = indexedDB.deleteDatabase('RefuLearnOfflineAuth');
      deleteRequest.onsuccess = () => {
        console.log('✅ Offline auth data cleared');
      };
      
      // Reinitialize
      await this.initialize();
      
    } catch (error) {
      console.error('❌ Failed to clear offline auth data:', error);
    }
  }

  // Destroy instance
  destroy() {
    if (this.authDatabase) {
      this.authDatabase.close();
    }
    this.eventListeners.clear();
    console.log('🧹 OfflineAuthManager destroyed');
  }
}

// Create singleton instance
const offlineAuthManager = new OfflineAuthManager();

export default offlineAuthManager; 