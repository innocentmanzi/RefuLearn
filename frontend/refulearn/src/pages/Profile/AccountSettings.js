import React, { useState } from 'react';
import styled from 'styled-components';
import { FiUser, FiLock, FiBell, FiShield, FiGlobe } from 'react-icons/fi';

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
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
  
  &.secondary {
    background: #6c757d;
    
    &:hover {
      background: #5a6268;
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

const AccountSettings = () => {
  const [settings, setSettings] = useState({
    email: 'jane.doe@email.com',
    language: 'en',
    timezone: 'UTC+2',
    notifications: {
      email: true,
      push: false,
      sms: false,
      courseUpdates: true,
      newMessages: true,
      jobAlerts: false,
      newsletter: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true
    }
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to save settings
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <Container>
      <Title>Account Settings</Title>
      
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
            <Label>Email Address</Label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Language</Label>
            <Select
              value={settings.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
              <option value="sw">Swahili</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Timezone</Label>
            <Select
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="UTC+2">UTC+2 (East Africa)</option>
              <option value="UTC+1">UTC+1 (West Africa)</option>
              <option value="UTC+0">UTC+0 (GMT)</option>
              <option value="UTC-5">UTC-5 (Eastern US)</option>
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
                checked={settings.notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
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
                checked={settings.notifications.push}
                onChange={(e) => handleNotificationChange('push', e.target.checked)}
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
                checked={settings.notifications.courseUpdates}
                onChange={(e) => handleNotificationChange('courseUpdates', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>New Messages</NotificationTitle>
              <NotificationDescription>Get notified about new messages from mentors</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.notifications.newMessages}
                onChange={(e) => handleNotificationChange('newMessages', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Job Alerts</NotificationTitle>
              <NotificationDescription>Receive job opportunities and alerts</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.notifications.jobAlerts}
                onChange={(e) => handleNotificationChange('jobAlerts', e.target.checked)}
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
          
          <FormGroup>
            <Label>Profile Visibility</Label>
            <Select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="mentors">Mentors Only</option>
            </Select>
          </FormGroup>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Show Email Address</NotificationTitle>
              <NotificationDescription>Allow others to see your email address</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.privacy.showEmail}
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
                checked={settings.privacy.showPhone}
                onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </NotificationItem>
          
          <NotificationItem>
            <NotificationText>
              <NotificationTitle>Allow Messages</NotificationTitle>
              <NotificationDescription>Allow mentors and other users to message you</NotificationDescription>
            </NotificationText>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.privacy.allowMessages}
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
            <Input type="password" placeholder="Enter current password" />
          </FormGroup>
          
          <FormGroup>
            <Label>New Password</Label>
            <Input type="password" placeholder="Enter new password" />
          </FormGroup>
          
          <FormGroup>
            <Label>Confirm New Password</Label>
            <Input type="password" placeholder="Confirm new password" />
          </FormGroup>
          
          <Button>Change Password</Button>
        </SettingsCard>
      </SettingsGrid>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button onClick={handleSave}>Save All Changes</Button>
        <Button className="secondary">Reset to Default</Button>
      </div>
    </Container>
  );
};

export default AccountSettings; 