import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 1.5rem;
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

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
  color: #007bff;
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

const ManageUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
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

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      
      try {
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
          setUsers(data.data.users || []);
          setTotalPages(data.data.pagination?.totalPages || 1);
          setTotalUsers(data.data.pagination?.totalUsers || 0);
          console.log('✅ Admin users data fetched successfully');
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } catch (err) {
        console.error('❌ Error fetching users:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const closeDetailsModal = () => setDetailsModal({ open: false, user: null });
  const openConfirmDialog = (action, user, bulk = false) => setConfirmDialog({ open: true, action, user, bulk });
  const closeConfirmDialog = () => setConfirmDialog({ open: false, action: null, user: null, bulk: false });

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    openConfirmDialog(action, null, true);
  };

  const handleConfirm = async () => {
    if (confirmDialog.bulk) {
      // Handle bulk actions
      const newStatus = confirmDialog.action === 'activate';
      
      try {
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
        const failedUpdates = results.filter(res => !res.ok);

        if (failedUpdates.length === 0) {
          setSuccess(`${selectedUsers.length} users ${confirmDialog.action}d successfully`);
          setSelectedUsers([]);
          // Refresh data
          window.location.reload();
        } else {
          setError(`${failedUpdates.length} users failed to update`);
        }
      } catch (err) {
        setError('Network error occurred');
      }
    } else {
      // Handle single user action
      const userId = confirmDialog.user._id;
      const newStatus = confirmDialog.action === 'activate';
      
      try {
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
          setSuccess(`User ${confirmDialog.action}d successfully`);
          // Refresh data
          window.location.reload();
        } else {
          setError(data.message || 'Failed to update user');
        }
      } catch (err) {
        setError('Network error occurred');
      }
    }
    closeConfirmDialog();
  };

  const handleSaveChanges = async () => {
    if (!detailsModal.user) return;
    
    const userId = detailsModal.user._id;
    setSaveLoading(true);
    setError('');
    
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
        setSuccess('User updated successfully');
        setTimeout(() => {
          closeDetailsModal();
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('User deleted successfully');
        setSelectedUsers(prev => prev.filter(id => id !== userId));
        window.location.reload();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error occurred');
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'instructor': return '#007bff';
      case 'employer': return '#28a745';
      case 'refugee': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Title style={{ margin: 0 }}>Manage Users</Title>
      </div>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
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
          <ActionButton onClick={() => handleBulkAction('deactivate')}>Deactivate</ActionButton>
          <ActionButton onClick={() => handleBulkAction('activate')}>Activate</ActionButton>
          <ActionButton onClick={() => setSelectedUsers([])}>Clear</ActionButton>
        </BulkBar>
      )}
      
      <UsersGrid>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard key={user._id} onClick={() => setDetailsModal({ open: true, user })}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user._id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                    }
                  }}
                  style={{ marginRight: '1rem' }}
                />
                {user.profilePic ? (
                  <ProfilePic 
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
                    alt={`${user.firstName} ${user.lastName}`} 
                    onError={(e) => {
                      console.log('Profile image failed to load:', e.target.src);
                      // Hide the image and show initials instead
                      e.target.style.display = 'none';
                      const initialsElement = e.target.nextElementSibling;
                      if (initialsElement && initialsElement.classList.contains('profile-initials')) {
                        initialsElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <ProfileInitials 
                  className="profile-initials"
                  style={{ 
                    display: user.profilePic ? 'none' : 'flex' 
                  }}
                >
                  {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()}
                </ProfileInitials>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{`${user.firstName} ${user.lastName}`}</span>
              </div>
              <div style={{ color: '#555', fontSize: '0.98rem', marginBottom: 4 }}>{user.email}</div>
              <Badge style={{ background: getRoleColor(user.role) }}>{t(`roles.${user.role}`, user.role)}</Badge>
              <Badge style={{ marginLeft: '0.5rem', background: user.isActive ? '#28a745' : '#dc3545' }}>
                {user.isActive ? 'active' : 'inactive'}
              </Badge>
            </UserCard>
          ))
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
              {detailsModal.user.profilePic ? (
                <ProfilePic 
                  src={(() => {
                    if (detailsModal.user.profilePic) {
                      // Convert Windows backslashes to forward slashes
                      const normalizedPath = detailsModal.user.profilePic.replace(/\\/g, '/');
                      
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
                    return detailsModal.user.profilePic;
                  })()} 
                  alt={`${detailsModal.user.firstName} ${detailsModal.user.lastName}`} 
                  onError={(e) => {
                    console.log('Profile image failed to load:', e.target.src);
                    // Hide the image and show initials instead
                    e.target.style.display = 'none';
                    const initialsElement = e.target.nextElementSibling;
                    if (initialsElement && initialsElement.classList.contains('profile-initials-modal')) {
                      initialsElement.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <ProfileInitials 
                className="profile-initials-modal"
                style={{ 
                  display: detailsModal.user.profilePic ? 'none' : 'flex' 
                }}
              >
                {`${detailsModal.user.firstName?.[0] || ''}${detailsModal.user.lastName?.[0] || ''}`.toUpperCase()}
              </ProfileInitials>
              <h2 style={{ margin: 0 }}>{`${detailsModal.user.firstName} ${detailsModal.user.lastName}`}</h2>
            </div>
            <div style={{ marginBottom: 8 }}><b>Email:</b> {detailsModal.user.email}</div>
            <div style={{ marginBottom: 8 }}><b>Role:</b> <Badge style={{ background: getRoleColor(detailsModal.user.role) }}>{t(`roles.${detailsModal.user.role}`, detailsModal.user.role)}</Badge></div>
            <div style={{ marginBottom: 8 }}><b>Account Status:</b> <Badge style={{ background: detailsModal.user.isActive ? '#28a745' : '#dc3545' }}>{detailsModal.user.isActive ? 'active' : 'inactive'}</Badge></div>
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
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <ActionButton onClick={handleConfirm}>Yes, {confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}</ActionButton>
              <ActionButton onClick={closeConfirmDialog}>Cancel</ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ManageUsers;