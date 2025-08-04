import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiEdit, FiPlus, FiMapPin, FiFile, FiMail, FiPhone, FiLinkedin, FiGithub, FiGlobe, FiUser, FiBriefcase, FiBookOpen, FiAward, FiStar, FiHeart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import profileService from '../../services/profileService';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Container with clean background
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  padding: 1.5rem;

  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

// Clean wrapper
const GlassWrapper = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.6s ease-out;
`;

// Clean header
const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
  padding: 1rem;
  text-align: center;
  border-radius: 12px 12px 0 0;

  @media (max-width: 900px) {
    padding: 0.75rem;
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;

  @media (max-width: 900px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  margin: 0;
`;

// Content area with padding
const ContentArea = styled.div`
  padding: 1rem;

  @media (max-width: 900px) {
    padding: 0.75rem;
  }
`;

// Responsive grid layout
const FlexRow = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1rem;
  
  @media (max-width: 1000px) {
    grid-template-columns: 220px 1fr;
    gap: 0.75rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// Clean card design
const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.3s ease-out;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
  }

  @media (max-width: 600px) {
    padding: 0.75rem;
  }
`;

// Section header with icon
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const SectionIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
`;

const SectionTitle = styled.h3`
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

// Clean buttons
const EditButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
  }
`;

const SaveButton = styled(EditButton)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  
  &:hover {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  }
`;

const CancelButton = styled.button`
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }
`;

// Clean form inputs
const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.75rem;
  background: white;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.75rem;
  background: white;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  min-height: 60px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

// Profile picture section - compact with white background like other cards
const ProfilePictureSection = styled(Section)`
  text-align: center;
  padding: 0.75rem;
  
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const ProfilePicWrapper = styled.div`
  width: 35px;
  height: 35px;
  margin: 0 auto 0.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
  }
`;

const ProfilePic = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const ProfileInitials = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 50%;
`;

const UserName = styled.h2`
  color: #1f2937;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
`;

const UserRole = styled.p`
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  text-transform: capitalize;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.75rem;
`;

// Contact info styling
const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 0.375rem;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  font-size: 0.75rem;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const ContactIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.625rem;
`;

// Skill tags grid
const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SkillTag = styled.div`
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #bfdbfe;
  transition: all 0.3s ease;
  
  &:hover {
    background: #dbeafe;
    border-color: #93c5fd;
    transform: translateY(-1px);
  }
`;

// Experience/Education cards
const ExperienceCard = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-left: 3px solid #3b82f6;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

const ExperienceTitle = styled.h4`
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
`;

const ExperienceCompany = styled.p`
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
`;

const ExperienceDate = styled.p`
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0 0 0.5rem 0;
`;

const ExperienceDescription = styled.p`
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
`;

// Floating action buttons
const FloatingEditButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  font-size: 0.625rem;
  
  &:hover {
    transform: scale(1.1);
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }
`;

const FloatingAddButton = styled(FloatingEditButton)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  
  &:hover {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  }
`;

// Action buttons container
const ActionButtons = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

// Form row for date selectors and input/button pairs
const FormRow = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  
  > input {
    flex: 1;
    min-width: 120px;
  }
  
  > select {
    flex: 1;
    min-width: 80px;
  }
  
  > button {
    flex-shrink: 0;
  }
`;

// Remove button styling - smaller to match input fields
const RemoveButton = styled.button`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 32px;
  min-width: 60px;
  
  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-1px);
  }
`;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const years = Array.from({ length: 60 }, (_, i) => 1980 + i);

// Normalize certificates to objects
function normalizeCertificates(certs) {
  return certs.map(cert =>
    typeof cert === 'string'
      ? {
          title: cert,
          summary: '',
          certificateFileName: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: ''
        }
      : {
          title: cert.title || '',
          summary: cert.summary || '',
          certificateFileName: cert.certificateFileName || '',
          startMonth: cert.startMonth || cert.month || '',
          startYear: cert.startYear || cert.year || '',
          endMonth: cert.endMonth || '',
          endYear: cert.endYear || ''
        }
  );
}

const Profile = ({ userRole }) => {
  const { t } = useTranslation();
  const { user, setUser, updateUserProfile, fetchUserProfile, loading } = useUser();
  // Editable state
  const [edit, setEdit] = useState({
    profilePic: false,
    contact: false,
    social: false,
    interests: false,
    education: false,
    experience: false,
    skills: false,
    languages: false,
    certificates: false
  });
  const [form, setForm] = useState({});
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [degreeFiles, setDegreeFiles] = useState({});
  const [certificateFiles, setCertificateFiles] = useState({});

  // Test backend connectivity
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend profile data:', data.data.user);
          console.log('Profile picture from backend:', data.data.user.profilePic);
        } else {
          console.log('Backend not accessible:', response.status);
        }
      } catch (error) {
        console.log('Backend connection failed:', error);
      }
    };
    
    testBackend();
  }, []);

  // Initialize form when user data is available
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setForm({
        ...user,
        social: user.social || {}
      });
    }
  }, [user]);

  // Fetch user profile on mount and ensure fresh data
  useEffect(() => {
    // Only fetch if we don't have complete user data
    if (!user || !user._id || !user.firstName || !user.email) {
      console.log('🔄 Fetching user profile data...');
      fetchUserProfile(true); // Force refresh to get latest data
    } else {
      console.log('✅ User data already available, skipping fetch');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Handlers
  const handleEdit = (section) => {
    setEdit({ ...edit, [section]: true });
    // Reset form to current user data only for the specific section
    if (user) {
      setForm(prevForm => ({
        ...prevForm,
        [section]: user[section]
      }));
    }
  };
  const handleCancel = (section) => {
    setEdit({ ...edit, [section]: false });
    // Reset form to current user data only for the specific section
    if (user) {
      setForm(prevForm => ({
        ...prevForm,
        [section]: user[section]
      }));
    }
  };
  const handleChange = (e, section, idx, subfield) => {
    if (section === 'social') {
      setForm({ ...form, social: { ...form.social, [subfield]: e.target.value } });
    } else if ([
      'experiences', 'education', 'languages', 'skills', 'certificates', 'interests', 'specializations', 'mentorCertifications'
    ].includes(section)) {
      const updated = [...form[section]];
      if (subfield) {
        updated[idx][subfield] = e.target.value;
      } else {
        updated[idx] = e.target.value;
      }
      setForm({ ...form, [section]: updated });
    } else {
      setForm({ ...form, [section]: e.target.value });
    }
  };
  const handleSave = async (section) => {
    try {
      let result;
      
      switch (section) {
        case 'certificates':
          result = await profileService.updateCertificates(form.certificates);
          break;
        case 'education':
          result = await profileService.updateEducation(form.education);
          break;
        case 'experiences':
          result = await profileService.updateExperience(form.experiences);
          break;
        case 'skills':
          result = await profileService.updateSkills(form.skills);
          break;
        case 'languages':
          result = await profileService.updateLanguages(form.languages);
          break;
        case 'social':
          console.log('💾 Saving social platforms:', form.social);
          result = await profileService.updateSocialPlatforms(form.social);
          break;
        case 'interests':
          console.log('💾 Saving interests:', form.interests);
          // Filter out empty interests before saving
          const filteredInterests = (form.interests || []).filter(interest => interest && interest.trim() !== '');
          console.log('💾 Filtered interests:', filteredInterests);
          result = await profileService.updateInterests(filteredInterests);
          break;
        case 'contact':
          // Contact info - save both email and phone
          console.log('💾 Saving contact info:', { email: form.email, phone: form.phone });
          result = await profileService.updateContactInfo({
            email: form.email,
            phone: form.phone
          });
          break;
        case 'phone':
        case 'email':
        case 'country':
        case 'city':
        case 'address':
        case 'summary':
          // Individual contact info and basic profile updates
          result = await profileService.updateContactInfo({ [section]: form[section] });
          break;
        default:
          // Generic profile update for other fields
          result = await profileService.updateProfile({ [section]: form[section] });
          break;
      }
      
      if (result.success) {
        console.log(`✅ ${section} updated successfully`);
        
        // Update user context with new data directly (don't call updateUserProfile again)
        const { user: updatedUser } = result.data;
        setUser(updatedUser);
        
        // Store updated user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update form state with the new data from backend
        setForm(prevForm => ({
          ...prevForm,
          ...updatedUser,
          social: { ...prevForm.social, ...(updatedUser.social || {}) }
        }));
        
        // Reset edit state
        setEdit({ ...edit, [section]: false });
        
        // Show success message
        alert(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`);
      }
    } catch (error) {
      console.error(`❌ Failed to update ${section}:`, error);
      console.error(`❌ Error details:`, {
        message: error.message,
        stack: error.stack,
        section,
        formData: form[section]
      });
      alert(`Failed to update ${section}. Error: ${error.message}`);
    }
  };
  const handleAddListItem = async (section, template) => {
    try {
      // Ensure we have a valid array to work with
      const currentArray = form[section] || [];
      const updatedArray = [...currentArray, template];
      setForm({ ...form, [section]: updatedArray });
      
      console.log(`➕ Adding ${section} item:`, template);
      console.log(`📝 Current ${section} array:`, currentArray);
      console.log(`📝 Updated ${section} array:`, updatedArray);
      
      // For simple list items (interests, skills, languages), don't auto-save empty items
      // Only save when user actually enters content and clicks Save
      if (['interests', 'skills', 'languages'].includes(section) && (!template || template.trim() === '')) {
        console.log(`⏸️ Skipping auto-save for empty ${section} item`);
        return;
      }
      
      // Auto-save to backend for complex objects or non-empty simple items
      let result;
      switch (section) {
        case 'education':
          result = await profileService.updateEducation(updatedArray);
          break;
        case 'experiences':
          result = await profileService.updateExperience(updatedArray);
          break;
        case 'certificates':
          result = await profileService.updateCertificates(updatedArray);
          break;
        case 'skills':
          result = await profileService.updateSkills(updatedArray);
          break;
        case 'languages':
          result = await profileService.updateLanguages(updatedArray);
          break;
        case 'interests':
          // Filter out empty interests before saving
          const filteredInterests = updatedArray.filter(interest => interest && interest.trim() !== '');
          result = await profileService.updateInterests(filteredInterests);
          break;
        default:
          result = await profileService.updateProfile({ [section]: updatedArray });
          break;
      }
      
      if (result.success) {
        console.log(`✅ Added ${section} item successfully`);
        // Update user context with new data directly
        const { user: updatedUser } = result.data;
        setUser(updatedUser);
        
        // Store updated user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update form state with the new data from backend
        setForm(prevForm => ({
          ...prevForm,
          ...updatedUser,
          social: { ...prevForm.social, ...(updatedUser.social || {}) }
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to add ${section} item:`, error);
      // Revert the form state on error - ensure we have a valid array
      const currentArray = form[section] || [];
      if (currentArray.length > 0) {
        const revertedArray = currentArray.slice(0, -1);
        setForm({ ...form, [section]: revertedArray });
      }
      alert(`Failed to add ${section} item. Please try again.`);
    }
  };

  const handleRemoveListItem = async (section, idx) => {
    // Store the original item before removing it - ensure we have a valid array
    const originalArray = [...(form[section] || [])];
    const removedItem = originalArray[idx];
    
    try {
      const updated = [...(form[section] || [])];
      updated.splice(idx, 1);
      setForm({ ...form, [section]: updated });
      
      // Auto-save to backend
      let result;
      switch (section) {
        case 'education':
          result = await profileService.updateEducation(updated);
          break;
        case 'experiences':
          result = await profileService.updateExperience(updated);
          break;
        case 'certificates':
          result = await profileService.updateCertificates(updated);
          break;
        case 'skills':
          result = await profileService.updateSkills(updated);
          break;
        case 'languages':
          result = await profileService.updateLanguages(updated);
          break;
        case 'interests':
          result = await profileService.updateInterests(updated);
          break;
        default:
          result = await profileService.updateProfile({ [section]: updated });
          break;
      }
      
      if (result.success) {
        console.log(`✅ Removed ${section} item successfully`);
        // Update user context with new data directly
        const { user: updatedUser } = result.data;
        setUser(updatedUser);
        
        // Store updated user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update form state with the new data from backend
        setForm(prevForm => ({
          ...prevForm,
          ...updatedUser,
          social: { ...prevForm.social, ...(updatedUser.social || {}) }
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to remove ${section} item:`, error);
      // Revert the form state on error by restoring the original array
      setForm({ ...form, [section]: originalArray });
      alert(`Failed to remove ${section} item. Please try again.`);
    }
  };

  // Profile picture edit handler
  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
      setForm({ ...form, profilePic: URL.createObjectURL(e.target.files[0]) });
    }
  };
  
  const handleProfilePicSave = async () => {
    if (!profilePicFile) {
      console.warn('No profile picture file selected');
      return;
    }

    try {
      console.log('Starting profile picture upload...');
      
      // Use the new profile service for upload
      const result = await profileService.uploadProfilePicture(profilePicFile);
      
      console.log('Upload result:', result);
      
      if (result.success) {
        console.log('Upload successful, updating user data...');
        console.log('Updated user data from backend:', result.data.user);
        
        // Update the user context with new profile data directly
        const { user: updatedUser } = result.data;
        setUser(updatedUser);
        
        // Store updated user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Updated localStorage with new user data');
        
        // Update form state with the new data from backend
        setForm(prevForm => ({
          ...prevForm,
          ...updatedUser,
          social: { ...prevForm.social, ...(updatedUser.social || {}) }
        }));
        
        // Reset edit state
        setEdit({ ...edit, profilePic: false });
        setProfilePicFile(null);
        
        console.log('Profile picture update completed successfully');
        alert('Profile picture updated successfully!');
      } else {
        console.error('Upload failed:', result.message);
        alert('Failed to upload profile picture: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };
  
  const handleProfilePicCancel = () => {
    setForm({ ...form, profilePic: user.profilePic });
    setEdit({ ...edit, profilePic: false });
    setProfilePicFile(null);
  };

  const handleDegreeFileChange = (e, idx) => {
    if (e.target.files && e.target.files[0]) {
      setDegreeFiles({ ...degreeFiles, [idx]: e.target.files[0] });
      const updated = [...form.education];
      updated[idx].degreeFileName = e.target.files[0].name;
      setForm({ ...form, education: updated });
    }
  };
  
  const handleCertificateFileChange = (e, idx) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFiles({ ...certificateFiles, [idx]: e.target.files[0] });
      const updated = [...form.certificates];
      updated[idx].certificateFileName = e.target.files[0].name;
      setForm({ ...form, certificates: updated });
    }
  };

  // Don't render until we have user data or if loading
  if (loading && (!user || !form || Object.keys(form).length === 0)) {
    return (
      <Container>
        <GlassWrapper>
          <ProfileHeader>
            <Title>Loading Profile...</Title>
            <Subtitle>Please wait while we load your information</Subtitle>
          </ProfileHeader>
        </GlassWrapper>
      </Container>
    );
  }

  // If we don't have user data at all, show loading
  if (!user) {
    return (
      <Container>
        <GlassWrapper>
          <ProfileHeader>
            <Title>Loading Profile...</Title>
            <Subtitle>Please wait while we load your information</Subtitle>
          </ProfileHeader>
        </GlassWrapper>
      </Container>
    );
  }

  // Ensure form is initialized with user data if it's empty
  const currentForm = form && Object.keys(form).length > 0 ? form : user;

  // Check profile picture URL
  console.log('Profile picture URL:', user?.profilePic);
  console.log('User data:', user);

  return (
    <Container>
      <GlassWrapper>
        <ProfileHeader>
          <Title>{t('profile.title', 'Profile')}</Title>
          <Subtitle>{t('profile.subtitle', 'Your personal information and achievements')}</Subtitle>
        </ProfileHeader>
        <ContentArea>
          <FlexRow>
            <LeftColumn>
              {/* Profile Picture */}
              <ProfilePictureSection>
                <FloatingEditButton onClick={() => setEdit({ ...edit, profilePic: true })} type="button" aria-label="Edit profile picture"><FiEdit /></FloatingEditButton>
                
                {edit.profilePic ? (
                  <>
                    <ProfilePicWrapper>
                      {currentForm.profilePic ? (
                        <ProfilePic 
                          src={currentForm.profilePic} 
                          alt="Profile" 
                          onError={(e) => {
                            console.log('Profile image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        // Just solid color background, no text
                        <div style={{ width: '100%', height: '100%' }}></div>
                      )}
                    </ProfilePicWrapper>
                    <Input type="file" accept="image/*" onChange={handleProfilePicChange} />
                    <ActionButtons>
                      <SaveButton onClick={handleProfilePicSave}>{t('profile.save', 'Save')}</SaveButton>
                      <CancelButton onClick={handleProfilePicCancel}>{t('profile.cancel', 'Cancel')}</CancelButton>
                    </ActionButtons>
                  </>
                ) : (
                  <>
                    <ProfilePicWrapper>
                      {user.profilePic ? (
                        <ProfilePic 
                          src={user.profilePic} 
                          alt="Profile" 
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.log('Profile image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            console.log('Profile image loaded successfully:', e.target.src);
                          }}
                        />
                      ) : (
                        // Show placeholder when no profile picture
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          backgroundColor: '#007bff',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}>
                          {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </ProfilePicWrapper>
                    <UserName>{user.firstName} {user.lastName}</UserName>
                    <UserRole>{t(`roles.${userRole || user.role}`, userRole || user.role)}</UserRole>
                    <LocationInfo>
                      <FiMapPin />
                      <span>{user.country}, {user.city}</span>
                    </LocationInfo>
                  </>
                )}
              </ProfilePictureSection>

              {/* Contact Information */}
              <Section>
                <FloatingEditButton onClick={() => handleEdit('contactInfo')} type="button" aria-label="Edit contact information"><FiEdit /></FloatingEditButton>
                <SectionTitle>{t('profile.contactInformation', 'Contact Information')}</SectionTitle>
                {edit.contactInfo ? (
                  <>
                    <Input value={form.email} onChange={e => handleChange(e, 'email')} placeholder="Email" />
                    <Input value={form.phone} onChange={e => handleChange(e, 'phone')} placeholder="Phone" />
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('contact')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('contact')}>Cancel</CancelButton>
                    </ActionButtons>
                  </>
                ) : (
                  <>
                    <ContactItem>
                      <ContactIcon><FiMail /></ContactIcon>
                      <span>{user.email}</span>
                    </ContactItem>
                    <ContactItem>
                      <ContactIcon><FiPhone /></ContactIcon>
                      <span>{user.phone}</span>
                    </ContactItem>
                  </>
                )}
              </Section>

              {/* Social Platforms */}
              <Section>
                <FloatingEditButton onClick={() => handleEdit('social')} type="button" aria-label="Edit social platforms"><FiEdit /></FloatingEditButton>
                <SectionTitle>{t('profile.socialPlatforms', 'Social Platforms')}</SectionTitle>
                {edit.social ? (
                  <>
                    <Input value={form.social?.linkedin || ''} onChange={e => handleChange(e, 'social', null, 'linkedin')} placeholder="LinkedIn (URL or username)" />
                    <Input value={form.social?.twitter || ''} onChange={e => handleChange(e, 'social', null, 'twitter')} placeholder="Twitter (URL or @username)" />
                    <Input value={form.social?.instagram || ''} onChange={e => handleChange(e, 'social', null, 'instagram')} placeholder="Instagram (URL or username)" />
                    <Input value={form.social?.facebook || ''} onChange={e => handleChange(e, 'social', null, 'facebook')} placeholder="Facebook (URL or username)" />
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('social')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('social')}>Cancel</CancelButton>
                    </ActionButtons>
                  </>
                ) : (
                  <>
                    {user.social?.linkedin && (
                      <ContactItem>
                        <ContactIcon><FiLinkedin /></ContactIcon>
                        <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                      </ContactItem>
                    )}
                    {user.social?.twitter && (
                      <ContactItem>
                        <ContactIcon><FiGlobe /></ContactIcon>
                        <a href={user.social.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                      </ContactItem>
                    )}
                    {user.social?.instagram && (
                      <ContactItem>
                        <ContactIcon><FiGlobe /></ContactIcon>
                        <a href={user.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                      </ContactItem>
                    )}
                    {user.social?.facebook && (
                      <ContactItem>
                        <ContactIcon><FiGlobe /></ContactIcon>
                        <a href={user.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                      </ContactItem>
                    )}
                  </>
                )}
              </Section>

              {/* Interests */}
              <Section>
                <FloatingEditButton onClick={() => handleEdit('interests')} type="button" aria-label="Edit interests"><FiEdit /></FloatingEditButton>
                <SectionTitle>{t('profile.interests', 'Interests')}</SectionTitle>
                {edit.interests ? (
                  <>
                    {(form.interests || []).map((interest, idx) => (
                      <FormRow key={idx}>
                        <Input
                          value={interest}
                          onChange={e => handleChange(e, 'interests', idx)}
                          placeholder="Interest"
                        />
                        <RemoveButton type="button" onClick={() => handleRemoveListItem('interests', idx)}>Remove</RemoveButton>
                      </FormRow>
                    ))}
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('interests')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('interests')}>Cancel</CancelButton>
                      <FloatingAddButton type="button" onClick={() => handleAddListItem('interests', '')} aria-label="Add interest"><FiPlus /></FloatingAddButton>
                    </ActionButtons>
                  </>
                ) : (
                  <SkillsGrid>
                    {(user.interests || []).map((interest, idx) => (
                      <SkillTag key={idx}>{interest}</SkillTag>
                    ))}
                  </SkillsGrid>
                )}
              </Section>
            </LeftColumn>

            <RightColumn>
              {/* Work Experience */}
              <Section>
                <FloatingEditButton onClick={() => handleEdit('experiences')} type="button" aria-label="Edit work experience"><FiEdit /></FloatingEditButton>
                <SectionTitle>{t('profile.workExperience', 'Work Experience')}</SectionTitle>
                {edit.experiences ? (
                  <>
                    {(form.experiences || []).map((exp, idx) => (
                      <div key={idx} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <Input value={exp.title || ''} onChange={e => handleChange(e, 'experiences', idx, 'title')} placeholder="Job Title" />
                        <Input value={exp.company || ''} onChange={e => handleChange(e, 'experiences', idx, 'company')} placeholder="Company" />
                        <FormRow>
                          <Select value={exp.startMonth || ''} onChange={e => handleChange(e, 'experiences', idx, 'startMonth')}>
                            <option value="">Start Month</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </Select>
                          <Select value={exp.startYear || ''} onChange={e => handleChange(e, 'experiences', idx, 'startYear')}>
                            <option value="">Start Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </Select>
                          <Select value={exp.endMonth || ''} onChange={e => handleChange(e, 'experiences', idx, 'endMonth')}>
                            <option value="">End Month</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </Select>
                          <Select value={exp.endYear || ''} onChange={e => handleChange(e, 'experiences', idx, 'endYear')}>
                            <option value="">End Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                            <option value="Present">Present</option>
                          </Select>
                        </FormRow>
                        <TextArea value={exp.summary || ''} onChange={e => handleChange(e, 'experiences', idx, 'summary')} placeholder="Summary of your role and achievements" />
                        <RemoveButton type="button" onClick={() => handleRemoveListItem('experiences', idx)}>Remove</RemoveButton>
                      </div>
                    ))}
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('experiences')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('experiences')}>Cancel</CancelButton>
                      <FloatingAddButton type="button" onClick={() => handleAddListItem('experiences', { title: '', company: '', years: '', summary: '', startMonth: '', startYear: '', endMonth: '', endYear: '' })} aria-label="Add experience"><FiPlus /></FloatingAddButton>
                    </ActionButtons>
                  </>
                ) : (
                  <>
                    {(user.experiences || []).map((exp, idx) => (
                      <ExperienceCard key={idx}>
                        <ExperienceTitle>{exp.title}</ExperienceTitle>
                        <ExperienceCompany>{exp.company}</ExperienceCompany>
                        {exp.startMonth && exp.startYear && (
                          <ExperienceDate>
                            {exp.startMonth} {exp.startYear}
                            {exp.endMonth && exp.endYear
                              ? ` - ${exp.endMonth} ${exp.endYear}`
                              : exp.endYear === 'Present'
                                ? ' - Present'
                                : ''}
                          </ExperienceDate>
                        )}
                        <ExperienceDescription>{exp.summary}</ExperienceDescription>
                      </ExperienceCard>
                    ))}
                  </>
                )}
              </Section>

              {/* Education */}
              <Section>
                <FloatingEditButton onClick={() => handleEdit('education')} type="button" aria-label="Edit education"><FiEdit /></FloatingEditButton>
                <SectionTitle>{t('profile.education', 'Education')}</SectionTitle>
                {edit.education ? (
                  <>
                    {(form.education || []).map((edu, idx) => (
                      <div key={idx} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <Input value={edu.degree || ''} onChange={e => handleChange(e, 'education', idx, 'degree')} placeholder="Degree" />
                        <Input value={edu.school || ''} onChange={e => handleChange(e, 'education', idx, 'school')} placeholder="School" />
                        <FormRow>
                          <Select value={edu.startMonth || ''} onChange={e => handleChange(e, 'education', idx, 'startMonth')}>
                            <option value="">Start Month</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </Select>
                          <Select value={edu.startYear || ''} onChange={e => handleChange(e, 'education', idx, 'startYear')}>
                            <option value="">Start Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </Select>
                          <Select value={edu.endMonth || ''} onChange={e => handleChange(e, 'education', idx, 'endMonth')}>
                            <option value="">End Month</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </Select>
                          <Select value={edu.endYear || ''} onChange={e => handleChange(e, 'education', idx, 'endYear')}>
                            <option value="">End Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                            <option value="Present">Present</option>
                          </Select>
                        </FormRow>
                        <TextArea value={edu.summary || ''} onChange={e => handleChange(e, 'education', idx, 'summary')} placeholder="Summary of what you studied" />
                        <div style={{ marginBottom: '0.5rem' }}>
                          <input type="file" accept="application/pdf,image/*" onChange={e => handleDegreeFileChange(e, idx)} />
                          {edu.degreeFileName && <span style={{ marginLeft: '0.5rem' }}>{edu.degreeFileName}</span>}
                        </div>
                        <RemoveButton type="button" onClick={() => handleRemoveListItem('education', idx)}>Remove</RemoveButton>
                      </div>
                    ))}
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('education')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('education')}>Cancel</CancelButton>
                      <FloatingAddButton type="button" onClick={() => handleAddListItem('education', { degree: '', school: '', years: '', summary: '', startMonth: '', startYear: '', endMonth: '', endYear: '', degreeFileName: '' })} aria-label="Add education"><FiPlus /></FloatingAddButton>
                    </ActionButtons>
                  </>
                ) : (
                  <>
                    {(user.education || []).map((edu, idx) => (
                      <ExperienceCard key={idx}>
                        <ExperienceTitle>{edu.degree}</ExperienceTitle>
                        <ExperienceCompany>{edu.school}</ExperienceCompany>
                        {edu.startMonth && edu.startYear && (
                          <ExperienceDate>
                            {edu.startMonth} {edu.startYear}
                            {edu.endMonth && edu.endYear
                              ? ` - ${edu.endMonth} ${edu.endYear}`
                              : edu.endYear === 'Present'
                                ? ' - Present'
                                : ''}
                          </ExperienceDate>
                        )}
                        {edu.summary && <ExperienceDescription>{edu.summary}</ExperienceDescription>}
                        {edu.degreeFileName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <FiFile style={{ color: '#3b82f6' }} />
                            <a href="#" style={{ color: '#3b82f6' }} download>{edu.degreeFileName}</a>
                          </div>
                        )}
                      </ExperienceCard>
                    ))}
                  </>
                )}
              </Section>

              {/* Skills */}
              <Section>
                <FloatingEditButton onClick={() => handleEdit('skills')} type="button" aria-label="Edit skills"><FiEdit /></FloatingEditButton>
                <SectionTitle>{t('profile.skills', 'Skills')}</SectionTitle>
                {edit.skills ? (
                  <>
                    {(form.skills || []).map((skill, idx) => (
                      <FormRow key={idx}>
                        <Input value={skill} onChange={e => handleChange(e, 'skills', idx)} placeholder="Skill" />
                        <RemoveButton type="button" onClick={() => handleRemoveListItem('skills', idx)}>Remove</RemoveButton>
                      </FormRow>
                    ))}
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('skills')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('skills')}>Cancel</CancelButton>
                      <FloatingAddButton type="button" onClick={() => handleAddListItem('skills', '')} aria-label="Add skill"><FiPlus /></FloatingAddButton>
                    </ActionButtons>
                  </>
                ) : (
                  <SkillsGrid>
                    {(user.skills || []).map((skill, idx) => (
                      <SkillTag key={idx}>{skill}</SkillTag>
                    ))}
                  </SkillsGrid>
                )}
              </Section>

              {/* Languages */}
              <Section>
                <SectionHeader>
                  <SectionIcon><FiGlobe /></SectionIcon>
                  <SectionTitle>Languages</SectionTitle>
                  <FloatingEditButton onClick={() => handleEdit('languages')} type="button" aria-label="Edit languages"><FiEdit /></FloatingEditButton>
                </SectionHeader>
                {edit.languages ? (
                  <>
                    {(form.languages || []).map((language, idx) => (
                      <FormRow key={idx}>
                        <Input
                          value={language}
                          onChange={e => handleChange(e, 'languages', idx)}
                          placeholder="Language"
                        />
                        <RemoveButton type="button" onClick={() => handleRemoveListItem('languages', idx)}>Remove</RemoveButton>
                      </FormRow>
                    ))}
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('languages')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('languages')}>Cancel</CancelButton>
                      <FloatingAddButton type="button" onClick={() => handleAddListItem('languages', '')} aria-label="Add language"><FiPlus /></FloatingAddButton>
                    </ActionButtons>
                  </>
                ) : (
                  <SkillsGrid>
                    {(user.languages || []).map((language, idx) => (
                      <SkillTag key={idx}>{language}</SkillTag>
                    ))}
                  </SkillsGrid>
                )}
              </Section>

              {/* Certificates */}
              <Section>
                <SectionHeader>
                  <SectionIcon><FiAward /></SectionIcon>
                  <SectionTitle>Certificates</SectionTitle>
                  <FloatingEditButton onClick={() => handleEdit('certificates')} type="button" aria-label="Edit certificates"><FiEdit /></FloatingEditButton>
                </SectionHeader>
                {edit.certificates ? (
                  <>
                    {(form.certificates || []).map((cert, idx) => (
                      <div key={idx} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <Input value={cert.title || ''} onChange={e => handleChange(e, 'certificates', idx, 'title')} placeholder="Certificate Title" />
                        <FormRow>
                          <Select value={cert.startMonth || ''} onChange={e => handleChange(e, 'certificates', idx, 'startMonth')}>
                            <option value="">Start Month</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </Select>
                          <Select value={cert.startYear || ''} onChange={e => handleChange(e, 'certificates', idx, 'startYear')}>
                            <option value="">Start Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </Select>
                          <Select value={cert.endMonth || ''} onChange={e => handleChange(e, 'certificates', idx, 'endMonth')}>
                            <option value="">End Month</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </Select>
                          <Select value={cert.endYear || ''} onChange={e => handleChange(e, 'certificates', idx, 'endYear')}>
                            <option value="">End Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                            <option value="Present">Present</option>
                          </Select>
                        </FormRow>
                        <TextArea value={cert.summary || ''} onChange={e => handleChange(e, 'certificates', idx, 'summary')} placeholder="Summary of what you learned" />
                        <div style={{ marginBottom: '0.5rem' }}>
                          <input type="file" accept="application/pdf,image/*" onChange={e => handleCertificateFileChange(e, idx)} />
                          {cert.certificateFileName && <span style={{ marginLeft: '0.5rem' }}>{cert.certificateFileName}</span>}
                        </div>
                        <RemoveButton type="button" onClick={() => handleRemoveListItem('certificates', idx)}>Remove</RemoveButton>
                      </div>
                    ))}
                    <ActionButtons>
                      <SaveButton onClick={() => handleSave('certificates')}>Save</SaveButton>
                      <CancelButton onClick={() => handleCancel('certificates')}>Cancel</CancelButton>
                      <FloatingAddButton type="button" onClick={() => handleAddListItem('certificates', { title: '', summary: '', certificateFileName: '', startMonth: '', startYear: '', endMonth: '', endYear: '' })} aria-label="Add certificate"><FiPlus /></FloatingAddButton>
                    </ActionButtons>
                  </>
                ) : (
                  <>
                    {(user.certificates || []).map((cert, idx) => (
                      <ExperienceCard key={idx}>
                        <ExperienceTitle>{cert.title || cert}</ExperienceTitle>
                        {(cert.startMonth && cert.startYear) && (
                          <ExperienceDate>
                            {cert.startMonth} {cert.startYear}
                            {(cert.endMonth && cert.endYear) ? ` - ${cert.endMonth} ${cert.endYear}` : cert.endYear === 'Present' ? ' - Present' : ''}
                          </ExperienceDate>
                        )}
                        {cert.summary && <ExperienceDescription>{cert.summary}</ExperienceDescription>}
                        {cert.certificateFileName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <FiFile style={{ color: '#3b82f6' }} />
                            <a href="#" style={{ color: '#3b82f6' }} download>{cert.certificateFileName}</a>
                          </div>
                        )}
                      </ExperienceCard>
                    ))}
                  </>
                )}
              </Section>
            </RightColumn>
          </FlexRow>
        </ContentArea>
      </GlassWrapper>
    </Container>
  );
};

export default Profile;