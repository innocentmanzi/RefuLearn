import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import { theme } from '../../theme';
import AssessmentCreator from '../../components/AssessmentCreator';


const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const QuizList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const QuizCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuizTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
  margin-right: 0.5rem;
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ status }) => 
    status === 'published' ? '#d4edda' : 
    status === 'draft' ? '#fff3cd' : '#f8d7da'
  };
  color: ${({ status }) => 
    status === 'published' ? '#155724' : 
    status === 'draft' ? '#856404' : '#721c24'
  };
  border: 1px solid ${({ status }) => 
    status === 'published' ? '#c3e6cb' : 
    status === 'draft' ? '#ffeaa7' : '#f5c6cb'
  };
`;

const QuizDescription = styled.p`
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const QuizMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.span`
  font-size: 0.85rem;
  color: #555;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant }) => {
    switch (variant) {
      case 'edit':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'view':
        return `
          background: #17a2b8;
          color: white;
          &:hover { background: #138496; }
        `;
      case 'delete':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'publish':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'unpublish':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
    }
  }}
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  
  h3 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    margin-bottom: 2rem;
    font-size: 1rem;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const QuestionItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
`;

const QuestionText = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
`;

const QuestionType = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
`;

const QuestionPoints = styled.span`
  color: #007bff;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const OptionsList = styled.ul`
  margin: 0.5rem 0;
  padding-left: 1.5rem;
`;

const OptionItem = styled.li`
  margin-bottom: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  ${({ isCorrect }) => isCorrect && `
    color: #155724;
    font-weight: 600;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
  `}
`;

const CorrectAnswer = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-weight: 600;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuestionCard = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const OptionsListNew = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const OptionItemNew = styled.li`
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 2px solid ${props => props.isCorrect ? '#28a745' : '#ddd'};
  border-radius: 6px;
  background: ${props => props.isCorrect ? '#d4edda' : '#fff'};
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: ${props => props.isCorrect ? '600' : '400'};
  color: ${props => props.isCorrect ? '#155724' : '#333'};
  
  ${props => props.isCorrect && `
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
  `}
`;

const CorrectBadge = styled.span`
  background: #28a745;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const NoQuestions = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
`;

const ModalBody = styled.div`
  max-height: 60vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const Quizzes = () => {
  const { token } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'quiz',
    duration: '',
    totalPoints: 100,
    passingScore: 70,
    dueDate: '',
    questions: []
  });
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedQuizSubmissions, setSelectedQuizSubmissions] = useState(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [editingQuizCreator, setEditingQuizCreator] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch quizzes
  const fetchQuizzes = async (courseFilterParam = null) => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching instructor quizzes...', courseFilterParam ? `for course: ${courseFilterParam}` : 'all courses');
      
      // Build URL with optional course filter
      let url = '/api/instructor/quizzes';
      if (courseFilterParam) {
        url += `?courseId=${courseFilterParam}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quizzes data received from backend');
        console.log('📝 Raw quizzes data:', data.data?.quizzes);
        
        // Log detailed quiz structure for debugging
        data.data?.quizzes?.forEach((quiz, index) => {
          console.log(`📝 Quiz ${index + 1} structure:`, {
            id: quiz._id,
            title: quiz.title,
            courseId: quiz.courseId,
            course: quiz.course,
            courseName: quiz.courseName,
            status: quiz.status,
            questionCount: quiz.questions?.length || 0
          });
        });
        
        setQuizzes(data.data?.quizzes || []);
      } else {
        throw new Error('Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('❌ Quizzes fetch failed:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    try {
      console.log('🔄 Fetching instructor courses for quizzes...');
      
      const response = await fetch('/api/instructor/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      console.log('📚 Fetched courses from database:', data.data?.courses);
      
      const coursesData = data.data?.courses || [];
      
      if (coursesData.length === 0) {
        console.warn('❌ No courses found. Create some courses first.');
      } else {
        console.log(`✅ Found ${coursesData.length} courses total`);
        coursesData.forEach((course, index) => {
          console.log(`📚 Course ${index + 1}:`, {
            id: course._id,
            title: course.title,
            instructor: course.instructor
          });
        });
      }
      
      setCourses(coursesData);
    } catch (err) {
      console.error('❌ Courses fetch failed:', err);
      setError('Failed to load courses');
    }
  };

  // Create quiz
  const createQuiz = async (quizData) => {
    try {
      console.log('🔄 Creating quiz:', quizData);
      
      const response = await fetch('/api/instructor/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quiz created successfully:', result);
        setSuccess('Quiz created successfully!');
        fetchQuizzes(); // Refresh the list
        return result;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quiz');
      }
    } catch (err) {
      console.error('❌ Quiz creation failed:', err);
      setError(err.message || 'Failed to create quiz');
      throw err;
    }
  };

  // Update quiz
  const updateQuiz = async (quizId, quizData) => {
    try {
      console.log('🔄 Updating quiz:', quizId, quizData);
      
      const response = await fetch(`/api/instructor/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quiz updated successfully:', result);
        setSuccess('Quiz updated successfully!');
        fetchQuizzes(); // Refresh the list
        return result;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quiz');
      }
    } catch (err) {
      console.error('❌ Quiz update failed:', err);
      setError(err.message || 'Failed to update quiz');
      throw err;
    }
  };

  // Delete quiz
  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🔄 Deleting quiz:', quizId);
      
      const response = await fetch(`/api/instructor/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('✅ Quiz deleted successfully');
        setSuccess('Quiz deleted successfully!');
        fetchQuizzes(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete quiz');
      }
    } catch (err) {
      console.error('❌ Quiz deletion failed:', err);
      setError(err.message || 'Failed to delete quiz');
    }
  };

  // Toggle quiz status
  const toggleStatus = async (quizId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      console.log('🔄 Toggling quiz status:', quizId, currentStatus, '->', newStatus);
      console.log('📝 Request payload:', { status: newStatus });
      
      const response = await fetch(`/api/instructor/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Quiz status updated successfully:', responseData);
        setSuccess(`Quiz ${newStatus} successfully!`);
        fetchQuizzes(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('❌ Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to update quiz status');
      }
    } catch (err) {
      console.error('❌ Quiz status update failed:', err);
      setError(err.message || 'Failed to update quiz status');
    }
  };

  // Fetch quiz submissions
  const fetchQuizSubmissions = async (quizId) => {
    try {
      setSubmissionsLoading(true);
      console.log('🔄 Fetching quiz submissions:', quizId);
      
      const response = await fetch(`/api/instructor/quizzes/${quizId}/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quiz submissions received:', data);
        setSelectedQuizSubmissions(data.data);
        setShowSubmissionsModal(true);
      } else {
        throw new Error('Failed to fetch quiz submissions');
      }
    } catch (err) {
      console.error('❌ Quiz submissions fetch failed:', err);
      setError('Failed to load quiz submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // View quiz submissions
  const viewQuizSubmissions = (quiz) => {
    console.log('🔄 Viewing quiz submissions:', quiz);
    fetchQuizSubmissions(quiz._id);
  };

  // View quiz questions
  const viewQuizQuestions = async (quiz) => {
    console.log('🔍 Viewing quiz questions for:', quiz.title);
    console.log('📝 Raw quiz questions:', quiz.questions);
    console.log('🔍 Full quiz object:', quiz);
    console.log('🔍 Quiz questions type:', typeof quiz.questions);
    console.log('🔍 Quiz questions length:', quiz.questions?.length);
    
    // Log each question individually for debugging
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach((question, index) => {
        console.log(`🔍 Question ${index + 1} raw data:`, {
          question: question,
          type: typeof question,
          hasCorrectAnswer: question && typeof question === 'object' && 'correctAnswer' in question,
          correctAnswer: question && typeof question === 'object' ? question.correctAnswer : 'N/A',
          correctAnswerType: question && typeof question === 'object' ? typeof question.correctAnswer : 'N/A'
        });
      });
    }
    
    // Ensure questions are properly formatted for display
    const formattedQuestions = quiz.questions?.map((question, index) => {
      console.log(`🔍 Processing question ${index + 1}:`, question);
      
      // Handle different question types and ensure proper string conversion
      let questionText = '';
      let options = [];
      let correctAnswer = '';
      let questionType = 'multiple-choice';
      
      if (typeof question === 'string') {
        questionText = question;
      } else if (typeof question === 'object' && question !== null) {
        // Handle question object
        questionText = question.question || question.text || question.title || JSON.stringify(question);
        questionType = question.type || 'multiple-choice';
        
        // Handle options
        if (question.options && Array.isArray(question.options)) {
          options = question.options.map(opt => 
            typeof opt === 'string' ? opt : JSON.stringify(opt)
          );
        } else if (question.choices && Array.isArray(question.choices)) {
          options = question.choices.map(choice => 
            typeof choice === 'string' ? choice : JSON.stringify(choice)
          );
        }
        
        // Handle correct answer with better debugging
        console.log(`🔍 Question ${index + 1} correct answer data:`, {
          correctAnswer: question.correctAnswer,
          correctAnswerType: typeof question.correctAnswer,
          options: options,
          optionsLength: options.length,
          questionKeys: question ? Object.keys(question) : 'N/A'
        });
        
        // Enhanced correct answer processing
        if (question.correctAnswer !== undefined && question.correctAnswer !== null && question.correctAnswer !== '') {
          if (typeof question.correctAnswer === 'number') {
            // If it's a number, treat it as an index
            if (options.length > question.correctAnswer && question.correctAnswer >= 0) {
              correctAnswer = options[question.correctAnswer];
            } else {
              correctAnswer = `Option ${question.correctAnswer + 1} (index out of range)`;
            }
          } else if (typeof question.correctAnswer === 'string') {
            // If it's a string, use it directly
            correctAnswer = question.correctAnswer;
          } else if (typeof question.correctAnswer === 'boolean') {
            // Handle true/false questions
            correctAnswer = question.correctAnswer ? 'True' : 'False';
          } else {
            // For other types, stringify
            correctAnswer = JSON.stringify(question.correctAnswer);
          }
        } else {
          // Check for alternative correct answer fields
          const alternativeFields = ['correct_answer', 'answer', 'rightAnswer', 'solution'];
          for (const field of alternativeFields) {
            if (question[field] !== undefined && question[field] !== null && question[field] !== '') {
              correctAnswer = String(question[field]);
              console.log(`🔍 Found correct answer in alternative field '${field}':`, correctAnswer);
              break;
            }
          }
          
          if (!correctAnswer) {
            correctAnswer = 'No correct answer set';
          }
        }
        
        console.log(`✅ Question ${index + 1} processed:`, {
          questionText,
          options,
          correctAnswer,
          type: questionType
        });
      } else {
        questionText = String(question);
      }
      
      return {
        id: index + 1,
        question: questionText,
        options: options,
        correctAnswer: correctAnswer,
        type: questionType
      };
    }) || [];
    
    console.log('✅ Final formatted questions:', formattedQuestions);
    console.log('🔍 Raw quiz data for debugging:', {
      quizTitle: quiz.title,
      rawQuestions: quiz.questions,
      formattedQuestions: formattedQuestions
    });
    
    // Fetch fresh quiz data from backend to ensure we have the latest
    try {
      console.log('🔄 Fetching fresh quiz data from backend...');
      const response = await fetch(`/api/instructor/quizzes/${quiz._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const freshData = await response.json();
        console.log('✅ Fresh quiz data received:', freshData.data?.quiz);
        
        // Use fresh data if available
        const freshQuiz = freshData.data?.quiz || quiz;
        setSelectedQuiz({ ...freshQuiz, formattedQuestions });
      } else {
        console.warn('⚠️ Failed to fetch fresh quiz data, using cached data');
        setSelectedQuiz({ ...quiz, formattedQuestions });
      }
    } catch (error) {
      console.warn('⚠️ Error fetching fresh quiz data:', error);
      setSelectedQuiz({ ...quiz, formattedQuestions });
    }
    
    setShowQuestionsModal(true);
  };

  // Fetch quiz directly from backend for debugging
  const fetchQuizDirectly = async (quizId) => {
    try {
      console.log('🔍 Fetching quiz directly from backend:', quizId);
      const response = await fetch(`/api/instructor/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📝 Direct quiz data from backend:', data.data?.quiz);
        console.log('📝 Direct questions data:', data.data?.quiz?.questions?.map((q, i) => ({
          question: q.question,
          type: q.type,
          correctAnswer: q.correctAnswer,
          correctAnswerType: typeof q.correctAnswer,
          options: q.options
        })));
      }
    } catch (error) {
      console.error('❌ Error fetching quiz directly:', error);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setQuizData({
      title: '',
      description: '',
      courseId: '',
      type: 'quiz',
      duration: '',
      totalPoints: 100,
      passingScore: 70,
      dueDate: '',
      questions: []
    });
    setEditingQuiz(null);
    setShowQuizCreator(true);
  };

  // Handle quiz creator save
  const handleQuizCreatorSave = async (quizData, originalQuiz) => {
    try {
      if (originalQuiz) {
        await updateQuiz(originalQuiz._id, quizData);
      } else {
        await createQuiz(quizData);
      }
      setShowQuizCreator(false);
      setEditingQuizCreator(null);
    } catch (error) {
      console.error('❌ Quiz save failed:', error);
      // Error is already set in createQuiz/updateQuiz
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setShowBuilder(false);
    setEditingQuiz(null);
    setQuizData({
      title: '',
      description: '',
      courseId: '',
      type: 'quiz',
      duration: '',
      totalPoints: 100,
      passingScore: 70,
      dueDate: '',
      questions: []
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, [token]);

  // Trigger filtering when search or filters change
  useEffect(() => {
    console.log('🔄 Filters changed, re-filtering quizzes...');
    console.log('🔍 Current state - Search:', searchTerm, 'Status:', statusFilter);
  }, [searchTerm, statusFilter]); // Removed courseFilter since it's handled by backend fetch

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Filter quizzes based on search and filters
  const getFilteredQuizzes = () => {
    let filtered = quizzes;
    console.log('🔍 Starting filtering process...');
    console.log('📝 Total quizzes before filtering:', filtered.length);
    console.log('🔍 Current filters - Search:', searchTerm, 'Course:', courseFilter, 'Status:', statusFilter);

    // Search filter (client-side)
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔍 After search filter:', filtered.length, 'quizzes');
    }

    // Status filter (client-side)
    if (statusFilter && statusFilter !== '') {
      filtered = filtered.filter(quiz => {
        const quizStatus = quiz.status || 'published';
        const matches = quizStatus === statusFilter;
        console.log(`🔍 Quiz "${quiz.title}" status check:`, {
          quizStatus,
          statusFilter,
          matches
        });
        return matches;
      });
      console.log('🔍 After status filter:', filtered.length, 'quizzes');
    }

    console.log('✅ Final filtered quizzes:', filtered.length);
    return filtered;
  };

  // Render quiz cards
  const renderQuizCards = () => {
    if (loading) {
      return <LoadingSpinner>Loading quizzes...</LoadingSpinner>;
    }

    const filteredQuizzes = getFilteredQuizzes();

    if (filteredQuizzes.length === 0) {
      if (quizzes.length === 0) {
        return (
        <EmptyState>
            <h3>No Quizzes Found</h3>
            <p>
              You haven't created any quizzes yet. Create your first quiz to get started.
            </p>
            <AddButton onClick={openAddModal}>Create New Quiz</AddButton>
        </EmptyState>
        );
      } else {
        return (
          <EmptyState>
            <h3>No Quizzes Match Your Search</h3>
            <p>
              Try adjusting your search terms or filters to find the quiz you're looking for.
            </p>
          </EmptyState>
        );
      }
    }

    return (
      <QuizList>
        {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz._id}>
            <CardHeader>
              <QuizTitle>{quiz.title}</QuizTitle>
              <StatusBadge status={quiz.status || 'published'}>
                {quiz.status || 'Published'}
              </StatusBadge>
            </CardHeader>
            
            <QuizDescription>{quiz.description || 'No description available'}</QuizDescription>
              
              <QuizMeta>
              <MetaItem><strong>Points:</strong> {quiz.totalPoints || 0}</MetaItem>
              {quiz.dueDate && (
                <MetaItem><strong>Due:</strong> {new Date(quiz.dueDate).toLocaleDateString()}</MetaItem>
              )}
              </QuizMeta>

              <QuizMeta>
              <MetaItem><strong>Points:</strong> {quiz.totalPoints || 0}</MetaItem>
              <MetaItem><strong>Questions:</strong> {quiz.questions?.length || 0}</MetaItem>
              {quiz.dueDate && (
                <MetaItem><strong>Due:</strong> {new Date(quiz.dueDate).toLocaleDateString()}</MetaItem>
              )}
              </QuizMeta>

              <ActionButtons>
              <ActionButton 
                variant="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingQuizCreator({
                    ...quiz,
                    courseId: quiz.course || quiz.courseId
                  });
                  setShowQuizCreator(true);
                }}
              >
                Edit Quiz
                </ActionButton>
              <ActionButton 
                variant="view"
                onClick={(e) => {
                  e.stopPropagation();
                  viewQuizQuestions(quiz);
                }}
              >
                View Questions
                </ActionButton>
              <ActionButton 
                variant={quiz.status === 'published' ? 'unpublish' : 'publish'}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🔘 Toggle button clicked for quiz:', quiz._id, 'Current status:', quiz.status);
                  toggleStatus(quiz._id, quiz.status);
                }}
              >
                {quiz.status === 'published' ? 'Deactivate' : 'Activate'}
              </ActionButton>
              <ActionButton 
                variant="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQuiz(quiz._id);
                }}
              >
                Delete Quiz
                </ActionButton>
              </ActionButtons>
            </QuizCard>
          ))}
      </QuizList>
    );
  };

  return (
    <Container>
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <HeaderContainer>
        <Title>Manage Quizzes</Title>
        <AddButton onClick={openAddModal}>Create New Quiz</AddButton>
      </HeaderContainer>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search quizzes by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={courseFilter}
          onChange={(e) => {
            const selectedCourse = e.target.value;
            console.log('🔍 Course filter changed to:', selectedCourse);
            setCourseFilter(selectedCourse);
            if (selectedCourse) {
              fetchQuizzes(selectedCourse); // Fetch fresh data for specific course
            } else {
              fetchQuizzes(); // Fetch all quizzes
            }
          }}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </FilterSelect>
      </SearchContainer>

      {renderQuizCards()}

      {/* Quiz Creator Modal */}
      {showQuizCreator && (
      <AssessmentCreator
        isOpen={showQuizCreator}
        onClose={() => {
          setShowQuizCreator(false);
            setEditingQuizCreator(null);
        }}
        onSave={handleQuizCreatorSave}
          assessment={editingQuizCreator}
        isQuiz={true}
        />
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedQuiz && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <div>
                <h2>Quiz Questions: {selectedQuiz.title}</h2>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.9rem', 
                  color: '#28a745',
                  fontWeight: 'bold'
                }}>
                  🎯 Instructor View - Correct Answers Highlighted
                </p>
              </div>
              <CloseButton onClick={() => setShowQuestionsModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              {/* Debug Information */}
                            <div style={{ 
                marginBottom: '1rem', 
                padding: '0.5rem', 
                background: '#f8f9fa', 
                borderRadius: '4px', 
                fontSize: '0.8rem',
                color: '#666'
              }}>
                <strong>Questions:</strong> {selectedQuiz.formattedQuestions?.length || 0} questions loaded
              </div>
              
              {selectedQuiz.formattedQuestions && selectedQuiz.formattedQuestions.length > 0 ? (
                selectedQuiz.formattedQuestions.map((q, index) => (
                  <QuestionCard key={index}>
                    <QuestionHeader>
                      <QuestionNumber>Question {q.id}</QuestionNumber>
                      <QuestionType>{q.type}</QuestionType>
                    </QuestionHeader>
                    
                    {/* Prominent Correct Answer Display */}
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '0.75rem',
                      background: '#d4edda',
                      borderRadius: '6px',
                      border: '2px solid #28a745',
                      textAlign: 'center'
                    }}>
                      <strong style={{ color: '#155724', fontSize: '0.9rem' }}>
                        🎯 CORRECT ANSWER: {
                          typeof q.correctAnswer === 'number' && q.options && q.options[q.correctAnswer] 
                            ? q.options[q.correctAnswer] 
                            : String(q.correctAnswer || 'Not set')
                        }
                      </strong>
                    </div>
                    
                    <QuestionText>{q.question}</QuestionText>
                    {q.options && q.options.length > 0 && (
                      <OptionsListNew>
                        {q.options.map((option, optIndex) => {
                          // Handle different correct answer formats
                          let isCorrect = false;
                          
                          // Check if correctAnswer is a number (index) or string (actual answer)
                          if (typeof q.correctAnswer === 'number') {
                            // If it's a number, compare with index
                            isCorrect = optIndex === q.correctAnswer;
                          } else {
                            // If it's a string, compare with option text
                            isCorrect = String(option) === String(q.correctAnswer);
                          }
                          
                          console.log(`🔍 Option ${optIndex + 1}: "${option}" | Correct: "${q.correctAnswer}" (${typeof q.correctAnswer}) | IsCorrect: ${isCorrect}`);
                          
                          return (
                            <OptionItemNew 
                              key={optIndex}
                              isCorrect={isCorrect}
                            >
                              {String(option)}
                              {isCorrect && <CorrectBadge>✓ Correct</CorrectBadge>}
                            </OptionItemNew>
                          );
                        })}
                      </OptionsListNew>
                    )}
                    {q.correctAnswer && (
                      <CorrectAnswer>
                        <strong>🎯 Correct Answer:</strong> {String(q.correctAnswer)}
                      </CorrectAnswer>
                    )}
                  </QuestionCard>
                ))
              ) : (
                <NoQuestions>No questions found for this quiz.</NoQuestions>
              )}
            </ModalBody>
            <ModalActions>
              <ActionButton 
                variant="edit"
                onClick={() => {
                  setShowQuestionsModal(false);
                  setEditingQuizCreator({
                    ...selectedQuiz,
                    courseId: selectedQuiz.course || selectedQuiz.courseId
                  });
                  setShowQuizCreator(true);
                }}
              >
                Edit Quiz
              </ActionButton>
              <ActionButton 
                color="#6c757d" 
                onClick={() => setShowQuestionsModal(false)}
              >
                Close
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Quizzes; 