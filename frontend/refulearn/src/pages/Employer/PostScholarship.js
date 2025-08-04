import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;
const Form = styled.form`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  @media (max-width: 600px) {
    padding: 1rem;
    max-width: 98vw;
  }
`;
const Input = styled.input`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  
  &[type="date"] {
    cursor: pointer;
    padding-right: 60px; /* Make room for the calendar icon */
    
    &::-webkit-calendar-picker-indicator {
      display: none; /* Hide the default calendar icon */
    }
  }
`;
const TextArea = styled.textarea`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  min-height: 80px;
`;
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  &:hover {
    background: ${({ theme, disabled }) => !disabled ? theme.colors.secondary : theme.colors.primary};
  }
`;
const SuccessMsg = styled.div`
  color: #27ae60;
  font-weight: 600;
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
`;
const ErrorMsg = styled.div`
  color: #721c24;
  font-weight: 600;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const DateInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CalendarIcon = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.hasValue ? '#007bff' : '#f8f9fa'};
  border: 1px solid ${props => props.hasValue ? '#007bff' : '#ddd'};
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  color: ${props => props.hasValue ? 'white' : '#666'};
  padding: 8px;
  z-index: 1000;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.hasValue ? 'white' : '#007bff'};
    background: ${props => props.hasValue ? '#0056b3' : '#e9ecef'};
    border-color: #007bff;
  }
  
  &:active {
    background: #007bff;
    color: white;
  }
`;



const PostScholarship = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    provider: '',
    location: '',
    benefits: '',
    link: '',
    requirements: '',
    deadline: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const dateInputRef = useRef(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalendarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📅 Calendar icon clicked');
    
    if (dateInputRef.current) {
      try {
        // Try to open the date picker
        if (dateInputRef.current.showPicker) {
          dateInputRef.current.showPicker();
          console.log('✅ Date picker opened successfully');
        } else {
          // Fallback: focus the input and trigger click
          dateInputRef.current.focus();
          dateInputRef.current.click();
          console.log('✅ Date input focused and clicked');
        }
      } catch (error) {
        console.log('❌ Error opening date picker:', error);
        // Final fallback: just focus the input
        dateInputRef.current.focus();
      }
    }
  };

  const handleDateChange = (e) => {
    console.log('📅 Date changed:', e.target.value);
    setForm({ ...form, deadline: e.target.value });
  };



  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('🌐 Posting scholarship...');
      
      const response = await fetch('/api/scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...form,
          requirements: form.requirements ? form.requirements.split(',').map(req => req.trim()) : [],
          deadline: new Date(form.deadline).toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setForm({
          title: '',
          description: '',
          provider: '',
          location: '',
          benefits: '',
          link: '',
          requirements: '',
          deadline: '',
          isActive: true
        });
        setTimeout(() => {
          navigate('/employer/scholarships');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to post scholarship');
      }
    } catch (error) {
      console.error('❌ Scholarship posting error:', error);
      setError('Failed to post scholarship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>{t('post_scholarship')}</Title>
      
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {success && <SuccessMsg>{t('scholarship_posted_successfully')}</SuccessMsg>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Scholarship Title *</Label>
          <Input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="Enter scholarship title" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Description *</Label>
          <TextArea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Describe the scholarship opportunity" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Provider *</Label>
          <Input 
            name="provider" 
            value={form.provider} 
            onChange={handleChange} 
            placeholder="Enter scholarship provider/organization" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Location *</Label>
          <Input 
            name="location" 
            value={form.location} 
            onChange={handleChange} 
            placeholder="Enter scholarship location" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Benefits *</Label>
          <TextArea 
            name="benefits" 
            value={form.benefits} 
            onChange={handleChange} 
            placeholder="List the benefits (e.g., full tuition, monthly stipend, etc.)" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Application Link *</Label>
          <Input 
            name="link" 
            type="url"
            value={form.link} 
            onChange={handleChange} 
            placeholder="Enter application link (https://...)" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Requirements</Label>
          <TextArea 
            name="requirements" 
            value={form.requirements} 
            onChange={handleChange} 
            placeholder="List requirements separated by commas (e.g., Bachelor's degree, GPA 3.0+, etc.)" 
          />
        </FormGroup>

        <FormGroup>
          <Label>Application Deadline *</Label>
          <DateInputWrapper>
            <Input 
              ref={dateInputRef}
              name="deadline" 
              type="date" 
              value={form.deadline} 
              onChange={handleDateChange} 
              min={new Date().toISOString().split('T')[0]}
              required 
            />
            <CalendarIcon 
              type="button" 
              onClick={handleCalendarClick}
              hasValue={!!form.deadline}
            >
              📅
            </CalendarIcon>
          </DateInputWrapper>
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Posting Scholarship...' : t('post_scholarship')}
        </Button>
      </Form>
    </Container>
  );
};
export default PostScholarship; 