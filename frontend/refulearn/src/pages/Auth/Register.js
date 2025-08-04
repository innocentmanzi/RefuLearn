import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../../components/Logo';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import offlineIntegrationService from '../../services/offlineIntegrationService';

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
  height: 48px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  max-width: 480px;
  height: 48px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
  max-width: 480px;
`;

const Success = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
  max-width: 480px;
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

const OTPContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin-bottom: 1rem;
`;

const OTPInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.5rem;
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled.input`
  width: 100%;
  max-width: 480px;
  height: 48px;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  
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

const Register = () => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('refugee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole } = useUser();
  
  // Allow access to register page even if authenticated
  // (Users can register new accounts even if already logged in)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required');
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
      // First try online registration
      let registrationSuccess = false;
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            role
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(data.message || 'Registration successful! Please check your email for OTP verification.');
          setShowOTP(true);
          registrationSuccess = true;
          console.log('✅ Online registration successful');
        } else {
          setError(data.message || 'Registration failed');
        }
      } catch (onlineError) {
        console.log('❌ Online registration failed, trying offline registration...');
        
        // Try offline registration
        try {
          const offlineResult = await offlineIntegrationService.register?.({
            firstName,
            lastName,
            email,
            password,
            role
          });
          
          if (offlineResult?.success) {
            setSuccess('Registration successful offline! Account will be synced when online.');
            registrationSuccess = true;
            console.log('✅ Offline registration successful');
            
            // Auto-login after successful offline registration
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else {
            setError('Registration failed');
          }
        } catch (offlineError) {
          console.error('❌ Offline registration also failed:', offlineError);
          setError('Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully! You can now login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = async () => {
    setError('');
    setOtpLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP resent successfully! Please check your email.');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (showOTP) {
    return (
      <Container>
        <LogoAbsolute>
          <Logo />
        </LogoAbsolute>
        <CenterWrapper>
                  <Form onSubmit={handleOTPVerification}>
          <Title>{t('verifyEmail')}</Title>
            {error && <Error>{error}</Error>}
            {success && <Success>{success}</Success>}
            
            <OTPContainer>
                          <OTPInput
              type="text"
              placeholder={t('enterSixDigitOtp')}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={otpLoading}
              maxLength={6}
              required
            />
            </OTPContainer>
            
                      <Button type="submit" disabled={otpLoading}>
            {otpLoading && <LoadingSpinner />}
            {otpLoading ? t('verifying') : t('verifyOtp')}
          </Button>
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={resendOTP} 
                disabled={otpLoading}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#007bff', 
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                {t('resendOtp')}
              </button>
            </div>
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to="/login">{t('backToLogin')}</Link>
            </div>
          </Form>
        </CenterWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <LogoAbsolute>
        <Logo />
      </LogoAbsolute>
      <CenterWrapper>
        <Form onSubmit={handleSubmit}>
          <Title>{t('register')}</Title>
          {error && <Error>{error}</Error>}
          {success && <Success>{success}</Success>}
          
          <Input
            type="text"
            placeholder={t('firstName')}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            type="text"
            placeholder={t('lastName')}
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <PasswordWrapper>
            <PasswordInput
              type={showPassword ? "text" : "password"}
              placeholder={t('password')}
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
          <PasswordWrapper>
            <PasswordInput
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t('confirmPassword')}
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
          <Select 
            value={role} 
            onChange={e => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="refugee">{t('refugee')}</option>
            <option value="instructor">Instructor</option>
            <option value="employer">Employer</option>
          </Select>
          
          <Button type="submit" disabled={loading}>
            {loading && <LoadingSpinner />}
            {loading ? t('registering') : t('register')}
          </Button>
          
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            {t('alreadyHaveAccount')} <Link to="/login">{t('login.submit')}</Link>
          </div>
        </Form>
      </CenterWrapper>
    </Container>
  );
};

export default Register; 