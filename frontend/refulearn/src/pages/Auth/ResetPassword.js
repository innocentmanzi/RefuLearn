import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 0.75rem;
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

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
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

const PasswordStrengthIndicator = styled.div`
  margin-bottom: 1rem;
  font-size: 0.8rem;
`;

const StrengthBar = styled.div`
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin: 0.5rem 0;
  overflow: hidden;
`;

const StrengthFill = styled.div`
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
  width: ${props => props.strength}%;
  background: ${props => {
    if (props.strength < 25) return '#dc3545';
    if (props.strength < 50) return '#fd7e14';
    if (props.strength < 75) return '#ffc107';
    return '#28a745';
  }};
`;

const PasswordRequirements = styled.ul`
  margin: 0.5rem 0 1rem 0;
  padding-left: 1.2rem;
  font-size: 0.8rem;
  color: #666;
  
  li {
    margin-bottom: 0.2rem;
    color: ${props => props.met ? '#28a745' : '#666'};
  }
`;

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Validate token on component mount
  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
      return;
    }

    // Verify token with backend
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        if (!response.ok) {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setTokenValid(false);
        }
      } catch (error) {
        console.log('Token verification failed, assuming valid for offline use');
        // In offline mode, we'll allow the reset to proceed
      }
    };

    verifyToken();
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!password || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    setLoading(true);
    
    try {
      // First try online password reset
      let resetSuccess = false;
      
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            email,
            password,
            confirmPassword
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Password has been reset successfully! You can now login with your new password.');
          resetSuccess = true;
          console.log('✅ Online password reset successful');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(data.message || 'Failed to reset password');
        }
      } catch (onlineError) {
        console.log('❌ Online password reset failed, trying offline approach...');
        
        // For offline scenario
        try {
          const offlineResult = await offlineIntegrationService.resetPassword?.({
            email,
            password
          });
          
          if (offlineResult?.success) {
            setSuccess('Password has been reset successfully offline! You can now login with your new password.');
            resetSuccess = true;
            console.log('✅ Offline password reset successful');
            
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else {
            setError('Failed to reset password. Please try again.');
          }
        } catch (offlineError) {
          console.error('❌ Offline password reset failed:', offlineError);
          setError('Failed to reset password. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <Container>
        <LogoAbsolute>
          <Logo />
        </LogoAbsolute>
        
        <Form>
          <Title>Invalid Reset Link</Title>
          <ErrorMessage>{error}</ErrorMessage>
          <BackLink>
            <Link to="/forgot-password">Request New Reset Link</Link>
          </BackLink>
          <BackLink style={{ marginTop: '0.5rem' }}>
            <Link to="/login">Back to Login</Link>
          </BackLink>
        </Form>
      </Container>
    );
  }

  return (
    <Container>
      <LogoAbsolute>
        <Logo />
      </LogoAbsolute>
      
      <Form onSubmit={handleSubmit}>
        <Title>Reset Password</Title>
        <Description>
          Create a new password for your account.
        </Description>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <PasswordWrapper>
          <PasswordInput
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <PasswordToggle
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </PasswordToggle>
        </PasswordWrapper>
        
        {password && (
          <PasswordStrengthIndicator>
            <StrengthBar>
              <StrengthFill strength={passwordStrength} />
            </StrengthBar>
            <PasswordRequirements>
              <li style={{ color: password.length >= 8 ? '#28a745' : '#666' }}>
                At least 8 characters
              </li>
              <li style={{ color: /[a-z]/.test(password) ? '#28a745' : '#666' }}>
                One lowercase letter
              </li>
              <li style={{ color: /[A-Z]/.test(password) ? '#28a745' : '#666' }}>
                One uppercase letter
              </li>
              <li style={{ color: /[0-9]/.test(password) ? '#28a745' : '#666' }}>
                One number
              </li>
              <li style={{ color: /[^A-Za-z0-9]/.test(password) ? '#28a745' : '#666' }}>
                One special character
              </li>
            </PasswordRequirements>
          </PasswordStrengthIndicator>
        )}
        
        <PasswordWrapper>
          <PasswordInput
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
          <PasswordToggle
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </PasswordToggle>
        </PasswordWrapper>
        
        <Button type="submit" disabled={loading}>
          {loading && <LoadingSpinner />}
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
        
        <BackLink>
          <Link to="/login">Back to Login</Link>
        </BackLink>
      </Form>
    </Container>
  );
};

export default ResetPassword; 