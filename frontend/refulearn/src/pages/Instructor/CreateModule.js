import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Delete, Edit } from '@mui/icons-material';
import AssessmentCreator from '../../components/AssessmentCreator';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const BLUE = '#007bff';
const BLACK = '#000';
const WHITE = '#fff';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f4f8fb;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  background: ${WHITE};
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 800px;
`;

const Title = styled.h1`
  color: ${BLUE};
  text-align: center;
  margin-bottom: 1.5rem;
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

const SectionTitle = styled.h3`
  color: ${BLUE};
  margin-top: 18px;
  margin-bottom: 0.5rem;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
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

const SmallAddButton = styled(SaveButton)`
  padding: 0.4rem 1.2rem;
  font-size: 1rem;
  border-radius: 16px;
  margin-top: 0.2rem;
  margin-left: auto;
  display: block;
`;

export default function CreateModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseData, module: editModule } = location.state || {};
  const [modules, setModules] = useState(courseData?.modules || []);
  const [module, setModule] = useState(() => {
    // If editing existing module, load its data
    if (editModule) {
      return {
        _id: editModule._id,
        title: editModule.title || '',
        description: editModule.description || '',
        content: Array.isArray(editModule.content) 
          ? editModule.content.map((c, idx) => ({
              id: idx,
              content: typeof c === 'string' ? c : c.content || c
            }))
          : editModule.content ? [{ id: 0, content: editModule.content }] : [],
        contentItems: editModule.contentItems || [],
        assessments: editModule.assessments || [],
        quizzes: editModule.quizzes || [],
        discussions: editModule.discussions || [],
        order: editModule.order || (courseData?.modules?.length || 0) + 1,
        duration: editModule.duration || '30 minutes',
        isMandatory: editModule.isMandatory !== undefined ? editModule.isMandatory : true,
        content_type: editModule.content_type || 'text content'
      };
    }
    
    // Default for new module
    return {
    title: '',
    description: '',
    content: [],
    contentItems: [],
    assessments: [],
    quizzes: [],
    discussions: [],
    order: (courseData?.modules?.length || 0) + 1,
    content_type: 'article'
    };
  });
  
  const [isEditMode, setIsEditMode] = useState(!!editModule);
  const [loadedAssessments, setLoadedAssessments] = useState([]);
  const [contentDraft, setContentDraft] = useState({ content: '' });
  const [assessmentDraft, setAssessmentDraft] = useState({ title: '', description: '' });
  const [discussionDraft, setDiscussionDraft] = useState({ title: '', content: '' });
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [quizDraft, setQuizDraft] = useState({ title: '', description: '' });
  const [quizzes, setQuizzes] = useState(editModule?.quizzes || []);
  const [showAssessmentCreator, setShowAssessmentCreator] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [contentItems, setContentItems] = useState(
    editModule?.contentItems || 
    (location.state?.module?.contentItems) || 
    []
  );
  const [contentItemDraft, setContentItemDraft] = useState({
    type: 'article',
    title: '',
    url: '',
    description: '',
    file: null,
    fileName: ''
  });

  // Load existing assessments when in edit mode
  useEffect(() => {
    const loadExistingAssessments = async () => {
      if (isEditMode && courseData?.courseId) {
        try {
          const token = localStorage.getItem('token');
          const isOnline = navigator.onLine;
          
          let assessmentsData = [];

          if (isOnline) {
            try {
              // Try online API calls first (preserving existing behavior)
              console.log('🌐 Online mode: Fetching assessments from API...');
              
              const response = await fetch(`/api/courses/${courseData.courseId}/assessments`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok) {
                const data = await response.json();
                assessmentsData = data.data.assessments || [];
                console.log('✅ Assessments data received');
                
                // Store assessments for offline use
                await offlineIntegrationService.storeAssessments(courseData.courseId, assessmentsData);
              } else {
                throw new Error('Failed to fetch assessments');
              }

            } catch (onlineError) {
              console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
              
              // Fall back to offline data if online fails
              assessmentsData = await offlineIntegrationService.getAssessments(courseData.courseId);
            }
          } else {
            // Offline mode: use offline services
            console.log('📴 Offline mode: Using offline assessments data...');
            assessmentsData = await offlineIntegrationService.getAssessments(courseData.courseId);
          }

          setLoadedAssessments(assessmentsData);
        } catch (error) {
          console.error('❌ Error loading assessments:', error);
        }
      }
    };
    
    loadExistingAssessments();
  }, [isEditMode, courseData?.courseId]);

  // Clean up duplicate discussions when they change
  useEffect(() => {
    if (module.discussions && module.discussions.length > 1) {
      const uniqueDiscussions = [];
      const seenIds = new Set();
      
      module.discussions.forEach(discussion => {
        if (!seenIds.has(discussion.id)) {
          seenIds.add(discussion.id);
          uniqueDiscussions.push(discussion);
        }
      });
      
      if (uniqueDiscussions.length !== module.discussions.length) {
        console.log('Removing duplicate discussions:', module.discussions.length - uniqueDiscussions.length);
        setModule(prev => ({
          ...prev,
          discussions: uniqueDiscussions
        }));
      }
    }
  }, [module.discussions.length]);

  const handleAddContent = () => {
          setModule({
        ...module,
        content: [...module.content, { ...contentDraft, id: `content_${Date.now()}_${Math.random()}` }],
      });
    setContentDraft({ content: '' });
  };

  const handleAddContentItem = () => {
    if (!contentItemDraft.title) {
      alert('Please enter a title for the content item');
      return;
    }

    const newItem = {
      ...contentItemDraft,
      id: `content_item_${Date.now()}_${Math.random()}`,
      dateAdded: new Date().toISOString()
    };

    console.log('🔧 ADD CONTENT ITEM - Adding item:', newItem);
    console.log('🔧 ADD CONTENT ITEM - Current contentItems:', contentItems);
    
    setContentItems([...contentItems, newItem]);
    
    console.log('🔧 ADD CONTENT ITEM - New contentItems will be:', [...contentItems, newItem]);
    
    setContentItemDraft({
      type: 'article',
      title: '',
      url: '',
      description: '',
      file: null,
      fileName: ''
    });
  };

  const handleRemoveContentItem = (itemId) => {
    setContentItems(contentItems.filter(item => item.id !== itemId));
  };

  const handleEditContentItem = (item) => {
    setContentItemDraft({
      type: item.type,
      title: item.title,
      url: item.url || '',
      description: item.description || '',
      file: item.file || null,
      fileName: item.fileName || ''
    });
    handleRemoveContentItem(item.id);
  };
  const handleAddAssessment = (assessmentData, originalAssessment) => {
    if (originalAssessment) {
      // Editing existing assessment
      setModule({
        ...module,
        assessments: module.assessments.map(a => 
          a.id === originalAssessment.id ? { ...assessmentData, id: originalAssessment.id } : a
        ),
      });
    } else {
      // Adding new assessment
      setModule({
        ...module,
        assessments: [...module.assessments, { ...assessmentData, id: `assessment_${Date.now()}_${Math.random()}` }],
      });
    }
    setEditingAssessment(null);
  };
  const handleAddDiscussion = () => {
    if (editingDiscussion) {
      // Update existing discussion
      const updatedDiscussions = module.discussions.map(d => 
        d.id === editingDiscussion.id 
          ? { ...discussionDraft, id: editingDiscussion.id }
          : d
      );
      setModule({
        ...module,
        discussions: updatedDiscussions
      });
      setEditingDiscussion(null);
    } else {
      // Add new discussion
      const newDiscussion = { 
        ...discussionDraft, 
        id: `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
      setModule({
        ...module,
        discussions: [...module.discussions, newDiscussion]
      });
    }
    setDiscussionDraft({ title: '', content: '' });
  };
  const handleAddQuiz = async (quizData, originalQuiz) => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online quiz save first
          console.log('🌐 Online mode: Saving quiz...');
          
          // Get course ID and module ID from the current context
          const courseId = courseData?._id || courseData?.courseId || location.state?.courseData?._id;
          const moduleId = module?._id || editModule?._id || `module_${Date.now()}_temp`;
          
          console.log('📍 Course Data:', courseData);
          console.log('📍 Course ID:', courseId, 'Module ID:', moduleId);
          console.log('📍 Module state:', module);
          
          // Handle case where we might not have courseId yet for new modules
          if (!courseId) {
            console.warn('⚠️ No course ID available - quiz will be created without course association');
            // You can still create the quiz, but it won't be associated with a specific course/module initially
          }
          
          const quizToSave = {
            title: quizData.title,
            description: quizData.description || '',
            courseId: courseId || '', // Allow empty courseId for now
            moduleId: moduleId || '', // Allow empty moduleId for now  
            duration: quizData.timeLimit || 30,
            totalPoints: quizData.totalPoints || quizData.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0,
            passingScore: quizData.passingScore || 70,
            dueDate: quizData.dueDate || null,
            questions: quizData.questions || []
          };
          
          console.log('💾 Quiz data to save:', quizToSave);
          
          if (originalQuiz && originalQuiz._id) {
            // Update existing quiz
            console.log('🔄 Updating existing quiz:', originalQuiz._id);
            const response = await fetch(`/api/instructor/quizzes/${originalQuiz._id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(quizToSave),
            });
            
            if (response.ok) {
              await response.json(); // Just consume the response
              console.log('✅ Quiz updated successfully');
              
              // Update local state
              const updatedQuiz = { ...quizData, id: originalQuiz.id, _id: originalQuiz._id };
              setQuizzes(quizzes.map(q => 
                q.id === originalQuiz.id ? updatedQuiz : q
              ));
              
              // Also update the module state
              setModule(prevModule => ({
                ...prevModule,
                quizzes: (prevModule.quizzes || []).map(q => 
                  q.id === originalQuiz.id ? updatedQuiz : q
                )
              }));
              
              console.log('✅ Quiz updated in local state:', updatedQuiz);
              alert('Quiz updated successfully!');
            } else {
              const error = await response.json();
              console.error('Failed to update quiz:', error);
              alert('Failed to update quiz: ' + (error.message || 'Unknown error'));
              return;
            }
            
          } else {
            // Create new quiz
            console.log('🆕 Creating new quiz');
            const response = await fetch('/api/instructor/quizzes', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(quizToSave),
            });
            
            if (response.ok) {
              const result = await response.json();
              const savedQuiz = result.data?.quiz || result;
              console.log('✅ Quiz created successfully:', savedQuiz);
              
              // Add to local state with the returned _id
              const newQuiz = { 
                ...quizData, 
                id: `quiz_${Date.now()}_${Math.random()}`,
                _id: savedQuiz._id || savedQuiz.id
              };
              setQuizzes([...quizzes, newQuiz]);
              
              // Also update the module state to include this quiz
              setModule(prevModule => ({
                ...prevModule,
                quizzes: [...(prevModule.quizzes || []), newQuiz]
              }));
              
              console.log('✅ Quiz added to local state:', newQuiz);
              alert('Quiz created and saved successfully!');
            } else {
              const error = await response.json();
              console.error('Failed to create quiz:', error);
              alert('Failed to create quiz: ' + (error.message || 'Unknown error'));
              return;
            }
          }
          
        } catch (onlineError) {
          console.warn('⚠️ Online quiz save failed, using offline:', onlineError);
          
          // Fall back to offline quiz save
          const result = await offlineIntegrationService.saveQuizOffline(quizData, originalQuiz, isEditMode);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline quiz save successful');
            
            // Update local state
            const updatedQuiz = { ...quizData, id: originalQuiz?.id || `quiz_${Date.now()}_${Math.random()}`, _id: result.data.quiz._id || result.data.quiz.id };
            setQuizzes(prevQuizzes => 
              prevQuizzes.map(q => 
                q.id === originalQuiz?.id ? updatedQuiz : q
              )
            );
            
            // Also update the module state
            setModule(prevModule => ({
              ...prevModule,
              quizzes: (prevModule.quizzes || []).map(q => 
                q.id === originalQuiz?.id ? updatedQuiz : q
              )
            }));
            
            console.log('✅ Quiz added to local state (offline):', updatedQuiz);
            alert('Quiz saved offline! Will sync when online.');
          } else {
            throw new Error('Failed to save quiz offline');
          }
        }
        success = true;
      } else {
        // Offline quiz save
        console.log('📴 Offline mode: Saving quiz offline...');
        const result = await offlineIntegrationService.saveQuizOffline(quizData, originalQuiz, isEditMode);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline quiz save successful');
          
          // Update local state
          const updatedQuiz = { ...quizData, id: originalQuiz?.id || `quiz_${Date.now()}_${Math.random()}`, _id: result.data.quiz._id || result.data.quiz.id };
          setQuizzes(prevQuizzes => 
            prevQuizzes.map(q => 
              q.id === originalQuiz?.id ? updatedQuiz : q
            )
          );
          
          // Also update the module state
          setModule(prevModule => ({
            ...prevModule,
            quizzes: (prevModule.quizzes || []).map(q => 
              q.id === originalQuiz?.id ? updatedQuiz : q
            )
          }));
          
          console.log('✅ Quiz added to local state (offline):', updatedQuiz);
          alert('Quiz saved offline! Will sync when online.');
        } else {
          throw new Error('Failed to save quiz offline');
        }
      }

      if (!success) {
        throw new Error('Failed to save quiz');
      }

    } catch (err) {
      console.error('Error saving quiz:', err);
      alert('Error saving quiz: ' + err.message);
      return;
    }
    
    setEditingQuiz(null);
  };
  const handleSaveModuleAndAddAnother = () => {
    const newModule = { ...module, quizzes, contentItems };
    setModules([...modules, newModule]);
    setModule({ 
      title: '', 
      description: '', 
      content: [], 
      assessments: [], 
      quizzes: [], 
      discussions: [],
      order: modules.length + 2
    });
    setQuizzes([]);
    setContentItems([]);
    setContentItemDraft({
      type: 'article',
      title: '',
      url: '',
      description: '',
      file: null,
      fileName: ''
    });
  };
  const handleFinishAndCreateCourse = async () => {
    try {
      if (!courseData || !courseData.title || (!courseData.courseImage && !courseData.courseImagePreview && !courseData.courseId)) {
        alert('Please go back and complete the course details first');
        return;
      }
      
      // Prepare all modules (including the current one if it has a title)
      const allModules = [...modules];
      if (module.title) {
        allModules.push({ ...module, quizzes });
      }
      
      if (allModules.length === 0) {
        alert('Please add at least one module');
        return;
      }
      
      // Process modules to ensure proper structure
      const processedModules = allModules.map((mod, index) => {
        console.log('Processing module:', mod); // Debug log
        return {
          _id: mod._id || `module_${Date.now()}_${index}`,
          title: mod.title || 'Untitled Module',
          description: mod.description || '',
          content: Array.isArray(mod.content) ? mod.content.map(c => typeof c === 'string' ? c : c.content) : [],
          contentItems: mod.contentItems || contentItems || [],
          assessments: mod.assessments || [],
          quizzes: mod.quizzes || [],
          discussions: mod.discussions || [],
          order: index + 1,
          duration: mod.duration || '30 minutes',
          isMandatory: mod.isMandatory !== undefined ? mod.isMandatory : true,
          content_type: 'text content',
          content_text: Array.isArray(mod.content) ? mod.content.map(c => typeof c === 'string' ? c : c.content).join('\n') : ''
        };
      });
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('overview', courseData.overview || '');
      formData.append('learningOutcomes', courseData.learningOutcomes || '');
      formData.append('duration', courseData.duration || '');
      formData.append('category', courseData.category || '');
      formData.append('level', courseData.level || 'Beginner');
      formData.append('isPublished', courseData.isPublished || false);
      
      if (courseData.courseImage) {
        formData.append('course_profile_picture', courseData.courseImage);
      }
      
      console.log('All modules being sent:', processedModules); // Debug log
      console.log('🔧 SAVE COURSE - contentItems in modules:', processedModules.map(m => ({ 
        title: m.title, 
        contentItems: m.contentItems 
      })));
      formData.append('modules', JSON.stringify(processedModules));
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again');
        return;
      }
      
      // If editing, send PUT, else POST
      let url, method;
      if (courseData.courseId) {
        url = `/api/courses/${courseData.courseId}`;
        method = 'PUT';
      } else {
        url = '/api/courses';
        method = 'POST';
      }
      
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
      
      // Save assessments and quizzes to backend
      if (result.data?.course?._id) {
        await saveAssessmentsAndQuizzes(result.data.course._id, processedModules);
      }
      
      alert(isEditMode ? 'Course updated successfully!' : 'Course created successfully!');
      navigate('/instructor/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      alert(error.message || 'Failed to save course');
    }
  };

  const handleSaveModuleOnly = async () => {
    try {
      if (!module.title) {
        alert('Please enter a module title');
        return;
      }

      if (!courseData || !courseData.courseId) {
        alert('Course information is missing. Please go back and try again.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again');
        return;
      }

      // Prepare module data for backend
      const moduleData = {
        courseId: courseData.courseId,
        title: module.title,
        description: module.description || '',
        content_type: module.content_type || 'text content',
        content_text: Array.isArray(module.content) 
          ? module.content.map(c => typeof c === 'string' ? c : c.content).join('\n')
          : module.content || '',
        contentItems: JSON.stringify(contentItems || []),
        duration: module.duration || '30 minutes',
        isMandatory: module.isMandatory !== undefined ? module.isMandatory : true,
        order: module.order || 1
      };

      console.log('🔧 SAVE MODULE - contentItems being sent:', contentItems);
      console.log('🔧 SAVE MODULE - moduleData:', moduleData);

      console.log('Saving module data:', moduleData);

      let response;
      if (isEditMode && module._id) {
        // Update existing module
        response = await fetch(`/api/courses/modules/${module._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moduleData),
        });
      } else {
        // Create new module
        response = await fetch('/api/courses/modules', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moduleData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save module');
      }

      const result = await response.json();
      const savedModuleId = result.data.module.id || result.data.module._id;

      console.log('Module saved successfully:', result);

      // Save assessments and quizzes
      await saveAssessmentsAndQuizzes(courseData.courseId, savedModuleId);

      alert(isEditMode ? 'Module updated successfully!' : 'Module created successfully!');
      
      // Navigate back to course overview
      navigate(`/instructor/courses/${courseData.courseId}/overview`);
      
    } catch (error) {
      console.error('Error saving module:', error);
      alert(error.message || 'Failed to save module');
    }
  };

  const saveAssessmentsAndQuizzes = async (courseId, moduleId) => {
    const token = localStorage.getItem('token');
    
    console.log('🔄 Saving assessments, quizzes, and discussions for module:', moduleId);
      
      // Save assessments
      for (const assessment of module.assessments || []) {
        try {
        const assessmentData = {
          ...assessment,
          moduleId,
          courseId
        };

        console.log('📝 Saving assessment:', assessment.title);

        if (assessment._id) {
          // Update existing assessment - using comprehensive endpoint
          await fetch(`/api/courses/modules/${moduleId}/assessments/${assessment._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(assessmentData),
          });
        } else {
          // Create new assessment - using module-specific endpoint
          const response = await fetch(`/api/courses/modules/${moduleId}/assessments`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(assessmentData),
          });
          
          if (!response.ok) {
            const error = await response.json();
            console.error('Assessment creation failed:', error);
          } else {
            console.log('✅ Assessment created successfully');
          }
        }
        } catch (err) {
          console.error('Error saving assessment:', err);
        }
      }
      
    // Save quizzes - using module-specific quiz endpoint
    for (const quiz of quizzes || []) {
      try {
        const quizData = {
          title: quiz.title,
          description: quiz.description || '',
          courseId,
          moduleId,
          duration: quiz.timeLimit || 30,
          totalPoints: quiz.totalPoints || 0,
          passingScore: 70,
          dueDate: quiz.dueDate || null,
          questions: quiz.questions || []
        };

        console.log('🧠 Saving quiz:', quiz.title);

        if (quiz._id) {
          // Update existing quiz - using instructor endpoint  
          await fetch(`/api/instructor/quizzes/${quiz._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(quizData),
          });
        } else {
          // Create new quiz - using instructor endpoint
          const response = await fetch('/api/instructor/quizzes', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(quizData),
          });
          
          if (!response.ok) {
            const error = await response.json();
            console.error('Quiz creation failed:', error);
          } else {
            console.log('✅ Quiz created successfully');
          }
        }
        } catch (err) {
          console.error('Error saving quiz:', err);
        }
    }

    // Save discussions - but only create new ones, don't duplicate existing ones
    const existingDiscussionTitles = new Set();
    
    // First, get existing discussions for this module to avoid duplicates
    try {
      const existingResponse = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        const existingModule = existingData.data?.course?.modules?.find(m => m._id === moduleId);
        if (existingModule && existingModule.discussions) {
          existingModule.discussions.forEach(d => existingDiscussionTitles.add(d.title));
        }
      }
    } catch (err) {
      console.log('Could not fetch existing discussions, proceeding with save');
    }

    for (const discussion of module.discussions || []) {
      try {
        // Skip if discussion already exists in database
        if (existingDiscussionTitles.has(discussion.title)) {
          console.log('⏭️ Skipping existing discussion:', discussion.title);
          continue;
        }

        const discussionData = {
          title: discussion.title,
          content: discussion.content,
          moduleId,
          courseId
        };

        console.log('💬 Creating new discussion:', discussion.title);

        // Create new discussion only
        const response = await fetch(`/api/courses/modules/${moduleId}/discussions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discussionData),
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('Discussion creation failed:', error);
        } else {
          console.log('✅ Discussion created successfully');
          existingDiscussionTitles.add(discussion.title); // Add to set to prevent duplicates in this batch
        }
      } catch (err) {
        console.error('Error saving discussion:', err);
      }
    }
    
    console.log('✅ All assessments, quizzes, and discussions saved successfully');
  };

  return (
    <PageWrapper>
      <Card>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: BLUE,
            fontWeight: 600,
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <ArrowBack style={{ marginRight: 6 }} /> Back to Course Creation
        </button>
        <Title>{isEditMode ? `Edit Module: ${module.title}` : `Module ${module.order}`}</Title>
        
        {/* Show existing modules only if not in edit mode */}
        {!isEditMode && modules.length > 0 && (
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ color: BLUE, marginBottom: '1rem' }}>Existing Modules ({modules.length})</h3>
            {modules.map((mod, idx) => (
              <div key={mod._id || idx} style={{ 
                padding: '0.5rem', 
                marginBottom: '0.5rem', 
                background: WHITE, 
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}>
                <strong>Module {mod.order || idx + 1}:</strong> {mod.title}
                {mod.assessments && mod.assessments.length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    {mod.assessments.length} assessment(s)
                  </div>
                )}
                {mod.quizzes && mod.quizzes.length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {mod.quizzes.length} quiz(zes)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Label style={{ color: BLUE, marginTop: 0 }}>Module Title</Label>
        <Input value={module.title} onChange={e => setModule({ ...module, title: e.target.value })} placeholder="Module title" />
        
        <Label style={{ color: BLUE, marginTop: 16 }}>Module Description</Label>
        <TextArea 
          value={module.description} 
          onChange={e => setModule({ ...module, description: e.target.value })} 
          placeholder="Brief description of what this module covers" 
          rows="2" 
        />
        
        {/* Content Items Management */}
        <SectionTitle>Content Items</SectionTitle>
        
        {/* Content Items List */}
        {contentItems.length > 0 && (
          <ItemList style={{ marginBottom: '1rem' }}>
            {contentItems.map((item, idx) => (
              <Item key={item.id || idx}>
                <div style={{ flex: 1 }}>
                  <ItemTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      background: item.type === 'article' ? '#e3f2fd' : 
                                 item.type === 'video' ? '#fce4ec' : 
                                 item.type === 'audio' ? '#f3e5f5' : 
                                 item.type === 'file' ? '#e8f5e8' : '#fff3e0',
                      color: item.type === 'article' ? '#1976d2' : 
                             item.type === 'video' ? '#c2185b' : 
                             item.type === 'audio' ? '#7b1fa2' : 
                             item.type === 'file' ? '#388e3c' : '#f57c00',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {item.type}
                    </span>
                    {item.title}
                  </ItemTitle>
                  {item.url && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      URL: {item.url}
                    </div>
                  )}
                  {item.fileName && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      File: {item.fileName}
                    </div>
                  )}
                  {item.description && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <ItemActions>
                  <ActionBtn onClick={() => handleEditContentItem(item)} title="Edit">
                    <Edit fontSize="small" />
                  </ActionBtn>
                  <ActionBtn onClick={() => handleRemoveContentItem(item.id)} title="Delete">
                    <Delete fontSize="small" />
                  </ActionBtn>
                </ItemActions>
              </Item>
            ))}
          </ItemList>
        )}
        
        {/* Add Content Item Form */}
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <Label style={{ color: BLUE }}>Content Type</Label>
          <select 
            value={contentItemDraft.type} 
            onChange={e => setContentItemDraft({ ...contentItemDraft, type: e.target.value })}
            style={{
              width: '100%',
              padding: '0.7rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
              background: 'white'
            }}
          >
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="file">File/Document</option>
          </select>
          
          <Label style={{ color: BLUE }}>Title</Label>
          <Input 
            value={contentItemDraft.title} 
            onChange={e => setContentItemDraft({ ...contentItemDraft, title: e.target.value })}
            placeholder="Enter content title" 
          />
          
          <Label style={{ color: BLUE }}>Description (optional)</Label>
          <TextArea 
            value={contentItemDraft.description} 
            onChange={e => setContentItemDraft({ ...contentItemDraft, description: e.target.value })}
            placeholder="Brief description of this content item" 
            rows="2"
          />
          
          {/* URL input for articles and videos */}
          {(contentItemDraft.type === 'article' || contentItemDraft.type === 'video') && (
            <div style={{ marginBottom: '1rem' }}>
              <Label style={{ color: BLUE }}>
                {contentItemDraft.type === 'article' ? 'Article URL' : 'Video URL (YouTube, Vimeo, etc.)'}
              </Label>
              <Input 
                value={contentItemDraft.url} 
                onChange={e => setContentItemDraft({ ...contentItemDraft, url: e.target.value })}
                placeholder={contentItemDraft.type === 'article' ? 'https://example.com/article' : 'https://www.youtube.com/watch?v=...'} 
              />
            </div>
          )}
          
          {/* File Upload for videos, audio, and files */}
          {(contentItemDraft.type === 'video' || contentItemDraft.type === 'audio' || contentItemDraft.type === 'file') && (
            <div style={{ marginBottom: '1rem' }}>
              <Label style={{ color: BLUE }}>
                Upload {contentItemDraft.type === 'video' ? 'Video' : contentItemDraft.type === 'audio' ? 'Audio' : 'File'}
              </Label>
              <input
                type="file"
                accept={
                  contentItemDraft.type === 'video' ? 'video/*' :
                  contentItemDraft.type === 'audio' ? 'audio/*' :
                  '*/*'
                }
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setContentItemDraft({ 
                      ...contentItemDraft, 
                      file: file, 
                      fileName: file.name 
                    });
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              {contentItemDraft.fileName && (
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                  Selected: {contentItemDraft.fileName}
                </div>
              )}
            </div>
          )}
          
          <SmallAddButton 
            onClick={handleAddContentItem} 
            disabled={!contentItemDraft.title || (contentItemDraft.type === 'article' && !contentItemDraft.url && !contentItemDraft.file)}
          >
            Add {contentItemDraft.type === 'article' ? 'Article' : 
                  contentItemDraft.type === 'video' ? 'Video' : 
                  contentItemDraft.type === 'audio' ? 'Audio' : 'File'}
          </SmallAddButton>
        </div>



        <SectionTitle>Content/Lessons</SectionTitle>
          <TextArea value={contentDraft.content} onChange={e => setContentDraft({ ...contentDraft, content: e.target.value })} placeholder="Enter your lesson content, explanations, examples, etc." rows="3" />
          <SmallAddButton onClick={handleAddContent} disabled={!contentDraft.content}>Add Content</SmallAddButton>
          <ItemList>
            {module.content.map((item, idx) => (
              <Item key={item.id || idx}>
                <ItemTitle style={{ flex: 1, wordBreak: 'break-word' }}>
                  {typeof item === 'string' ? item : item.content}
                </ItemTitle>
                <ItemActions>
                  <ActionBtn onClick={() => {
                    const contentText = typeof item === 'string' ? item : item.content;
                    setContentDraft({ content: contentText });
                    setModule({ ...module, content: module.content.filter((_, i) => i !== idx) });
                  }} title="Edit"><Edit fontSize="small" /></ActionBtn>
                  <ActionBtn onClick={() => setModule({ ...module, content: module.content.filter((_, i) => i !== idx) })} title="Delete"><Delete fontSize="small" /></ActionBtn>
                </ItemActions>
              </Item>
            ))}
            {module.content.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic', 
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                No content added yet. Add your lessons above to get started.
              </div>
            )}
          </ItemList>

        <SectionTitle>Assignments/Assessments</SectionTitle>
          <SmallAddButton onClick={() => setShowAssessmentCreator(true)}>Create Assignment</SmallAddButton>
          <ItemList>
            {module.assessments.map((item, idx) => (
              <Item key={item.id || idx}>
                <div style={{ flex: 1 }}>
                  <ItemTitle>{item.title}</ItemTitle>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    {item.questions?.length || 0} questions • {item.totalPoints || 0} points • {item.timeLimit || 30} minutes
                  </div>
                  {item.description && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <ItemActions>
                  <ActionBtn onClick={() => {
                    setEditingAssessment(item);
                    setShowAssessmentCreator(true);
                  }} title="Edit"><Edit fontSize="small" /></ActionBtn>
                  <ActionBtn onClick={() => setModule({ ...module, assessments: module.assessments.filter((_, i) => i !== idx) })} title="Delete"><Delete fontSize="small" /></ActionBtn>
                </ItemActions>
              </Item>
            ))}
            {module.assessments.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic', 
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                No assignments created yet. Add assignments after your content.
              </div>
            )}
          </ItemList>
        
        <SectionTitle>Quizzes</SectionTitle>
          <SmallAddButton onClick={() => setShowQuizCreator(true)}>Create Quiz</SmallAddButton>
          <ItemList>
            {quizzes.map((item, idx) => (
              <Item key={item.id || idx}>
                <div style={{ flex: 1 }}>
                  <ItemTitle>{item.title}</ItemTitle>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    {item.questions?.length || 0} questions • {item.totalPoints || 0} points • {item.timeLimit || 30} minutes
                  </div>
                  {item.description && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <ItemActions>
                  <ActionBtn onClick={() => {
                    setEditingQuiz(item);
                    setShowQuizCreator(true);
                  }} title="Edit"><Edit fontSize="small" /></ActionBtn>
                  <ActionBtn onClick={() => setQuizzes(quizzes.filter((_, i) => i !== idx))} title="Delete"><Delete fontSize="small" /></ActionBtn>
                </ItemActions>
              </Item>
            ))}
            {quizzes.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic', 
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                No quizzes created yet. Add quizzes to test understanding.
              </div>
            )}
          </ItemList>
        
        <SectionTitle>
          Discussions
          {editingDiscussion && (
            <span style={{ fontSize: '0.8rem', color: '#FF9800', marginLeft: '1rem' }}>
              (Editing: {editingDiscussion.title})
            </span>
          )}
        </SectionTitle>
          <Input value={discussionDraft.title} onChange={e => setDiscussionDraft({ ...discussionDraft, title: e.target.value })} placeholder="Discussion topic" />
          <TextArea value={discussionDraft.content} onChange={e => setDiscussionDraft({ ...discussionDraft, content: e.target.value })} placeholder="What should students discuss?" rows="2" />
          <SmallAddButton onClick={handleAddDiscussion} disabled={!discussionDraft.title}>
            {editingDiscussion ? 'Update Discussion' : 'Add Discussion'}
          </SmallAddButton>
          {editingDiscussion && (
            <SmallAddButton 
              onClick={() => {
                setEditingDiscussion(null);
                setDiscussionDraft({ title: '', content: '' });
              }}
              style={{ background: '#6c757d', marginLeft: '0.5rem' }}
            >
              Cancel Edit
            </SmallAddButton>
          )}
          <ItemList>
            {module.discussions.map((item, idx) => (
              <Item key={item.id || idx}>
                <div style={{ flex: 1 }}>
                <ItemTitle>{item.title}</ItemTitle>
                  {item.content && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                    </div>
                  )}
                </div>
                <ItemActions>
                  <ActionBtn onClick={() => {
                    console.log('Editing discussion:', item);
                    setEditingDiscussion(item);
                    setDiscussionDraft({ title: item.title, content: item.content });
                  }} title="Edit"><Edit fontSize="small" /></ActionBtn>
                  <ActionBtn onClick={() => {
                    const updatedDiscussions = module.discussions.filter(d => d.id !== item.id);
                    setModule({ ...module, discussions: updatedDiscussions });
                  }} title="Delete"><Delete fontSize="small" /></ActionBtn>
                </ItemActions>
              </Item>
            ))}
            {module.discussions.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic', 
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                No discussions added. This is optional.
              </div>
            )}
          </ItemList>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, gap: 16 }}>
          {isEditMode ? (
            <SaveButton onClick={handleSaveModuleOnly} disabled={!module.title}>
              Save Module Changes
            </SaveButton>
          ) : (
            <>
          <SaveButton onClick={handleSaveModuleAndAddAnother} disabled={!module.title}>Add Another Module</SaveButton>
          <SaveButton onClick={handleFinishAndCreateCourse} disabled={modules.length === 0 && !module.title}>
                {courseData?.courseId ? 'Update Course' : 'Create Course'}
          </SaveButton>
            </>
          )}
        </div>
        
        <AssessmentCreator
          isOpen={showAssessmentCreator}
          onClose={() => {
            setShowAssessmentCreator(false);
            setEditingAssessment(null);
          }}
          onSave={handleAddAssessment}
          assessment={editingAssessment}
        />
        
        <AssessmentCreator
          isOpen={showQuizCreator}
          onClose={() => {
            setShowQuizCreator(false);
            setEditingQuiz(null);
          }}
          onSave={handleAddQuiz}
          assessment={editingQuiz}
          isQuiz={true}
        />
      </Card>
    </PageWrapper>
  );
} 