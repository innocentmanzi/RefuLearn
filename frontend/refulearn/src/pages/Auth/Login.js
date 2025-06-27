import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useUser } from '../../contexts/UserContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  position: relative;
`;

const LogoAbsolute = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
`;

const Form = styled.form`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 320px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [role, setRole] = useState('refugee');

  const handleSubmit = e => {
    e.preventDefault();
    // In a real app, you would authenticate the user here
    // and receive the actual user role from the backend.
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@email.com',
      profilePic: null,
      role: role
    };
    login(userData, role);
    navigate('/dashboard');
  };

  return (
    <Container>
      <LogoAbsolute>
        <Logo />
      </LogoAbsolute>
      <Form onSubmit={handleSubmit}>
        <Title>Login</Title>
        <Input type="email" placeholder="Email" required />
        <Input type="password" placeholder="Password" required />

        <Select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="refugee">Refugee</option>
          <option value="instructor">Instructor</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
          <option value="employer">Employer</option>
        </Select>

        <Button type="submit">Login</Button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </Form>
    </Container>
  );
};

export default Login; 