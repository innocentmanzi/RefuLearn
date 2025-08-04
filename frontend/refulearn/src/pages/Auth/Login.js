import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../../components/Logo';
import { useUser } from '../../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import offlineIntegrationService from '../../services/offlineIntegrationService';

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
  height: 48px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
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
`;

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
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

const OfflineInfo = styled.div`
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #0066cc;
`;

const OfflineTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #0066cc;
  font-size: 1rem;
`;

const OfflineCredentials = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-family: monospace;
  font-size: 0.85rem;
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
  right: 0.5rem;
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
  z-index: 10;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('refugee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useUser();
  const navigate = useNavigate();

  // Check for cached credentials when offline
  useEffect(() => {
    if (!navigator.onLine) {
      const checkOfflineCapabilities = () => {
        const cachedCreds = localStorage.getItem('offline_credentials');
        const lastAuth = localStorage.getItem('last_online_auth');
        const cachedUser = localStorage.getItem('user');
        
        if (cachedCreds && lastAuth) {
          const authData = JSON.parse(lastAuth);
          setDebugInfo(`Previously logged in as: ${authData.email}`);
          console.log('✅ Cached credentials found for offline login');
        } else if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          setDebugInfo(`Session available for: ${userData.email}`);
          console.log('✅ User session found');
        } else {
          setDebugInfo('Ready for offline login with database credentials');
          console.log('💡 Ready for offline login');
        }
      };
      
      checkOfflineCapabilities();
    }
  }, []);
  
  // Allow access to login page even if authenticated
  // (Users can login as different users)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Both email and password are required');
      return;
    }

    setLoading(true);
    
    try {
      // First try online authentication
      let loginSuccess = false;
      let userData = null;
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store tokens
          localStorage.setItem('token', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          
          // Set user data in context
          userData = {
            ...data.data.user,
            role: data.data.user.role || 'refugee',
            profilePic: data.data.user.profilePic || null
          };
          
          // Store credentials and user data for offline use
          console.log('💾 Storing credentials for offline access...');
          try {
            const credResult = await offlineIntegrationService.storeUserCredentials(email, password);
            console.log('✅ Credential storage result:', credResult);
            
            const authResult = await offlineIntegrationService.storeOnlineAuthData(userData, password);
            console.log('✅ Auth data storage result:', authResult);
            
            // Verify storage worked
            console.log('🔍 Verification - lastUserEmail:', localStorage.getItem('lastUserEmail'));
            console.log('🔍 Verification - hasUserData:', !!localStorage.getItem('lastUserData'));
            console.log('🔍 Verification - hasPassword:', !!localStorage.getItem('lastUserPassword'));
          } catch (storageError) {
            console.error('❌ Failed to store offline credentials:', storageError);
          }
          
          loginSuccess = true;
          console.log('✅ Online login successful');
        } else {
          // Check if this is an offline response from Service Worker
          if (data.offline && data.message === 'Network unavailable') {
            console.log('🔌 Detected offline response from Service Worker, proceeding with offline authentication...');
            throw new Error('Network unavailable - proceeding to offline auth');
          } else {
            setError(data.message || 'Login failed');
          }
        }
      } catch (onlineError) {
        console.log('❌ Online login failed, trying offline authentication...');
        
        // Check if this is an offline response from Service Worker
        if (onlineError.message && onlineError.message.includes('Network unavailable')) {
          console.log('🔌 Detected offline mode, proceeding with offline authentication...');
        }
        
        // Try offline authentication
        try {
          const offlineResult = await offlineIntegrationService.login({ email, password });
          
          if (offlineResult?.success) {
            userData = offlineResult.user;
            loginSuccess = true;
            console.log('✅ Offline login successful');
            setSuccess('Login successful offline! Some features may be limited until you go online.');
          } else {
            setError(offlineResult?.message || 'Invalid credentials. Please check your email and password.');
          }
        } catch (offlineError) {
          console.error('❌ Offline login also failed:', offlineError);
          setError('Invalid credentials. Please check your email and password.');
        }
      }
      
      if (loginSuccess && userData) {
        try {
          await login(userData);
          setSuccess('Login successful! Redirecting...');
          
          // Redirect based on user role
          setTimeout(() => {
            const userRole = userData.role || 'refugee';
            
            console.log('🚀 Redirecting user with role:', userRole);
            
            switch (userRole) {
              case 'admin':
                navigate('/admin/dashboard');
                break;
              case 'instructor':
                navigate('/instructor/dashboard');
                break;
              case 'employer':
                navigate('/employer/dashboard');
                break;
              case 'refugee':
              default:
                navigate('/dashboard');
                break;
            }
          }, 1000);
        } catch (loginError) {
          console.error('❌ Error during login process:', loginError);
          setError('Login successful but profile loading failed. Please refresh the page.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please try again.');
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
        <Title>{t('login.title', 'Login')}</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        {!navigator.onLine && (
          <OfflineInfo>
            <OfflineTitle>🔌 Offline Mode</OfflineTitle>
            <p>You're currently offline. You can still login using your database credentials.</p>
            <p>Enter your actual email and password:</p>
            <OfflineCredentials>
              Use your normal login credentials - the same ones you use when online
              {debugInfo && <div style={{marginTop: '0.5rem', fontSize: '0.8em', opacity: 0.7}}>
                Status: {debugInfo}
              </div>}
            </OfflineCredentials>
          </OfflineInfo>
        )}
        
        <Input
          type="email"
          placeholder={t('login.email', 'Email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <PasswordWrapper>
          <PasswordInput
            type={showPassword ? "text" : "password"}
            placeholder={t('login.password', 'Password')}
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
        
        <Button type="submit" disabled={loading}>
          {loading ? t('login.loggingIn', 'Logging in...') : t('login.submit', 'Login')}
        </Button>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem' }}>
            {t('login.forgotPassword', 'Forgot your password?')}
          </Link>
        </div>
      </Form>
      
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        {t('login.noAccount', 'Don\'t have an account?')} <Link to="/register">{t('login.register', 'Register')}</Link>
      </div>
    </Container>
  );
};

export default Login; 