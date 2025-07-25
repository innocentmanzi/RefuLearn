import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Delete, Edit } from '@mui/icons-material';
import AssessmentCreator from '../../components/AssessmentCreator';


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
      console.log('🔄 Initializing module state for editing:', editModule);
      console.log('🔄 EditModule discussions:', editModule.discussions);
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
  const [quizzes, setQuizzes] = useState(() => {
    const initialQuizzes = editModule?.quizzes || [];
    // Clean up duplicates in initial state
    const seen = new Map();
    return initialQuizzes.filter(quiz => {
      if (seen.has(quiz.title)) {
        return false;
      }
      seen.set(quiz.title, true);
      return true;
    });
  });
  const [showAssessmentCreator, setShowAssessmentCreator] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  
  // Function to remove duplicate quizzes
  const removeDuplicateQuizzes = (quizList) => {
    const seen = new Set();
    return quizList.filter(quiz => {
      const duplicate = seen.has(quiz.id);
      seen.add(quiz.id);
      return !duplicate;
    });
  };
  
  // Keep module state in sync with quizzes state
  useEffect(() => {
    setModule(prevModule => ({
      ...prevModule,
      quizzes: quizzes
    }));
  }, [quizzes]);
  

  

  const [editingContentItemId, setEditingContentItemId] = useState(null);
  const [contentItems, setContentItems] = useState(
    editModule?.contentItems || 
    (location.state?.module?.contentItems) || 
    []
  );
  
  // Debug logging for content items
  useEffect(() => {
    console.log('🔄 Content Items State:', contentItems);
    console.log('🔄 EditModule contentItems:', editModule?.contentItems);
    console.log('🔄 Location state contentItems:', location.state?.module?.contentItems);
  }, [contentItems, editModule, location.state]);
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
          console.log('🔄 Fetching assessments...');
          
          const response = await fetch(`/api/courses/${courseData.courseId}/assessments`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const assessmentsData = data.data.assessments || [];
            console.log('✅ Assessments data received');
            setLoadedAssessments(assessmentsData);
          } else {
            throw new Error('Failed to fetch assessments');
          }
        } catch (error) {
          console.error('❌ Error loading assessments:', error);
        }
      }
    };
    
    loadExistingAssessments();
  }, [isEditMode, courseData?.courseId]);

  // Load existing discussions when in edit mode
  useEffect(() => {
    const loadExistingDiscussions = async () => {
      if (isEditMode && editModule?._id) {
        try {
          const token = localStorage.getItem('token');
          console.log('🔄 Fetching discussions for module:', editModule._id);
          
          // Fetch the course with populated modules to get discussions
          const response = await fetch(`/api/courses/${courseData?.courseId || courseData?._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const course = data.data.course;
            const moduleWithDiscussions = course.modules?.find(m => m._id === editModule._id);
            
            if (moduleWithDiscussions && moduleWithDiscussions.discussions) {
              console.log('✅ Discussions loaded:', moduleWithDiscussions.discussions.length);
              setModule(prev => ({
                ...prev,
                discussions: moduleWithDiscussions.discussions
              }));
            } else {
              console.log('⚠️ No discussions found for module');
            }
          } else {
            throw new Error('Failed to fetch course data');
          }
        } catch (error) {
          console.error('❌ Error loading discussions:', error);
        }
      }
    };
    
    loadExistingDiscussions();
  }, [isEditMode, editModule?._id, courseData?.courseId, courseData?._id]);

  // Monitor module state changes
  useEffect(() => {
    console.log('🔄 Module state changed:', module);
    console.log('🔄 Discussions in module:', module.discussions);
  }, [module]);

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

  // Load existing content items into draft when editing
  useEffect(() => {
    if (isEditMode && contentItems && contentItems.length > 0) {
      console.log('🔄 Loading existing content items into draft:', contentItems);
      
      // If there are existing content items, populate the draft with the first one
      const firstItem = contentItems[0];
      if (firstItem) {
        console.log('🔄 Populating content item draft with:', firstItem);
        setContentItemDraft({
          type: firstItem.type || 'article',
          title: firstItem.title || '',
          url: firstItem.url || '',
          description: firstItem.description || '',
          file: firstItem.file || null,
          fileName: firstItem.fileName || ''
        });
      }
    }
  }, [isEditMode, contentItems]);

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

    if (editingContentItemId) {
      // Update existing item
      const updatedContentItems = contentItems.map(item => {
        if (item.id === editingContentItemId) {
          return {
            ...item,
            ...contentItemDraft,
            dateAdded: new Date().toISOString()
          };
        }
        return item;
      });

      setContentItems(updatedContentItems);
      setEditingContentItemId(null);
      console.log('🔧 UPDATE CONTENT ITEM - Updated item with ID:', editingContentItemId);
    } else {
      // Add new item
      const newItem = {
        ...contentItemDraft,
        id: `content_item_${Date.now()}_${Math.random()}`,
        dateAdded: new Date().toISOString()
      };

      console.log('🔧 ADD CONTENT ITEM - Adding item:', newItem);
      setContentItems([...contentItems, newItem]);
    }
    
    // Reset draft
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
    console.log('🔄 Editing content item:', item);
    setContentItemDraft({
      type: item.type || 'article',
      title: item.title || '',
      url: item.url || '',
      description: item.description || '',
      file: item.file || null,
      fileName: item.fileName || ''
    });
    setEditingContentItemId(item.id);
  };

  const handleSaveContentItemEdit = () => {
    if (!contentItemDraft.title) {
      alert('Please enter a title for the content item');
      return;
    }

    // Find the item being edited and update it
    const updatedContentItems = contentItems.map(item => {
      if (item.id === editingContentItemId) {
        return {
          ...item,
          ...contentItemDraft,
          dateAdded: new Date().toISOString()
        };
      }
      return item;
    });

    setContentItems(updatedContentItems);
    setContentItemDraft({
      type: 'article',
      title: '',
      url: '',
      description: '',
      file: null,
      fileName: ''
    });
    setEditingContentItemId(null);
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
    console.log('🔄 handleAddDiscussion called');
    console.log('🔄 Current module discussions:', module.discussions);
    console.log('🔄 Discussion draft:', discussionDraft);
    console.log('🔄 Editing discussion:', editingDiscussion);
    
    if (!discussionDraft.title.trim()) {
      alert('Please enter a discussion title');
      return;
    }
    
    if (editingDiscussion) {
      // Update existing discussion
      console.log('🔄 Updating existing discussion');
      const updatedDiscussions = module.discussions.map(d => 
        (d.id === editingDiscussion.id || d._id === editingDiscussion._id)
          ? { ...discussionDraft, id: editingDiscussion.id, _id: editingDiscussion._id }
          : d
      );
      console.log('🔄 Updated discussions:', updatedDiscussions);
      setModule({
        ...module,
        discussions: updatedDiscussions
      });
      setEditingDiscussion(null);
    } else {
      // Add new discussion
      console.log('🔄 Adding new discussion');
      const newDiscussion = { 
        ...discussionDraft, 
        id: `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
      console.log('🔄 New discussion object:', newDiscussion);
      console.log('🔄 Current discussions before adding:', module.discussions);
      
      setModule(prevModule => {
        const updatedModule = {
          ...prevModule,
          discussions: [...(prevModule.discussions || []), newDiscussion]
        };
        console.log('🔄 Module state updated with new discussion:', updatedModule.discussions);
        return updatedModule;
      });
      
      // Force a re-render by logging the state after a brief delay
      setTimeout(() => {
        console.log('🔄 Module state after discussion added:', module);
      }, 100);
    }
    setDiscussionDraft({ title: '', content: '' });
  };
  const handleAddQuiz = async (quizData, originalQuiz) => {
    console.log('🔄 handleAddQuiz called with:');
    console.log('🔄 quizData:', quizData);
    console.log('🔄 originalQuiz:', originalQuiz);
    console.log('🔄 originalQuiz._id:', originalQuiz?._id);
    console.log('🔄 originalQuiz.id:', originalQuiz?.id);
    try {
      const token = localStorage.getItem('token');
      
      console.log('�� Saving quiz...');
      console.log('🔄 Quiz data received:', quizData);
      console.log('🔄 Questions in quiz data:', quizData.questions?.length || 0);
      
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
      
      // Ensure questions are properly structured
      const processedQuestions = (quizData.questions || []).map((question, index) => ({
        _id: question._id || question.id || `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        question: question.question || '',
        type: question.type || 'multiple-choice',
        options: question.options || [],
        correctAnswer: question.correctAnswer || '',
        points: question.points || 1,
        explanation: question.explanation || '',
        order: index + 1
      }));
      
      const quizToSave = {
        title: quizData.title,
        description: quizData.description || '',
        courseId: courseId || '', // Allow empty courseId for now
        moduleId: moduleId || '', // Allow empty moduleId for now  
        timeLimit: quizData.timeLimit || 30,
        totalPoints: quizData.totalPoints || processedQuestions.reduce((sum, q) => sum + (q.points || 1), 0) || 0,
        passingScore: quizData.passingScore || 70,
        dueDate: quizData.dueDate || null,
        questions: processedQuestions
      };
      
      console.log('💾 Quiz data to save:', quizToSave);
      console.log('💾 Questions count:', processedQuestions.length);
      
      if (originalQuiz && (originalQuiz._id || originalQuiz.id)) {
        // Update existing quiz - only update local state initially
        console.log('🔄 Updating existing quiz in local state:', originalQuiz._id || originalQuiz.id);
          
          // Update local state
          const updatedQuiz = { ...quizToSave, id: originalQuiz.id, _id: originalQuiz._id };
          console.log('🔄 Updating quiz with ID:', originalQuiz.id);
          console.log('🔄 Current quizzes before update:', quizzes.map(q => ({ id: q.id, title: q.title })));
          
          const updatedQuizzes = quizzes.map(q => 
            q.id === originalQuiz.id ? updatedQuiz : q
          );
          console.log('🔄 Updated quizzes after update:', updatedQuizzes.map(q => ({ id: q.id, title: q.title })));
          
          setQuizzes(updatedQuizzes);
          
          // Also update the module state
          setModule(prevModule => ({
            ...prevModule,
            quizzes: (prevModule.quizzes || []).map(q => 
              q.id === originalQuiz.id ? updatedQuiz : q
            )
          }));
          
        console.log('✅ Quiz updated in local state (will be saved with module):', updatedQuiz);
        // Quiz updated successfully - no alert needed
        } else {
        // Create new quiz - only save to local state, not to backend yet
        console.log('🆕 Creating new quiz (local state only)');
        
        // Check if a quiz with the same title already exists
        const existingQuiz = quizzes.find(q => q.title === quizData.title);
        if (existingQuiz) {
          console.log('⚠️ Quiz with same title already exists:', existingQuiz);
          alert('A quiz with this title already exists. Please use a different title.');
          return;
        }
        
        // Additional check: ensure no duplicate IDs exist
        console.log('🔄 Checking for duplicate IDs in current quizzes:', quizzes.map(q => q.id));
          
        // Add to local state with a temporary ID
          const newQuiz = { 
            ...quizToSave, 
            id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          _id: null // Will be set when module is saved
          };
          console.log('🆕 Creating new quiz with ID:', newQuiz.id);
          console.log('🆕 Current quizzes before adding:', quizzes.map(q => ({ id: q.id, title: q.title })));
          
          const newQuizzes = [...quizzes, newQuiz];
          console.log('🆕 New quizzes after adding:', newQuizzes.map(q => ({ id: q.id, title: q.title })));
          
          // Remove any duplicates before setting
          const cleanQuizzes = removeDuplicateQuizzes(newQuizzes);
          console.log('🧹 Cleaned quizzes (removed duplicates):', cleanQuizzes.map(q => ({ id: q.id, title: q.title })));
          setQuizzes(cleanQuizzes);
          
          // Also update the module state to include this quiz
          setModule(prevModule => {
            const newModuleQuizzes = [...(prevModule.quizzes || []), newQuiz];
            const cleanModuleQuizzes = removeDuplicateQuizzes(newModuleQuizzes);
            return {
              ...prevModule,
              quizzes: cleanModuleQuizzes
            };
          });
          
        console.log('✅ Quiz added to local state (will be saved with module):', newQuiz);
        // Quiz created successfully - no alert needed
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
            // Save function called - no alert needed
    console.log('🚀 handleSaveModuleOnly function called!');
    console.log('🚀 Module title:', module.title);
    console.log('🚀 Module discussions:', module.discussions);
    
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

      // Prepare module data for backend as FormData
      const formData = new FormData();
      formData.append('courseId', courseData.courseId);
      formData.append('title', module.title);
      formData.append('description', module.description || '');
      formData.append('content_type', module.content_type || 'text content');
      formData.append('content_text', Array.isArray(module.content) 
        ? module.content.map(c => typeof c === 'string' ? c : c.content).join('\n')
        : module.content || '');
      // Handle content items with files - upload files to Supabase first
      const processedContentItems = [];
      for (const item of contentItems || []) {
        if (item.file && item.type === 'file') {
          // Upload file to Supabase
          try {
            const fileFormData = new FormData();
            fileFormData.append('file', item.file);
            
            const uploadResponse = await fetch('/api/courses/upload/file', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: fileFormData,
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              processedContentItems.push({
                ...item,
                fileUrl: uploadResult.url,
                filePath: uploadResult.path,
                fileName: item.fileName || item.file.name
              });
            } else {
              console.error('Failed to upload file for content item:', item.title);
              processedContentItems.push(item);
            }
          } catch (error) {
            console.error('Error uploading file for content item:', error);
            processedContentItems.push(item);
          }
        } else {
          processedContentItems.push(item);
        }
      }
      
      formData.append('contentItems', JSON.stringify(processedContentItems));
      formData.append('duration', module.duration || '30 minutes');
      formData.append('isMandatory', module.isMandatory !== undefined ? module.isMandatory : true);
      formData.append('order', module.order || 1);
      // Ensure module state has the latest quizzes before saving
      const moduleWithLatestQuizzes = {
        ...module,
        quizzes: quizzes || []
      };
      console.log('🔧 SAVE MODULE - Current quizzes state:', quizzes);
      console.log('🔧 SAVE MODULE - Module quizzes before update:', module.quizzes);
      console.log('🔧 SAVE MODULE - Module quizzes after update:', moduleWithLatestQuizzes.quizzes);
      
      // Clear any old quiz data from the module
      formData.append('quizzes', JSON.stringify([])); // Send empty array to clear old quizzes
      console.log('🔧 SAVE MODULE - Sending empty quizzes array to clear old data');
      formData.append('assessments', JSON.stringify(module.assessments || []));
      formData.append('discussions', JSON.stringify(module.discussions || []));

      console.log('🔧 SAVE MODULE - contentItems being sent:', contentItems);
      console.log('🔧 SAVE MODULE - discussions being sent:', module.discussions);
      console.log('🔧 SAVE MODULE - quizzes being sent:', quizzes);
      console.log('🔧 SAVE MODULE - moduleWithLatestQuizzes.quizzes:', moduleWithLatestQuizzes.quizzes);

      console.log('Saving module data as FormData');
      
      // Debug FormData contents
      console.log('🔧 SAVE MODULE - FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      let response;
      if (isEditMode && module._id) {
        // Update existing module
        response = await fetch(`/api/courses/modules/${module._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - browser will set it automatically with boundary
          },
          body: formData,
        });
      } else {
        // Create new module
        response = await fetch('/api/courses/modules', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - browser will set it automatically with boundary
          },
          body: formData,
        });
      }

      if (!response.ok) {
        console.error('❌ Module save failed - Status:', response.status);
        console.error('❌ Module save failed - Status Text:', response.statusText);
        try {
          const errorData = await response.json();
          console.error('❌ Module save error:', errorData);
          throw new Error(errorData.message || errorData.error || 'Failed to save module');
        } catch (e) {
          console.error('❌ Could not parse module save error:', e);
          // Try to get the raw response text
          try {
            const errorText = await response.text();
            console.error('❌ Raw error response:', errorText);
          } catch (textError) {
            console.error('❌ Could not get error text:', textError);
          }
          throw new Error('Failed to save module');
        }
      }

      const result = await response.json();
      const savedModuleId = result.data.module.id || result.data.module._id;

      console.log('✅ Module saved successfully:', result);
      console.log('✅ Saved module ID:', savedModuleId);

      console.log('🚀 About to call saveAssessmentsAndQuizzes...');
      // Save assessments, quizzes, and discussions
      await saveAssessmentsAndQuizzes(courseData.courseId, savedModuleId);
      console.log('🚀 saveAssessmentsAndQuizzes completed');

      alert(isEditMode ? 'Module updated successfully!' : 'Module created successfully!');
      
      // Navigate back to course overview
      navigate(`/instructor/courses/${courseData.courseId}/overview`);
      
    } catch (error) {
      console.error('Error saving module:', error);
      alert(error.message || 'Failed to save module');
    }
  };

  const saveAssessmentsAndQuizzes = async (courseId, moduleId) => {
    console.log('🚀 saveAssessmentsAndQuizzes function entered!');
    console.log('🚀 Parameters - courseId:', courseId, 'moduleId:', moduleId);
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || 'unknown';
    
    console.log('🔄 Token exists:', !!token);
    console.log('🔄 User ID:', userId);
    console.log('🔄 Course ID:', courseId);
    console.log('🔄 Module ID:', moduleId);
    
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
    console.log('🧠 SAVE QUIZZES - Current quizzes state:', quizzes);
    console.log('🧠 SAVE QUIZZES - Quizzes to process:', quizzes?.length || 0);
    
         // First, get existing quizzes for this module to delete old ones
     try {
       const existingQuizzesResponse = await fetch(`/api/courses/modules/${moduleId}/quizzes`, {
         headers: {
           'Authorization': `Bearer ${token}`,
         },
       });
       
       if (existingQuizzesResponse.ok) {
         const existingQuizzes = await existingQuizzesResponse.json();
         console.log('🧠 SAVE QUIZZES - Existing quizzes from backend:', existingQuizzes);
         
         // Delete ALL existing quizzes first, then save only the current ones
         console.log('🧠 SAVE QUIZZES - Deleting ALL existing quizzes first...');
         for (const existingQuiz of existingQuizzes.data || []) {
           console.log('🧠 SAVE QUIZZES - Deleting quiz:', existingQuiz.title, 'ID:', existingQuiz._id);
           try {
             const deleteResponse = await fetch(`/api/instructor/quizzes/${existingQuiz._id}`, {
               method: 'DELETE',
               headers: {
                 'Authorization': `Bearer ${token}`,
               },
             });
             
             if (deleteResponse.ok) {
               console.log('✅ Successfully deleted quiz:', existingQuiz.title);
             } else {
               console.error('❌ Failed to delete quiz:', existingQuiz.title, 'Status:', deleteResponse.status);
               const errorData = await deleteResponse.text();
               console.error('❌ Delete error response:', errorData);
             }
           } catch (deleteError) {
             console.error('❌ Error deleting quiz:', existingQuiz.title, deleteError);
           }
         }
         console.log('🧠 SAVE QUIZZES - Finished deleting all existing quizzes');
       }
     } catch (err) {
       console.error('Error fetching/deleting existing quizzes:', err);
     }
    
    for (const quiz of quizzes || []) {
      try {
        console.log('🧠 Processing quiz for save:', quiz.title);
        console.log('🧠 Quiz questions count:', quiz.questions?.length || 0);
        
        // Ensure questions are properly structured
        const processedQuestions = (quiz.questions || []).map((question, index) => ({
          _id: question._id || question.id || `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          question: question.question || '',
          type: question.type || 'multiple-choice',
          options: question.options || [],
          correctAnswer: question.correctAnswer || '',
          points: question.points || 1,
          explanation: question.explanation || '',
          order: index + 1
        }));
        
        const quizData = {
          title: quiz.title,
          description: quiz.description || '',
          courseId,
          moduleId,
          timeLimit: quiz.timeLimit || 30,
          totalPoints: quiz.totalPoints || processedQuestions.reduce((sum, q) => sum + (q.points || 1), 0) || 0,
          passingScore: 70,
          dueDate: quiz.dueDate || null,
          questions: processedQuestions
        };

        console.log('🧠 Saving quiz:', quiz.title);
        console.log('🧠 Quiz data to save:', quizData);
        console.log('🧠 Questions count:', processedQuestions.length);

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
            const result = await response.json();
            console.log('✅ Quiz created successfully:', result.data.quiz._id);
            
            // Update the quiz object with the new ID
            quiz._id = result.data.quiz._id;
          }
        }
        } catch (err) {
          console.error('Error saving quiz:', err);
        }
    }

    // Save discussions - but only create new ones, don't duplicate existing ones
    console.log('🔄 Starting discussion save process...');
    console.log('🔄 Module discussions to save:', module.discussions);
    console.log('🔄 Module discussions length:', module.discussions ? module.discussions.length : 0);
    console.log('🔄 Module discussions array type:', typeof module.discussions);
    console.log('🔄 Module discussions is array:', Array.isArray(module.discussions));
    
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

    console.log('🔄 Starting discussion loop, discussions count:', (module.discussions || []).length);
    console.log('🔄 Module discussions array:', module.discussions);
    const createdDiscussionIds = []; // Track newly created discussion IDs
    
    console.log('🔄 About to enter discussion loop...');
    for (const discussion of module.discussions || []) {
      console.log('🔄 Processing discussion:', discussion.title, 'with ID:', discussion._id || discussion.id);
      console.log('🔄 Discussion object:', discussion);
      try {
        // Skip if discussion already exists in database
        if (existingDiscussionTitles.has(discussion.title)) {
          console.log('⏭️ Skipping existing discussion:', discussion.title);
          continue;
        }

        console.log('💬 Processing discussion:', discussion.title, 'ID:', discussion._id || discussion.id);

        try {
          // Check if this is an existing discussion that needs to be updated
          // Only update if it has a real database ID (has _rev field from CouchDB)
          if (discussion._rev) {
            console.log('💬 Updating existing discussion:', discussion._id || discussion.id);
            
            const response = await fetch(`/api/courses/discussions/${discussion._id || discussion.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: discussion.title,
                content: discussion.content,
                course: courseId,
                author: userId,  // Backend expects 'author' field
                moduleId: moduleId,
                status: 'submitted'
              }),
            });
            
            if (!response.ok) {
              console.error('❌ Discussion update failed - Status:', response.status);
              try {
                const error = await response.json();
                console.error('❌ Error details:', error);
              } catch (e) {
                console.error('❌ Could not parse error response');
              }
            } else {
              const result = await response.json();
              console.log('✅ Discussion updated successfully:', result.data.discussion._id);
              existingDiscussionTitles.add(discussion.title); // Add to set to prevent duplicates in this batch
            }
          } else {
        console.log('💬 Creating new discussion:', discussion.title);
        console.log('💬 Discussion has _rev:', !!discussion._rev);
        console.log('💬 Discussion _id:', discussion._id);
        console.log('💬 Discussion id:', discussion.id);
        console.log('💬 Discussion data:', {
          title: discussion.title,
          content: discussion.content,
          courseId,
          userId,
          moduleId
        });

            // Create new discussion using the courses endpoint
            const discussionData = {
              course: courseId,
              title: discussion.title,
              content: discussion.content,
              author: userId,  // Backend expects 'author' field
              moduleId: moduleId,
              status: 'submitted'
            };
            
            console.log('🔄 Creating discussion with data:', discussionData);
            console.log('🔄 Discussion API URL:', `/api/courses/discussions`);
            console.log('🔄 Discussion request body:', JSON.stringify(discussionData, null, 2));
            
            const response = await fetch(`/api/courses/discussions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
              body: JSON.stringify(discussionData),
        });
        
        console.log('🔄 Discussion creation response status:', response.status);
        console.log('🔄 Discussion creation response ok:', response.ok);
        console.log('🔄 Discussion creation response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
              console.error('❌ Discussion creation failed - Status:', response.status);
              try {
          const error = await response.json();
                console.error('❌ Error details:', error);
              } catch (e) {
                console.error('❌ Could not parse error response');
              }
                } else {
              console.log('✅ Discussion creation successful!');
              const result = await response.json();
              console.log('✅ Discussion created successfully:', result.data.discussion._id);
              console.log('✅ Full discussion result:', result);
              console.log('✅ Discussion result data:', result.data);
              console.log('✅ Discussion result data.discussion:', result.data.discussion);
              
              // Store the created discussion ID
              const createdDiscussionId = result.data.discussion._id;
              createdDiscussionIds.push({ title: discussion.title, id: createdDiscussionId });
              console.log('✅ Discussion created with ID:', createdDiscussionId);
              console.log('✅ Created discussion IDs array:', createdDiscussionIds);
              console.log('✅ Discussion result data:', result.data);
              console.log('✅ Discussion result data.discussion:', result.data.discussion);
          
          existingDiscussionTitles.add(discussion.title); // Add to set to prevent duplicates in this batch
            }
        }
      } catch (err) {
        console.error('Error saving discussion:', err);
        }
      } catch (err) {
        console.error('Error processing discussion:', err);
      }
    }
    
    console.log('✅ All assessments, quizzes, and discussions saved successfully');
    
    // Debug: Check module state after all saves
    console.log('🔄 Module state after all saves:', module);
    console.log('🔄 Module discussions after all saves:', module.discussions);
    
    // Update module with quiz IDs and discussion IDs
    try {
      const quizIds = quizzes.map(quiz => quiz._id).filter(id => id);
      
      // Collect discussion IDs from existing discussions and newly created ones
      let discussionIds = (module.discussions || []).map(discussion => discussion._id || discussion.id).filter(id => id);
      
      // Add newly created discussion IDs
      if (createdDiscussionIds.length > 0) {
        console.log('🔄 Adding newly created discussion IDs:', createdDiscussionIds);
        discussionIds = [...discussionIds, ...createdDiscussionIds.map(d => d.id)];
      }
      console.log('🔄 Updating module with quiz IDs:', quizIds);
      console.log('🔄 Updating module with discussion IDs:', discussionIds);
      console.log('🔄 Module discussions before mapping:', module.discussions);
      console.log('🔄 Discussion IDs being sent to module update:', discussionIds);
      console.log('🔄 Module discussions length:', module.discussions ? module.discussions.length : 0);
      console.log('🔄 Discussion IDs length:', discussionIds.length);
      
      // Debug each discussion individually
      if (module.discussions && module.discussions.length > 0) {
        module.discussions.forEach((discussion, index) => {
          console.log(`🔄 Discussion ${index}:`, {
            title: discussion.title,
            _id: discussion._id,
            id: discussion.id,
            hasId: !!(discussion._id || discussion.id)
          });
        });
      }
      
      // If no discussion IDs were saved, try to get them from the discussions that were just created
      if (discussionIds.length === 0 && module.discussions && module.discussions.length > 0) {
        console.log('⚠️ No discussion IDs found, checking for newly created discussions...');
        const newlyCreatedDiscussions = module.discussions.filter(d => d._id && d._id.startsWith('discussion_'));
        if (newlyCreatedDiscussions.length > 0) {
          console.log('✅ Found newly created discussions:', newlyCreatedDiscussions.map(d => ({ id: d._id, title: d.title })));
          discussionIds.push(...newlyCreatedDiscussions.map(d => d._id));
        }
      }
      
      const moduleUpdateData = {
        quizzes: quizIds,
        discussions: discussionIds
      };
      
      console.log('🔄 Module update data being sent:', moduleUpdateData);
      console.log('🔄 Discussion IDs being sent:', discussionIds);
      console.log('🔄 Discussion IDs length:', discussionIds.length);
      
      console.log('🔄 Sending module update request to:', `/api/courses/modules/${moduleId}`);
      console.log('🔄 Module update request body:', JSON.stringify(moduleUpdateData, null, 2));
      
      const response = await fetch(`/api/courses/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleUpdateData),
      });
      
      console.log('🔄 Module update response status:', response.status);
      console.log('🔄 Module update response ok:', response.ok);
      
      if (response.ok) {
        console.log('✅ Module updated with quiz IDs successfully');
        const updateResult = await response.json();
        console.log('✅ Module update result:', updateResult);
      } else {
        console.error('⚠️ Failed to update module with quiz IDs');
        try {
          const errorData = await response.json();
          console.error('⚠️ Module update error:', errorData);
        } catch (e) {
          console.error('⚠️ Could not parse module update error');
        }
      }
    } catch (err) {
      console.error('⚠️ Error updating module with quiz IDs:', err);
    }
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
        {console.log('🔄 Rendering content items:', contentItems)}
        {contentItems.length > 0 && (
          <ItemList style={{ marginBottom: '1rem' }}>
            {contentItems.map((item, idx) => (
              <Item key={item.id || idx} style={{
                border: editingContentItemId === item.id ? '2px solid #007BFF' : '1px solid #e0e0e0',
                background: editingContentItemId === item.id ? '#f0f8ff' : 'white'
              }}>
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
                    {editingContentItemId === item.id && (
                      <span style={{
                        background: '#007BFF',
                        color: 'white',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        marginLeft: '0.5rem'
                      }}>
                        EDITING
                      </span>
                    )}
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
            <option value="video">Video Link</option>
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
                {contentItemDraft.type === 'article' ? 'Article URL' : 'Video Link URL (YouTube, Vimeo, etc.)'}
              </Label>
              <Input 
                value={contentItemDraft.url} 
                onChange={e => setContentItemDraft({ ...contentItemDraft, url: e.target.value })}
                placeholder={contentItemDraft.type === 'article' ? 'https://example.com/article' : 'https://www.youtube.com/watch?v=...'} 
              />
            </div>
          )}
          
          {/* File Upload for videos and files */}
          {(contentItemDraft.type === 'video' || contentItemDraft.type === 'file') && (
            <div style={{ marginBottom: '1rem' }}>
              <Label style={{ color: BLUE }}>
                Upload {contentItemDraft.type === 'video' ? 'Video' : 'File'}
              </Label>
              <input
                type="file"
                accept={
                  contentItemDraft.type === 'video' ? 'video/*' :
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
            {editingContentItemId ? 'Update' : 'Add'} {contentItemDraft.type === 'article' ? 'Article' : 
                  contentItemDraft.type === 'video' ? 'Video Link' : 'File'}
          </SmallAddButton>
          {editingContentItemId && (
            <button 
              onClick={() => {
                setEditingContentItemId(null);
                setContentItemDraft({
                  type: 'article',
                  title: '',
                  url: '',
                  description: '',
                  file: null,
                  fileName: ''
                });
              }}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.4rem 1.2rem',
                fontSize: '1rem',
                borderRadius: '16px',
                marginTop: '0.5rem',
                marginLeft: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>






        
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
                    console.log('🔄 Editing quiz:', item);
                    console.log('🔄 Quiz ID:', item.id);
                    console.log('🔄 Quiz _ID:', item._id);
                    setEditingQuiz(item);
                    setShowQuizCreator(true);
                  }} title="Edit"><Edit fontSize="small" /></ActionBtn>
                  <ActionBtn onClick={() => {
                    console.log('🗑️ Deleting quiz with ID:', item.id);
                    console.log('🗑️ Deleting quiz title:', item.title);
                    console.log('🗑️ Current quizzes before deletion:', quizzes.map(q => ({ id: q.id, title: q.title, index: quizzes.indexOf(q) })));
                    
                    // Delete by both ID and title to ensure correct deletion
                    const updatedQuizzes = quizzes.filter(q => !(q.id === item.id && q.title === item.title));
                    console.log('🗑️ Quizzes after deletion:', updatedQuizzes.map(q => ({ id: q.id, title: q.title, index: quizzes.indexOf(q) })));
                    
                    // Also remove from module state immediately
                    setModule(prevModule => ({
                      ...prevModule,
                      quizzes: (prevModule.quizzes || []).filter(q => !(q.id === item.id && q.title === item.title))
                    }));
                    
                    setQuizzes(updatedQuizzes);
                  }} title="Delete"><Delete fontSize="small" /></ActionBtn>
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
            {console.log('🔄 Rendering discussions:', module.discussions)}
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
            <SaveButton onClick={() => {
              console.log('🔄 Save Module Changes button clicked!');
              console.log('🔄 Current module state:', module);
              console.log('🔄 Current discussions:', module.discussions);
              handleSaveModuleOnly();
            }} disabled={!module.title}>
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