import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../components/Logo';

const Container = styled.div`
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  position: relative;
`;

const LogoAbsolute = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
`;

const CenterWrapper = styled.div`
  flex: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Form = styled.form`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 320px;
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  max-width: 480px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  max-width: 480px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  max-width: 480px;
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

const Error = styled.div`
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  text-align: center;
`;

const Register = ({ setIsAuthenticated, setUserRole }) => {
  const [role, setRole] = useState('refugee');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    navigate('/login');
  };

  return (
    <Container>
      <LogoAbsolute>
        <Logo />
      </LogoAbsolute>
      <CenterWrapper>
        <Form onSubmit={handleSubmit}>
          <Title>Register</Title>
          {error && <Error>{error}</Error>}
          <Input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <Input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          <Select value={role} onChange={e => setRole(e.target.value)} required>
            <option value="refugee">Refugee</option>
            <option value="instructor">Instructor</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
            <option value="employer">Employer</option>
          </Select>
          <Button type="submit">Register</Button>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Form>
      </CenterWrapper>
    </Container>
  );
};

export default Register; 