import React, { useState } from 'react';
import styled from 'styled-components';

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

const UserList = styled.div`
  margin-top: 1.5rem;
`;

const UserCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 0.5fr 2fr 3fr 1fr 1fr 2fr;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    position: relative;
    padding-top: 2rem;
  }
`;

const UserHeader = styled(UserCard)`
  background: #f8f9fa;
  font-weight: 600;
  color: #666;
  border-radius: 8px 8px 0 0;

  @media (max-width: 992px) {
    display: none;
  }
`;

const UserInfo = styled.div`
  @media (max-width: 992px) {
    display: flex;
    &::before {
      content: attr(data-label);
      font-weight: bold;
      width: 100px;
      min-width: 100px;
      display: inline-block;
    }
  }
`;

const CheckboxContainer = styled.div`
  @media (max-width: 992px) {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-start;

  @media (max-width: 992px) {
    margin-top: 0.5rem;
    &::before {
      content: 'Actions: ';
      font-weight: bold;
      width: 100px;
      min-width: 100px;
      display: inline-block;
    }
  }
`;

const ActionButton = styled.button`
  background: ${({ color }) => color || '#007bff'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    opacity: 0.9;
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
  background: ${({ color }) => color || '#888'};
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

const ManageUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'refugee', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'mentor', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'instructor', status: 'inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'employer', status: 'active' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleModal, setRoleModal] = useState({ open: false, userId: null });
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const USERS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [detailsModal, setDetailsModal] = useState({ open: false, user: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, user: null, bulk: false });

  const filteredUsers = users.filter(user =>
    (roleFilter === 'all' || user.role === roleFilter) &&
    (statusFilter === 'all' || user.status === statusFilter) &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const openRoleModal = (userId) => setRoleModal({ open: true, userId });
  const closeRoleModal = () => setRoleModal({ open: false, userId: null });

  const handleRoleSelect = (newRole) => {
    setUsers(users.map(user =>
      user.id === roleModal.userId ? { ...user, role: newRole } : user
    ));
    closeRoleModal();
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId]);
  };
  const handleSelectAll = () => {
    const ids = paginatedUsers.map(u => u.id);
    if (ids.every(id => selectedUsers.includes(id))) {
      setSelectedUsers(selectedUsers.filter(id => !ids.includes(id)));
    } else {
      setSelectedUsers([...new Set([...selectedUsers, ...ids])]);
    }
  };
  const openDetailsModal = (user) => setDetailsModal({ open: true, user });
  const closeDetailsModal = () => setDetailsModal({ open: false, user: null });
  const openConfirmDialog = (action, user, bulk = false) => setConfirmDialog({ open: true, action, user, bulk });
  const closeConfirmDialog = () => setConfirmDialog({ open: false, action: null, user: null, bulk: false });

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    openConfirmDialog(action, null, true);
  };
  const handleConfirm = () => {
    if (confirmDialog.bulk) {
      if (confirmDialog.action === 'deactivate') {
        setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'inactive' } : u));
      } else if (confirmDialog.action === 'activate') {
        setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'active' } : u));
      }
      setSelectedUsers([]);
    } else if (confirmDialog.action === 'deactivate') {
      setUsers(users.map(u => u.id === confirmDialog.user.id ? { ...u, status: 'inactive' } : u));
    } else if (confirmDialog.action === 'activate') {
      setUsers(users.map(u => u.id === confirmDialog.user.id ? { ...u, status: 'active' } : u));
    }
    closeConfirmDialog();
  };

  return (
    <Container>
      <Title>Manage Users</Title>
      <SearchBar
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <FilterBar>
        <FilterSelect value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="refugee">Refugee</option>
          <option value="mentor">Mentor</option>
          <option value="instructor">Instructor</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
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
          <ActionButton color="#dc3545" onClick={() => handleBulkAction('deactivate')}>Deactivate</ActionButton>
          <ActionButton color="#28a745" onClick={() => handleBulkAction('activate')}>Activate</ActionButton>
          <ActionButton color="#6c757d" onClick={() => setSelectedUsers([])}>Clear</ActionButton>
        </BulkBar>
      )}
      <UserList>
        <UserHeader>
          <CheckboxContainer>
            <input 
              type="checkbox" 
              checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id))} 
              onChange={handleSelectAll} 
            />
          </CheckboxContainer>
          <UserInfo>Name</UserInfo>
          <UserInfo>Email</UserInfo>
          <UserInfo>Role</UserInfo>
          <UserInfo>Status</UserInfo>
          <ActionButtons>Actions</ActionButtons>
        </UserHeader>
        {paginatedUsers.map(user => (
          <UserCard key={user.id}>
            <CheckboxContainer>
              <input 
                type="checkbox" 
                checked={selectedUsers.includes(user.id)} 
                onChange={() => handleSelectUser(user.id)} 
              />
            </CheckboxContainer>
            <UserInfo data-label="Name:">{user.name}</UserInfo>
            <UserInfo data-label="Email:">{user.email}</UserInfo>
            <UserInfo data-label="Role:">
              <Badge color={getRoleColor(user.role)}>{user.role}</Badge>
            </UserInfo>
            <UserInfo data-label="Status:">
              <Badge color={user.status === 'active' ? '#28a745' : '#dc3545'}>
                {user.status}
              </Badge>
            </UserInfo>
            <ActionButtons>
              {user.status === 'active' ? (
                <ActionButton color="#dc3545" onClick={() => openConfirmDialog('deactivate', user)}>
                  Deactivate
                </ActionButton>
              ) : (
                <ActionButton color="#28a745" onClick={() => openConfirmDialog('activate', user)}>
                  Activate
                </ActionButton>
              )}
              <ActionButton color="#6c757d" onClick={() => openRoleModal(user.id)}>
                Change Role
              </ActionButton>
              <ActionButton color="#17a2b8" onClick={() => openDetailsModal(user)}>
                Details
              </ActionButton>
            </ActionButtons>
          </UserCard>
        ))}
      </UserList>
      <PaginationBar>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>&lt; Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next &gt;</button>
      </PaginationBar>
      {detailsModal.open && (
        <ModalOverlay>
          <ModalContent>
            <h2>User Details</h2>
            <div><b>Name:</b> {detailsModal.user.name}</div>
            <div><b>Email:</b> {detailsModal.user.email}</div>
            <div><b>Role:</b> {detailsModal.user.role}</div>
            <div><b>Status:</b> {detailsModal.user.status}</div>
            <div style={{ marginTop: 16 }}>
              <ActionButton color="#6c757d" onClick={closeDetailsModal}>Close</ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
      {confirmDialog.open && (
        <ModalOverlay>
          <ModalContent>
            <h3>Confirm {confirmDialog.action === 'deactivate' ? 'Deactivation' : 'Activation'}</h3>
            <div style={{ margin: '1rem 0' }}>
              {confirmDialog.bulk
                ? `Are you sure you want to ${confirmDialog.action} ${selectedUsers.length} selected users?`
                : `Are you sure you want to ${confirmDialog.action} user "${confirmDialog.user.name}"?`}
            </div>
            <ActionButton color="#dc3545" onClick={handleConfirm}>Yes, {confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}</ActionButton>
            <ActionButton color="#6c757d" onClick={closeConfirmDialog}>Cancel</ActionButton>
          </ModalContent>
        </ModalOverlay>
      )}
      {roleModal.open && (
        <ModalOverlay>
          <ModalContent>
            <h3>Change User Role</h3>
            {['refugee', 'mentor', 'instructor', 'employer', 'admin'].map(role => (
              <button
                key={role}
                style={{
                  display: 'block', width: '100%', margin: '8px 0', padding: '0.7rem 1rem',
                  background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'
                }}
                onClick={() => handleRoleSelect(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
            <button
              style={{
                marginTop: 12, background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem'
              }}
              onClick={closeRoleModal}
            >
              Cancel
            </button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

const getRoleColor = (role) => {
  switch (role) {
    case 'admin': return '#6f42c1';
    case 'instructor': return '#fd7e14';
    case 'mentor': return '#20c997';
    case 'employer': return '#ffc107';
    case 'refugee': return '#0d6efd';
    default: return '#6c757d';
  }
};

export default ManageUsers; 