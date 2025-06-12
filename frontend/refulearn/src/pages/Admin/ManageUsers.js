import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 0.8rem;
    border-bottom: 1px solid #eee;
    text-align: left;
  }
  th {
    background: #f8f9fa;
    color: #666;
    font-weight: 600;
  }
  tr:hover {
    background: #f0f0f0;
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
  margin-right: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: ${({ color }) => color && `${color}cc`};
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

const ManageUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'refugee', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'mentor', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'instructor', status: 'inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'employer', status: 'active' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  return (
    <Container>
      <Title>Manage Users</Title>
      <SearchBar
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <ActionButton
                    color={user.status === 'active' ? '#dc3545' : '#28a745'}
                    onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </ActionButton>
                  <ActionButton
                    color="#6c757d"
                    onClick={() => handleRoleChange(user.id, 'refugee')}
                  >
                    Change Role
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default ManageUsers; 