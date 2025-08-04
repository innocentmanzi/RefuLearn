import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Add, Delete, Edit, DragIndicator } from '@mui/icons-material';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


const BLUE = '#007bff';
const BLACK = '#000';
const WHITE = '#fff';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f4f8fb;
`;

const Sidebar = styled.div`
  width: 270px;
  background: ${BLUE};
  color: ${WHITE};
  padding: 2rem 1rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  border-radius: 0 24px 24px 0;
`;

const SidebarTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: ${WHITE};
`;

const ModuleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  flex: 1;
`;

const ModuleItem = styled.li`
  background: ${({ active }) => (active ? WHITE : 'transparent')};
  color: ${({ active }) => (active ? BLUE : WHITE)};
  border-radius: 12px;
  margin-bottom: 0.5rem;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  border: 2px solid transparent;
  border-color: ${({ active }) => (active ? BLUE : 'transparent')};
  transition: background 0.2s, color 0.2s;
`;

const AddModuleBtn = styled.button`
  background: ${WHITE};
  color: ${BLUE};
  border: none;
  border-radius: 20px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #e6f0ff;
  }
`;

const Main = styled.div`
  flex: 1;
  padding: 2.5rem 3rem;
`;

const Title = styled.h1`
  color: ${BLUE};
  margin-bottom: 1.5rem;
`;

const Section = styled.div`
  background: ${WHITE};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${BLACK};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const TabBar = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  background: ${({ active }) => (active ? BLUE : WHITE)};
  color: ${({ active }) => (active ? WHITE : BLUE)};
  border: 1px solid ${BLUE};
  border-radius: 20px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Item = styled.li`
  background: #f4f8fb;
  border-radius: 8px;
  margin-bottom: 0.7rem;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ItemTitle = styled.span`
  color: ${BLACK};
  font-weight: 500;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  color: ${BLUE};
  cursor: pointer;
  font-size: 1.2rem;
  &:hover { color: #0056b3; }
`;

const SaveButton = styled.button`
  background: ${BLUE};
  color: ${WHITE};
  border: none;
  border-radius: 20px;
  padding: 0.7rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

const ImagePreview = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 2px solid #007bff;
`;

const initialCourse = {
  title: '',
  overview: '',
  learningOutcomes: '',
  modules: [],
};

const initialModule = {
  title: '',
  description: '',
  content: [],
  assessments: [],
  discussions: [],
};

const PageWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f4f8fb;
`;

const Card = styled.div`
  background: ${WHITE};
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 700px;
`;

const CenteredTitle = styled(Title)`
  text-align: center;
  margin-bottom: 0.5rem;
`;

const HorizontalTabBar = styled(TabBar)`
  justify-content: center;
  margin-bottom: 2.5rem;
`;

const ModalBox = styled(Box)`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  padding: 2rem 2.5rem;
  width: 100%;
  max-width: 540px;
  margin: 5vh auto;
  outline: none;
`;

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  console.log('🎯 CourseBuilder - courseId from URL params:', courseId);
  const [activeTab, setActiveTab] = useState('details');
  const [modules, setModules] = useState([]);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [course, setCourse] = useState(initialCourse);
  const [moduleForm, setModuleForm] = useState(initialModule);
  const [assessmentForm, setAssessmentForm] = useState({ title: '', description: '', dueDate: '' });
  const [discussionForm, setDiscussionForm] = useState({ title: '', content: '' });
  const [editingModuleIdx, setEditingModuleIdx] = useState(null);
  const [itemForm, setItemForm] = useState({ title: '', description: '' });
  const [itemType, setItemType] = useState('content');
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleDraft, setModuleDraft] = useState({
    title: '',
    description: '',
    content: [],
    assessments: [],
    discussions: [],
  });
  const [contentDraft, setContentDraft] = useState({ title: '', content: '' });
  const [assessmentDraft, setAssessmentDraft] = useState({ title: '', description: '' });
  const [discussionDraft, setDiscussionDraft] = useState({ title: '', content: '' });
  const [courseImage, setCourseImage] = useState(null);
  const [courseImagePreview, setCourseImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(null); // null = checking, true = connected, false = disconnected
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ]);

  // Health check function to verify backend is running
  const checkBackendHealth = async () => {
    try {
      const response = await fetch('/health', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const isConnected = response.ok;
      setBackendConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendConnected(false);
      return false;
    }
  };

  // Fetch categories and levels from backend
  const fetchCategoriesAndLevels = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Fetching categories and levels...');
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/courses/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (categoriesResponse.ok) {
        const categoriesApiData = await categoriesResponse.json();
        if (categoriesApiData.success && categoriesApiData.data && categoriesApiData.data.categories) {
          const categoriesData = categoriesApiData.data.categories;
          console.log('✅ Categories data received:', categoriesData.length);
          setCategories(categoriesData);
        }
      } else {
        throw new Error('Failed to fetch categories');
      }
      
      // Fetch levels
      const levelsResponse = await fetch('/api/courses/levels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (levelsResponse.ok) {
        const levelsApiData = await levelsResponse.json();
        if (levelsApiData.success && levelsApiData.data && levelsApiData.data.levels) {
          const levelsData = levelsApiData.data.levels;
          console.log('✅ Levels data received:', levelsData.length);
          setLevels(levelsData);
        }
      } else {
        throw new Error('Failed to fetch levels');
      }
      
    } catch (error) {
      console.error('❌ Error fetching categories and levels:', error);
      // Keep default values if fetch fails
    }
  };

  // Check backend status on component mount
  useEffect(() => {
    checkBackendHealth();
    fetchCategoriesAndLevels();
  }, []);

  // Fetch course data if editing
  useEffect(() => {
    if (courseId) {
      console.log('🔄 Fetching course data for courseId:', courseId);
      setLoading(true);
      const fetchCourseData = async () => {
        try {
          // First check if backend is running
          const isBackendRunning = await checkBackendHealth();
          if (!isBackendRunning) {
            throw new Error('Backend server is not running or not accessible. Please start the backend server first.');
          }

          const token = localStorage.getItem('token');
          console.log('🔑 Token available:', !!token);
          
          // Fetch course details with modules
          console.log('📡 Making API call to:', `/api/courses/${courseId}`);
          const courseResponse = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Check if response is actually JSON
          const contentType = courseResponse.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Backend server may not be running. Expected JSON but received: ${contentType || 'unknown content type'}`);
          }
          
          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            console.log('✅ Course data received:', courseData);
            
            if (courseData.success && courseData.data && courseData.data.course) {
              const c = courseData.data.course;
              console.log('📋 Course object:', c);
              
              // Check if this is fallback data (indicates database connection issues)
              if (c.title === 'Sample Course' && c.overview?.includes('database connection is not available')) {
                console.warn('Received fallback course data - database connection may be unavailable');
                alert('Warning: Database connection unavailable. You are viewing sample data. Please check your backend connection.');
              }
              
              const updatedCourse = {
                title: c.title || '',
                overview: c.overview || '',
                learningOutcomes: c.learningOutcomes || '',
                duration: c.duration || '',
                category: c.category || '',
                level: c.level || 'Beginner',
                isPublished: c.isPublished || false,
                modules: c.modules || [],
              };
              
              console.log('🔄 Setting course state to:', updatedCourse);
              setCourse(updatedCourse);
              
              if (c.course_profile_picture) {
                // Handle Supabase storage URLs
                let imagePath = c.course_profile_picture;
                
                // If it's already a full URL (Supabase), use it directly
                if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                  setCourseImagePreview(imagePath);
                } else if (imagePath.startsWith('uploads/')) {
                  // For local uploads, construct the backend URL
                  imagePath = `http://localhost:5001/${imagePath}`;
                  setCourseImagePreview(imagePath);
                } else if (!imagePath.startsWith('/')) {
                  // Fallback for other cases
                  imagePath = `http://localhost:5001/uploads/${imagePath}`;
                  setCourseImagePreview(imagePath);
                } else {
                  setCourseImagePreview(imagePath);
                }
                
                console.log('Course image path:', imagePath);
              }
              
              // Set modules from the course response (they are already populated by the backend)
              const courseModules = c.modules || [];
                    
                    // Sort modules by order
                    courseModules.sort((a, b) => (a.order || 0) - (b.order || 0));
                    
                    setModules(courseModules);
                    console.log('Loaded modules:', courseModules);
              
              // If we have modules, set the first one as selected
              if (courseModules.length > 0) {
                setSelectedModuleIdx(0);
              }
              
            } else {
              throw new Error('Invalid course data received from server');
            }
          } else {
            let errorMessage;
            try {
              const errorData = await courseResponse.json();
              errorMessage = errorData.message || `HTTP ${courseResponse.status}: ${courseResponse.statusText}`;
            } catch (jsonError) {
              // If we can't parse JSON, it's likely an HTML error page
              const errorText = await courseResponse.text();
              if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html>')) {
                errorMessage = `Backend server may not be running or route not found. Received HTML instead of JSON (Status: ${courseResponse.status})`;
              } else {
                errorMessage = `HTTP ${courseResponse.status}: ${courseResponse.statusText}`;
              }
            }
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('Error fetching course data:', error);
          
          // Provide specific guidance based on error type
          let userMessage = `Failed to load course data: ${error.message}`;
          
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            userMessage += '\n\nPossible solutions:\n1. Check if the backend server is running on port 5000\n2. Verify your internet connection';
          } else if (error.message.includes('Backend server may not be running')) {
            userMessage += '\n\nPlease start the backend server:\n1. Open terminal in backend folder\n2. Run: npm run dev\n3. Wait for "API running at: http://localhost:5000"';
          } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
            userMessage += '\n\nAuthentication issue. Please try logging in again.';
          }
          
          alert(userMessage);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCourseData();
    }
  }, [courseId]);

  // Handlers for adding items
  const handleAddModule = e => {
    e.preventDefault();
    const newModule = {
      ...moduleForm,
      course: courseId,
      id: Date.now(),
      order: modules.length + 1,
      assessments: [],
      discussions: []
    };
    setModules([...modules, newModule]);
    setModuleForm(initialModule);
    setSelectedModuleIdx(modules.length); // auto-select new module
  };

  const handleAddContent = () => {
    setModuleDraft({
      ...moduleDraft,
      content: [...moduleDraft.content, { ...contentDraft, id: Date.now() }],
    });
    setContentDraft({ title: '', content: '' });
  };

  const handleAddAssessment = () => {
    setModuleDraft({
      ...moduleDraft,
      assessments: [...moduleDraft.assessments, { ...assessmentDraft, id: Date.now() }],
    });
    setAssessmentDraft({ title: '', description: '' });
  };

  const handleAddDiscussion = () => {
    setModuleDraft({
      ...moduleDraft,
      discussions: [...moduleDraft.discussions, { ...discussionDraft, id: Date.now() }],
    });
    setDiscussionDraft({ title: '', content: '' });
  };

  const handleSaveModule = () => {
    if (editingModuleIdx !== null) {
      // Update existing module
      const updatedModules = [...modules];
      updatedModules[editingModuleIdx] = { ...moduleDraft };
      setModules(updatedModules);
      setEditingModuleIdx(null);
    } else {
      // Add new module
      setModules([...modules, { ...moduleDraft }]);
    }
    setModuleDraft({ title: '', description: '', content: [], assessments: [], discussions: [] });
    setShowModuleModal(false);
  };

  const handleEditModule = idx => {
    const moduleToEdit = modules[idx];
    if (moduleToEdit) {
      // Navigate to module edit page with module data
      navigate(`/instructor/courses/${courseId}/modules/${moduleToEdit._id}/edit`, {
        state: {
          module: moduleToEdit,
          courseData: {
            ...course,
            courseId,
            modules
          }
        }
      });
    }
  };

  const handleRemoveModule = async (idx) => {
    const moduleToRemove = modules[idx];
    
    if (!window.confirm(`Are you sure you want to delete module "${moduleToRemove.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Delete module from backend if it has an ID
      if (moduleToRemove._id) {
        const response = await fetch(`/api/courses/modules/${moduleToRemove._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete module');
        }
      }

      // Remove from local state
      const updatedModules = modules.filter((_, i) => i !== idx);
      setModules(updatedModules);
      
      // Update course with new module list
      const moduleIds = updatedModules.map(m => m._id).filter(Boolean);
      
      const courseUpdateResponse = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modules: moduleIds
        })
      });

      if (courseUpdateResponse.ok) {
        alert('Module deleted successfully!');
      } else {
        console.warn('Module deleted but course update failed');
      }
      
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module: ' + error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCourseImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Save or update course
  const handleSaveCourse = async () => {
    try {
      if (!course.title || course.title.trim().length < 3) {
        alert('Course title is required and must be at least 3 characters long');
        return;
      }
      if (!course.category) {
        alert('Category is required');
        return;
      }
      if (!courseImage && !courseId) {
        alert('Course profile picture is required');
        return;
      }
      
      // Ensure course has proper overview
      if (!course.overview || course.overview.trim().length < 10) {
        alert('Course overview is required and must be at least 10 characters long');
        return;
      }
      
      // Ensure course has learning outcomes
      if (!course.learningOutcomes || course.learningOutcomes.trim().length < 10) {
        alert('Learning outcomes are required and must be at least 10 characters long');
        return;
      }
      
      // Ensure course has duration
      if (!course.duration || course.duration.trim().length < 3) {
        alert('Course duration is required (e.g., "6 weeks", "8 hours")');
        return;
      }
      
      // Ensure course has at least one module
      if (modules.length === 0) {
        alert('Course must have at least one module');
        return;
      }
      
      // Validate each module has proper content
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        if (!module.title || module.title.trim().length < 3) {
          alert(`Module ${i + 1} must have a title (at least 3 characters)`);
          return;
        }
        if (!module.description || module.description.trim().length < 10) {
          alert(`Module ${i + 1} must have a description (at least 10 characters)`);
          return;
        }
        if (!module.content || (typeof module.content === 'string' && module.content.trim && module.content.trim().length < 20)) {
          alert(`Module ${i + 1} must have content (at least 20 characters)`);
          return;
        }
      }
      setLoading(true);
      
      // Prepare course data for saving
      const processedModules = modules.map((module, index) => ({
        _id: module._id || undefined,
        title: module.title || 'Untitled Module',
        description: module.description || '',
        content: module.content || [],
        assessments: module.assessments || [],
        quizzes: module.quizzes || [],
        discussions: module.discussions || [],
        order: index + 1,
        duration: module.duration || '30 minutes',
        isMandatory: module.isMandatory !== undefined ? module.isMandatory : true
      }));
      
      const courseData = {
        title: course.title,
        overview: course.overview || '',
        learningOutcomes: course.learningOutcomes || '',
        duration: course.duration || '',
        category: course.category || '',
        level: course.level || 'Beginner',
        isPublished: course.isPublished || false,
        modules: processedModules
      };
      
      console.log('🔄 Saving course...');
      
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('overview', course.overview || '');
      formData.append('learningOutcomes', course.learningOutcomes || '');
      formData.append('duration', course.duration || '');
      formData.append('category', course.category || '');
      formData.append('level', course.level || 'Beginner');
      formData.append('isPublished', course.isPublished || false);
      formData.append('modules', JSON.stringify(processedModules));
      
      if (courseImage) {
        formData.append('course_profile_picture', courseImage);
      }
      
      const token = localStorage.getItem('token');
      const url = courseId ? `/api/courses/${courseId}` : '/api/courses';
      const method = courseId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save course');
      }
      
      const result = await response.json();
      const createdCourseId = courseId || result.data?.course?._id;
      
      alert(courseId ? 'Course updated successfully!' : 'Course created successfully!');
      
      // Navigate to course overview to show the new quick action buttons
      if (createdCourseId) {
        navigate(`/instructor/courses/${createdCourseId}/overview`);
      } else {
        navigate('/instructor/courses');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert(error.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <PageWrapper>
          <div style={{ textAlign: 'center', padding: '3rem', color: BLUE }}>
            <h2>Loading course data...</h2>
          </div>
        </PageWrapper>
      </Container>
    );
  }

  // Debug logging for course state
  console.log('🎯 CourseBuilder render - courseId:', courseId, 'course state:', course, 'loading:', loading);

  return (
    <Container>
      <PageWrapper>
        <CenteredTitle style={{ marginTop: '1.2rem', marginBottom: '0.2rem' }}>{courseId ? 'Edit Course' : 'Create New Course'}</CenteredTitle>
        
        {/* Backend Status Indicator - Hidden for cleaner UI */}
        {backendConnected === false && (
          <div style={{ 
            width: '100%', 
            maxWidth: 700, 
            margin: '0 auto 0.5rem auto', 
            padding: '0.5rem', 
            borderRadius: '6px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            fontSize: '0.9rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <>❌ Backend Disconnected - Please start the backend server</>
            <button 
              onClick={checkBackendHealth}
              style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                border: '1px solid #721c24',
                background: 'transparent',
                color: '#721c24',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', marginBottom: '0.3rem' }}>
          <button
            onClick={() => navigate('/instructor/courses')}
            style={{
              background: 'none',
              border: 'none',
              color: BLUE,
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            <ArrowBack style={{ marginRight: 6 }} /> Back to Courses
          </button>
        </div>
        <Card>
          <Label style={{ color: BLUE, marginTop: 0 }}>Course Profile Picture *</Label>
          {courseImagePreview ? (
            <ImagePreview src={courseImagePreview} alt="Course Cover" />
          ) : (
            <div style={{
              width: '120px',
              height: '120px',
              border: '2px dashed #007bff',
              borderRadius: '12px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8f9fa',
              color: '#007bff',
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '0.5rem'
            }}>
              Course Cover
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginBottom: 24 }}
          />
          <Label>Title *</Label>
          <Input
            name="title"
            value={course.title}
            onChange={e => setCourse({ ...course, title: e.target.value })}
            placeholder="Enter course title"
          />
          <Label style={{ color: BLUE, marginTop: 32 }}>Overview</Label>
          <TextArea
            name="overview"
            value={course.overview}
            onChange={e => setCourse({ ...course, overview: e.target.value })}
            placeholder="Enter course overview"
            rows="3"
          />
          <Label style={{ color: BLUE, marginTop: 32 }}>Duration</Label>
          <Input
            name="duration"
            value={course.duration || ''}
            onChange={e => setCourse({ ...course, duration: e.target.value })}
            placeholder="e.g., 4 weeks, 8 hours"
          />
          <Label style={{ color: BLUE, marginTop: 32 }}>Level *</Label>
          <select
            name="level"
            value={course.level || 'Beginner'}
            onChange={e => setCourse({ ...course, level: e.target.value })}
            style={{
              width: '100%',
              padding: '0.7rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          
          <Label style={{ color: BLUE, marginTop: 32 }}>Category *</Label>
          <select
            name="category"
            value={course.category || ''}
            onChange={e => setCourse({ ...course, category: e.target.value })}
            style={{
              width: '100%',
              padding: '0.7rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category._id || category.name} value={category.name}>{category.name}</option>
            ))}
          </select>
          
          <Label style={{ color: BLUE, marginTop: 32 }}>Learning Outcomes</Label>
          <TextArea
            name="learningOutcomes"
            value={course.learningOutcomes}
            onChange={e => setCourse({ ...course, learningOutcomes: e.target.value })}
            placeholder="List learning outcomes (comma separated)"
            rows="2"
          />
          
          {/* Show existing modules if editing */}
          {courseId && modules.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <Label style={{ color: BLUE }}>Existing Modules ({modules.length})</Label>
              <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem' }}>
                {modules.map((module, idx) => (
                  <div key={module._id || idx} style={{ 
                    background: WHITE, 
                    borderRadius: '6px', 
                    padding: '0.8rem', 
                    marginBottom: '0.5rem',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: BLACK }}>
                        Module {module.order || idx + 1}: {module.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        {module.description}
                      </div>
                      {module.assessments && module.assessments.length > 0 && (
                        <div style={{ fontSize: '0.7rem', color: BLUE, marginTop: '0.25rem' }}>
                          📝 {module.assessments.length} assessment(s)
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ActionBtn onClick={() => handleEditModule(idx)} title="Edit">
                        <Edit fontSize="small" />
                      </ActionBtn>
                      <ActionBtn onClick={() => handleRemoveModule(idx)} title="Delete" style={{ color: '#dc3545' }}>
                        <Delete fontSize="small" />
                      </ActionBtn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 }}>
          <AddModuleBtn
            style={{ width: 180, fontSize: '1.05rem', padding: '0.7rem 0', background: '#fff', color: BLUE, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseOver={e => e.currentTarget.style.background='#e6f0ff'}
            onMouseOut={e => e.currentTarget.style.background='#fff'}
            onClick={() => {
              navigate('/instructor/courses/create/module', {
                state: {
                  courseData: {
                    ...course,
                    modules,
                    courseImage,
                    courseImagePreview,
                    courseId
                  }
                }
              });
            }}
          >
            <Add style={{ marginRight: 4, color: BLUE }} /> Add Module
          </AddModuleBtn>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ width: 180, fontSize: '1.05rem', padding: '0.7rem 0', borderRadius: 18, background: BLUE, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', fontWeight: 500, textTransform: 'none' }}
            disabled={loading || !course.title}
            onClick={handleSaveCourse}
          >
            Save Changes
          </Button>
        </div>
      </PageWrapper>
      <Modal open={showModuleModal} onClose={() => setShowModuleModal(false)}>
        <ModalBox>
          <Label>Module Title</Label>
          <Input value={moduleDraft.title} onChange={e => setModuleDraft({ ...moduleDraft, title: e.target.value })} />
          {/* Add fields for description, content, assessments, discussions as needed */}
          <SaveButton onClick={handleSaveModule} disabled={!moduleDraft.title}>
            {editingModuleIdx !== null ? 'Save Module' : 'Add Module'}
          </SaveButton>
        </ModalBox>
      </Modal>
    </Container>
  );
} 