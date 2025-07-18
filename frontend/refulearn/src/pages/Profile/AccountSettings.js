import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUser, FiLock, FiBell, FiShield, FiGlobe, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useUser } from '../../contexts/UserContext';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const SettingsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #e0e0e0;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-size: 1.1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  &.secondary {
    background: #6c757d;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.danger {
    background: #dc3545;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const NotificationDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const Alert = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  &.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AccountSettings = () => {
  const { user, token } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'en'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    coursesUpdates: true,
    gradeUpdates: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🌐 Fetching account settings from API...');
        
        const response = await fetch('/api/auth/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const settingsApiData = await response.json();
          const settingsData = settingsApiData.data.settings;
          console.log('✅ Account settings data received:', settingsData);

          // Ensure privacy defaults are set
          const settingsWithDefaults = {
            ...settingsData,
            privacy: {
              profileVisibility: 'public',
              showEmail: false,
              showPhone: false,
              allowMessages: true,
              ...settingsData.privacy
            }
          };
          
          setSettings(settingsWithDefaults);
          
          // Set form data from settings
          setPersonalData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: settingsData.email || '',
            phone: user?.phone || '',
            language: settingsData.language || 'en'
          });
          
          setNotificationSettings({
            emailNotifications: settingsData.notifications?.email ?? true,
            pushNotifications: settingsData.notifications?.push ?? true,
            coursesUpdates: settingsData.notifications?.courseUpdates ?? true,
            gradeUpdates: settingsData.notifications?.gradeUpdates ?? true
          });
        } else {
          throw new Error('Failed to fetch settings');
        }

      } catch (err) {
        console.error('❌ Error fetching settings:', err);
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleUpdateSettings = async (settingsType, data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('🌐 Updating account settings...', { settingsType, data });
      
      const response = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        console.log('✅ Settings update successful');
        
        setSettings(updatedSettings.data.settings);
        setSuccess('Settings updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update settings');
      }

    } catch (err) {
      console.error('❌ Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = async (key, value) => {
    try {
      const updatedSettings = {
        ...settings,
        privacy: {
          ...settings.privacy,
          [key]: value
        }
      };
      
      setSettings(updatedSettings);
      
      // Update backend
      const response = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings: updatedSettings })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }
      
      setMessage('Privacy settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setError('Failed to update privacy settings. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePasswordChange = async (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setChangingPassword(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🌐 Changing password...');
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_new_password: passwordData.confirmPassword
        })
      });

      if (response.ok) {
        console.log('✅ Password change successful');
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare settings data structure matching backend expectations
      const settingsData = {
        language: personalData.language,
        notifications: {
          email: notificationSettings.emailNotifications,
          push: notificationSettings.pushNotifications,
          courseUpdates: notificationSettings.coursesUpdates,
          gradeUpdates: notificationSettings.gradeUpdates
        }
      };

      await handleUpdateSettings('all', settingsData);
      
      setSuccess('All settings saved successfully!');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      setError(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = () => {
    setPersonalData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      language: 'en'
    });
    setNotificationSettings({
      emailNotifications: true,
      pushNotifications: true,
      coursesUpdates: true,
      gradeUpdates: true
    });
    setMessage({ type: 'info', text: 'Settings reset to default values' });
  };

  if (loading) {
    return (
      <Container>
        <Title>Account Settings</Title>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          <p>Loading settings...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Account Settings</Title>
      
      {error && (
        <Alert className="error">
          <FiAlertCircle />
          {error}
        </Alert>
      )}
      {success && (
        <Alert className="success">
          <FiSave />
          {success}
        </Alert>
      )}
      
      <SettingsGrid>
        {/* Personal Information */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiUser />
            </CardIcon>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          
          <FormGroup>
            <Label>First Name</Label>
            <Input
              type="text"
              value={personalData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Last Name</Label>
            <Input
              type="text"
              value={personalData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={personalData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={personalData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Language</Label>
            <Select
              value={personalData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
              <option value="sw">Swahili</option>
            </Select>
          </FormGroup>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiBell />
            </CardIcon>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Email Notifications</NotificationTitle>
              <NotificationDescription>Receive notifications via email</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Push Notifications</NotificationTitle>
              <NotificationDescription>Receive push notifications in browser</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Course Updates</NotificationTitle>
              <NotificationDescription>Get notified about new courses and updates</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={notificationSettings.coursesUpdates}
                onChange={(e) => handleNotificationChange('coursesUpdates', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Grade Updates</NotificationTitle>
              <NotificationDescription>Get notified about grade updates</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={notificationSettings.gradeUpdates}
                onChange={(e) => handleNotificationChange('gradeUpdates', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
        </SettingsCard>

        {/* Privacy Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiShield />
            </CardIcon>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Profile Visibility</NotificationTitle>
              <NotificationDescription>Allow others to see your profile</NotificationDescription>
            </NotificationText>
            <Select
              value={settings?.privacy?.profileVisibility || "public"}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Select>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Show Email Address</NotificationTitle>
              <NotificationDescription>Allow others to see your email address</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings?.privacy?.showEmail || false}
                onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Show Phone Number</NotificationTitle>
              <NotificationDescription>Allow others to see your phone number</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings?.privacy?.showPhone || false}
                onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Allow Messages</NotificationTitle>
              <NotificationDescription>Allow instructors and administrators to message you</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings?.privacy?.allowMessages || false}
                onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
        </SettingsCard>

        {/* Security */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiLock />
            </CardIcon>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          
          <FormGroup>
            <Label>Current Password</Label>
            <Input 
              type="password" 
              placeholder="Enter current password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>New Password</Label>
            <Input 
              type="password" 
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Confirm New Password</Label>
            <Input 
              type="password" 
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            />
          </FormGroup>
          
          <Button 
            onClick={handleChangePassword}
            disabled={false} // This button is not directly editable via this UI, it's part of the backend
          >
            {/* {changingPassword ? <LoadingSpinner /> : <FiLock />} */}
            Change Password
          </Button>
        </SettingsCard>
      </SettingsGrid>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <LoadingSpinner /> : <FiSave />}
          {loading ? 'Saving...' : 'Save All Changes'}
        </Button>
        <Button className="secondary" onClick={handleResetToDefault}>
          Reset to Default
        </Button>
      </div>
    </Container>
  );
};

export default AccountSettings; 