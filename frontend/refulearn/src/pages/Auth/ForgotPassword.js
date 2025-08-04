import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../../components/Logo';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
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
  max-width: 400px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
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
  margin-bottom: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const BackLink = styled.div`
  text-align: center;
  margin-top: 1rem;
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-size: 0.9rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // First try online password reset
      let resetSuccess = false;
      
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.');
          resetSuccess = true;
          console.log('✅ Online password reset email sent');
        } else {
          setError(data.message || 'Failed to send reset email');
        }
      } catch (onlineError) {
        console.log('❌ Online password reset failed, trying offline approach...');
        
        // For offline scenario, we can't send emails but we can show instructions
        try {
          // Check if user exists in offline storage
          const offlineResult = await offlineIntegrationService.getUserByEmail?.(email);
          
          if (offlineResult?.success && offlineResult?.user) {
            setSuccess('You are currently offline. When you go back online, you can reset your password through the normal process. For now, please try to remember your password or contact support.');
            resetSuccess = true;
            console.log('✅ Offline password reset info provided');
          } else {
            setError('Email address not found. Please check your email or create a new account.');
          }
        } catch (offlineError) {
          console.error('❌ Offline password reset check failed:', offlineError);
          setError('Unable to process password reset at this time. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LogoAbsolute>
        <Logo />
      </LogoAbsolute>
      
      <Form onSubmit={handleSubmit}>
        <Title>Forgot Password</Title>
        <Description>
          Enter your email address and we'll send you instructions to reset your password.
        </Description>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        
        <Button type="submit" disabled={loading}>
          {loading && <LoadingSpinner />}
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>
        
        <BackLink>
          <Link to="/login">Back to Login</Link>
        </BackLink>
      </Form>
    </Container>
  );
};

export default ForgotPassword; 