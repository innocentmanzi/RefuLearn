import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

// const UserList = styled.div`
//   margin-top: 1.5rem;
// `;

const UserCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

// const UserHeader = styled(UserCard)`
//   background: #f8f9fa;
//   font-weight: 600;
//   color: #666;
//   border-radius: 8px 8px 0 0;

//   @media (max-width: 992px) {
//     display: none;
//   }
// `;

// const UserInfo = styled.div`
//   @media (max-width: 992px) {
//     display: flex;
//     &::before {
//       content: attr(data-label);
//       font-weight: bold;
//       width: 100px;
//       min-width: 100px;
//       display: inline-block;
//     }
//   }
// `;

// const CheckboxContainer = styled.div`
//   @media (max-width: 992px) {
//     position: absolute;
//     top: 1rem;
//     left: 1rem;
//   }
// `;

// const ActionButtons = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 0.5rem;
//   justify-content: flex-start;

//   @media (max-width: 992px) {
//     margin-top: 0.5rem;
//     &::before {
//       content: 'Actions: ';
//       font-weight: bold;
//       width: 100px;
//       min-width: 100px;
//       display: inline-block;
//     }
//   }
// `;

const ActionButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
    opacity: 1;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.3em 0.8em;
  border-radius: 12px;
  font-size: 0.95em;
  font-weight: 500;
  color: #fff;
  background: #007bff;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;
const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8f9fa;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
  background: #eee;
`;
const ProfileInitials = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #bbb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  margin-right: 0.75rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const PendingIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffc107;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const UserCardOverlay = styled.div`
  position: relative;
  opacity: ${props => props.pending ? 0.7 : 1};
  pointer-events: ${props => props.pending ? 'none' : 'auto'};
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const PendingActionsIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff3cd;
  color: #856404;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-left: 1rem;
  border: 1px solid #ffeaa7;
`;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [detailsModal, setDetailsModal] = useState({ open: false, user: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, user: null, bulk: false });
  const [saveLoading, setSaveLoading] = useState(false);
  
  // New state for optimistic updates
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Set());
  const [pendingActions, setPendingActions] = useState(new Map());
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      
      const isOnline = navigator.onLine;
      let usersData = [];
      let paginationData = { totalPages: 1, totalUsers: 0 };

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching admin users from API...');
          
          let url = `/api/admin/users?page=${page}&limit=10`;
          if (roleFilter !== 'all') url += `&role=${roleFilter}`;
          if (statusFilter !== 'all') url += `&status=${statusFilter}`;
          if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          const data = await res.json();
          if (data.success) {
            usersData = data.data.users || [];
            paginationData = data.data.pagination || { totalPages: 1, totalUsers: 0 };
            
            // Store users data for offline use
            await offlineIntegrationService.storeAdminUsers(usersData);
            console.log('✅ Admin users data stored for offline use');
          } else {
            throw new Error(data.message || 'Failed to fetch users');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          
          // Fall back to offline data if online fails
          usersData = await offlineIntegrationService.getAdminUsers() || [];
          
          if (!usersData || usersData.length === 0) {
            throw onlineError;
          }
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline admin users data...');
        usersData = await offlineIntegrationService.getAdminUsers() || [];
      }

      try {
        setUsers(usersData || []);
        setTotalPages(paginationData?.totalPages || 1);
        setTotalUsers(paginationData?.totalUsers || (usersData?.length || 0));
      } catch (err) {
        console.error('❌ Error setting users data:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, roleFilter, statusFilter, searchTerm]);

  const closeDetailsModal = () => setDetailsModal({ open: false, user: null });
  const openConfirmDialog = (action, user, bulk = false) => setConfirmDialog({ open: true, action, user, bulk });
  const closeConfirmDialog = () => setConfirmDialog({ open: false, action: null, user: null, bulk: false });

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    openConfirmDialog(action, null, true);
  };

  // Optimistic update helper
  const updateUserOptimistically = (userId, updates) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId ? { ...user, ...updates } : user
      )
    );
  };

  // Rollback helper
  const rollbackUserUpdate = (userId, originalData) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId ? { ...user, ...originalData } : user
      )
    );
  };

  // Check if user has pending actions
  const hasPendingAction = (userId) => {
    return Array.from(pendingActions.values()).some(action => 
      action.userId === userId || 
      (action.type === 'bulk' && action.users.includes(userId))
    );
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleConfirm = async () => {
    if (confirmDialog.bulk) {
      // Handle bulk actions with optimistic updates
      const actionId = `bulk_${Date.now()}`;
      setPendingActions(prev => new Map(prev).set(actionId, { type: 'bulk', action: confirmDialog.action, users: selectedUsers }));
      
      // Store original states for rollback
      const originalStates = new Map();
      selectedUsers.forEach(userId => {
        const user = users.find(u => u._id === userId);
        if (user) {
          originalStates.set(userId, { isActive: user.isActive });
        }
      });

      // Optimistic update
      const newStatus = confirmDialog.action === 'deactivate' ? false : true;
      selectedUsers.forEach(userId => {
        updateUserOptimistically(userId, { isActive: newStatus });
      });

      const isOnline = navigator.onLine;
      
      try {
        if (isOnline) {
          console.log('🌐 Online mode: Performing bulk user actions...');
          
          // Perform actual API calls
          const promises = selectedUsers.map(userId => 
            fetch(`/api/admin/users/${userId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ isActive: newStatus })
            })
          );

          const results = await Promise.all(promises);
          const failedUpdates = [];

          results.forEach((res, index) => {
            if (!res.ok) {
              failedUpdates.push(selectedUsers[index]);
            }
          });

          if (failedUpdates.length > 0) {
            // Rollback failed updates
            failedUpdates.forEach(userId => {
              const original = originalStates.get(userId);
              if (original) {
                rollbackUserUpdate(userId, original);
              }
            });
            showToast(`${failedUpdates.length} users failed to update. Changes reverted.`, 'error');
          } else {
            showToast(`${selectedUsers.length} users ${confirmDialog.action}d successfully`);
          }

          setSelectedUsers([]);
        } else {
          // Offline mode: queue actions for sync
          console.log('📴 Offline mode: Queuing bulk user actions for sync...');
          
          for (const userId of selectedUsers) {
            await offlineIntegrationService.queueAdminUserAction({
              action: 'update_status',
              userId: userId,
              isActive: newStatus
            });
          }
          
          showToast(`Bulk ${confirmDialog.action} actions queued for sync when online`);
          setSelectedUsers([]);
        }
      } catch (err) {
        console.warn('⚠️ Bulk action failed, queuing for offline sync:', err);
        
        // Queue actions for offline sync
        for (const userId of selectedUsers) {
          await offlineIntegrationService.queueAdminUserAction({
            action: 'update_status',
            userId: userId,
            isActive: newStatus
          });
        }
        
        showToast(`Bulk ${confirmDialog.action} actions queued for sync when online`);
        setSelectedUsers([]);
      } finally {
        setPendingActions(prev => {
          const newMap = new Map(prev);
          newMap.delete(actionId);
          return newMap;
        });
      }
    } else {
      // Handle single user action with optimistic update
      const userId = confirmDialog.user._id;
      const actionId = `single_${userId}_${Date.now()}`;
      setPendingActions(prev => new Map(prev).set(actionId, { type: 'single', action: confirmDialog.action, userId }));

      // Store original state for rollback
      const originalState = { isActive: confirmDialog.user.isActive };

      // Optimistic update
      const newStatus = confirmDialog.action === 'deactivate' ? false : true;
      updateUserOptimistically(userId, { isActive: newStatus });

      const isOnline = navigator.onLine;
      
      try {
        if (isOnline) {
          console.log('🌐 Online mode: Performing single user action...');
          
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: newStatus })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`User ${confirmDialog.action}d successfully`);
          } else {
            // Rollback on failure
            rollbackUserUpdate(userId, originalState);
            showToast(data.message || 'Failed to update user', 'error');
          }
        } else {
          // Offline mode: queue action for sync
          console.log('📴 Offline mode: Queuing single user action for sync...');
          
          await offlineIntegrationService.queueAdminUserAction({
            action: 'update_status',
            userId: userId,
            isActive: newStatus
          });
          
          showToast(`User ${confirmDialog.action} action queued for sync when online`);
        }
      } catch (err) {
        console.warn('⚠️ Single action failed, queuing for offline sync:', err);
        
        // Queue action for offline sync
        await offlineIntegrationService.queueAdminUserAction({
          action: 'update_status',
          userId: userId,
          isActive: newStatus
        });
        
        showToast(`User ${confirmDialog.action} action queued for sync when online`);
      } finally {
        setPendingActions(prev => {
          const newMap = new Map(prev);
          newMap.delete(actionId);
          return newMap;
        });
      }
    }
    closeConfirmDialog();
  };

  const handleSaveChanges = async () => {
    if (!detailsModal.user) return;
    
    const userId = detailsModal.user._id;
    const actionId = `save_${userId}_${Date.now()}`;
    setPendingActions(prev => new Map(prev).set(actionId, { type: 'save', userId }));
    
    setSaveLoading(true);
    setError('');
    
    // Store original state for rollback
    const originalState = {
      role: users.find(u => u._id === userId)?.role,
      isActive: users.find(u => u._id === userId)?.isActive
    };

    // Optimistic update
    updateUserOptimistically(userId, {
      role: detailsModal.user.role,
      isActive: detailsModal.user.isActive
    });

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: detailsModal.user.role,
          isActive: detailsModal.user.isActive
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('User updated successfully');
        setTimeout(() => {
          closeDetailsModal();
        }, 1500);
      } else {
        // Rollback on failure
        rollbackUserUpdate(userId, originalState);
        showToast(data.message || 'Failed to update user', 'error');
      }
    } catch (err) {
      // Rollback on network error
      rollbackUserUpdate(userId, originalState);
      showToast('Network error occurred. Changes reverted.', 'error');
    } finally {
      setSaveLoading(false);
      setPendingActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(actionId);
        return newMap;
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const actionId = `delete_${userId}_${Date.now()}`;
    setPendingActions(prev => new Map(prev).set(actionId, { type: 'delete', userId }));

    // Store original user for rollback
    const originalUser = users.find(u => u._id === userId);
    
    // Optimistic update - remove user from list
    setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    setTotalUsers(prev => prev - 1);

    const isOnline = navigator.onLine;
    
    try {
      if (isOnline) {
        console.log('🌐 Online mode: Deleting user...');
        
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        const data = await res.json();
        if (data.success) {
          showToast('User deleted successfully');
          // Remove from selected users if present
          setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
          // Rollback on failure
          setUsers(prevUsers => [...prevUsers, originalUser]);
          setTotalUsers(prev => prev + 1);
          showToast(data.message || 'Failed to delete user', 'error');
        }
      } else {
        // Offline mode: queue action for sync
        console.log('📴 Offline mode: Queuing user deletion for sync...');
        
        await offlineIntegrationService.queueAdminUserAction({
          action: 'delete',
          userId: userId
        });
        
        showToast('User deletion queued for sync when online');
      }
    } catch (err) {
      console.warn('⚠️ Delete failed, queuing for offline sync:', err);
      
      // Queue action for offline sync
      await offlineIntegrationService.queueAdminUserAction({
        action: 'delete',
        userId: userId
      });
      
      showToast('User deletion queued for sync when online');
    } finally {
      setPendingActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(actionId);
        return newMap;
      });
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>Manage Users</Title>
        <LoadingSpinner>Loading users...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Title style={{ margin: 0 }}>Manage Users</Title>
        {pendingActions.size > 0 && (
          <PendingActionsIndicator>
            <span>🔄</span>
            {pendingActions.size} action{pendingActions.size > 1 ? 's' : ''} pending
          </PendingActionsIndicator>
        )}
      </div>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      {toast.show && (
        <Toast type={toast.type}>
          {toast.message}
        </Toast>
      )}
      
      <SearchBar
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <FilterBar>
        <FilterSelect value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="refugee">Refugee</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
          <option value="employer">Employer</option>
        </FilterSelect>
        <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>
      </FilterBar>
      
      {selectedUsers.length > 0 && (
        <BulkBar>
          <span>{selectedUsers.length} selected</span>
          {Array.from(pendingActions.values()).some(action => action.type === 'bulk') ? (
            <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Processing...</span>
          ) : (
            <>
              <ActionButton onClick={() => handleBulkAction('deactivate')}>Deactivate</ActionButton>
              <ActionButton onClick={() => handleBulkAction('activate')}>Activate</ActionButton>
              <ActionButton onClick={() => setSelectedUsers([])}>Clear</ActionButton>
            </>
          )}
        </BulkBar>
      )}
      
      <UsersGrid>
        {users.length > 0 ? (
          users.map(user => {
            const isPending = hasPendingAction(user._id);
            return (
              <UserCardOverlay key={user._id} pending={isPending}>
                <UserCard onClick={() => !isPending && setDetailsModal({ open: true, user })}>
                  {isPending && <PendingIndicator />}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    {user.profilePic
                      ? <ProfilePic src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} />
                      : <ProfileInitials>{`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()}</ProfileInitials>
                    }
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{`${user.firstName} ${user.lastName}`}</span>
                  </div>
                  <div style={{ color: '#555', fontSize: '0.98rem', marginBottom: 4 }}>{user.email}</div>
                  <Badge>{user.role}</Badge>
                  <Badge style={{ marginLeft: '0.5rem' }}>{user.isActive ? 'active' : 'inactive'}</Badge>
                </UserCard>
              </UserCardOverlay>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
            No users found
          </div>
        )}
      </UsersGrid>
      
      <PaginationBar>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>&lt; Prev</button>
        <span>Page {page} of {totalPages} ({totalUsers} total users)</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next &gt;</button>
      </PaginationBar>
      
      {detailsModal.open && detailsModal.user && (
        <ModalOverlay onClick={closeDetailsModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              {detailsModal.user.profilePic
                ? <ProfilePic src={detailsModal.user.profilePic} alt={`${detailsModal.user.firstName} ${detailsModal.user.lastName}`} />
                : <ProfileInitials>{`${detailsModal.user.firstName?.[0] || ''}${detailsModal.user.lastName?.[0] || ''}`.toUpperCase()}</ProfileInitials>
              }
              <h2 style={{ margin: 0 }}>{`${detailsModal.user.firstName} ${detailsModal.user.lastName}`}</h2>
            </div>
            <div style={{ marginBottom: 8 }}><b>Email:</b> {detailsModal.user.email}</div>
            <div style={{ marginBottom: 8 }}><b>Role:</b> <Badge>{detailsModal.user.role}</Badge></div>
            <div style={{ marginBottom: 8 }}><b>Account Status:</b> <Badge style={{ marginLeft: '0.5rem' }}>{detailsModal.user.isActive ? 'active' : 'inactive'}</Badge></div>
            <div style={{ marginBottom: 8 }}><b>Profile Picture:</b> {detailsModal.user.profilePic ? 'Uploaded' : 'Not uploaded'}</div>
            <div style={{ marginBottom: 8 }}><b>Created:</b> {new Date(detailsModal.user.createdAt).toLocaleDateString()}</div>
            
            <div style={{ margin: '16px 0' }}>
              <label>Change Role: </label>
              <select 
                value={detailsModal.user.role} 
                onChange={e => setDetailsModal({ 
                  ...detailsModal, 
                  user: { ...detailsModal.user, role: e.target.value } 
                })} 
                style={{ padding: '0.5rem', borderRadius: 8, marginLeft: 8 }}
              >
                <option value="refugee">Refugee</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
                <option value="employer">Employer</option>
              </select>
            </div>
            
            <div style={{ margin: '16px 0' }}>
              <label>Account Management: </label>
              <select 
                value={detailsModal.user.isActive ? 'active' : 'inactive'} 
                onChange={e => setDetailsModal({ 
                  ...detailsModal, 
                  user: { ...detailsModal.user, isActive: e.target.value === 'active' } 
                })} 
                style={{ padding: '0.5rem', borderRadius: 8, marginLeft: 8 }}
              >
                <option value="active">Activate User</option>
                <option value="inactive">Deactivate User</option>
              </select>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', gap: '1rem' }}>
              <ActionButton onClick={handleSaveChanges} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </ActionButton>
              <ActionButton onClick={() => handleDeleteUser(detailsModal.user._id)} disabled={saveLoading}>
                Delete User
              </ActionButton>
              <ActionButton onClick={closeDetailsModal} disabled={saveLoading}>Close</ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {confirmDialog.open && (
        <ModalOverlay>
          <ModalContent>
            <div>
              {confirmDialog.bulk
                ? `Are you sure you want to ${confirmDialog.action} ${selectedUsers.length} selected users?`
                : `Are you sure you want to ${confirmDialog.action} user "${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}"?`}
            </div>
            <ActionButton onClick={handleConfirm}>Yes, {confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}</ActionButton>
            <ActionButton onClick={closeConfirmDialog}>Cancel</ActionButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

const getRoleColor = (role) => {
  switch (role) {
    case 'admin': return '#dc3545';
    case 'instructor': return '#007bff';
    case 'employer': return '#28a745';
    case 'refugee': return '#6c757d';
    default: return '#6c757d';
  }
};

export default ManageUsers;