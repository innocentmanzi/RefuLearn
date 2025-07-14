import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Add, Edit, Delete, Quiz, Assignment, Assessment } from '@mui/icons-material';
import { useUser } from '../../contexts/UserContext';
import AssessmentCreator from '../../components/AssessmentCreator';

const Container = styled.div`
  padding: 2rem;
  background: #f4f8fb;
  min-height: 100vh;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #007BFF;
  margin: 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const AddButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
`;

const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const QuizCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const QuizTitle = styled.h3`
  color: #007BFF;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const QuizDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

const QuizMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #e6f9ec;
  color: #1bbf4c;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ variant }) => 
    variant === 'edit' ? '#007BFF' : 
    variant === 'submissions' ? '#28a745' :
    variant === 'delete' ? '#000000' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #007BFF;
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

const Quizzes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Get course context from navigation state
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName;
  const editQuizId = location.state?.editQuizId;
  
  // Get return URL from state or sessionStorage as fallback
  const returnUrl = location.state?.returnUrl || sessionStorage.getItem('quizEditReturnUrl');
  
  // Debug logging for navigation state
  console.log('🔍 Quizzes component - Navigation state:', {
    courseId,
    courseName,
    editQuizId,
    returnUrl,
    fromState: location.state?.returnUrl,
    fromSessionStorage: sessionStorage.getItem('quizEditReturnUrl'),
    fullState: location.state
  });
  
  // Check if returnUrl exists and log it specifically
  if (returnUrl) {
    console.log('✅ Return URL found:', returnUrl);
  } else {
    console.log('❌ Return URL is missing or null');
    console.log('🔍 location.state?.returnUrl:', location.state?.returnUrl);
    console.log('🔍 sessionStorage returnUrl:', sessionStorage.getItem('quizEditReturnUrl'));
    console.log('🔍 Full location object:', location);
  }

  useEffect(() => {
    if (token) {
      fetchQuizzes();
      fetchCourses();
    }
  }, [token]);

  // Auto-open edit modal if editQuizId is provided
  useEffect(() => {
    if (editQuizId && quizzes.length > 0) {
      const quizToEdit = quizzes.find(quiz => quiz._id === editQuizId);
      if (quizToEdit) {
        console.log('🎯 Auto-opening edit modal for quiz:', quizToEdit.title);
        openEditModal(quizToEdit);
        // Clear the state to prevent re-opening if user cancels and comes back
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [editQuizId, quizzes]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching quizzes from /api/instructor/quizzes...'); // Debug log
      
      const response = await fetch('/api/instructor/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Quiz fetch response status:', response.status); // Debug log

      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      console.log('📚 Quiz fetch response data:', data); // Debug log
      
      const quizzes = data.data?.quizzes || [];
      console.log(`✅ Found ${quizzes.length} quizzes:`, quizzes.map(q => ({ id: q._id, title: q.title, moduleId: q.moduleId }))); // Debug log
      
      setQuizzes(quizzes);
    } catch (err) {
      console.error('❌ Error fetching quizzes:', err); // Debug log
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('🔍 Fetching courses for dropdown...');
      const response = await fetch('/api/instructor/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Courses API response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      console.log('📚 Courses API response:', data);
      const courses = data.data?.courses || [];
      console.log(`✅ Found ${courses.length} courses for dropdown:`, courses.map(c => ({ id: c._id, title: c.title })));
      setCourses(courses);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
    }
  };

  const createQuiz = async (quizData) => {
    const response = await fetch('/api/instructor/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create quiz');
    }

    // Show success message and refresh quiz list
    const successMessage = returnUrl ? 'Quiz created successfully!' : 'Quiz created successfully';
    setSuccess(successMessage);
    fetchQuizzes();
    
    // Clear success message after delay
    setTimeout(() => setSuccess(''), 3000);
    
    return { success: true };
  };

  const updateQuiz = async (quizId, quizData) => {
    console.log('🔄 updateQuiz called with:', { quizId, quizData });
    
    const response = await fetch(`/api/instructor/quizzes/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });

    console.log('📡 API response status:', response.status);
    console.log('📡 API response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API error response:', errorData);
      throw new Error(errorData.message || 'Failed to update quiz');
    }

    const responseData = await response.json();
    console.log('✅ API success response:', responseData);

    // Show success message and refresh quiz list
    const successMessage = returnUrl ? 'Quiz updated successfully!' : 'Quiz updated successfully';
    setSuccess(successMessage);
    fetchQuizzes();
    
    // Clear success message after delay
    setTimeout(() => setSuccess(''), 3000);
    
    console.log('✅ updateQuiz completed successfully');
    return { success: true };
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/instructor/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete quiz');
      }

      setSuccess('Quiz deleted successfully');
      fetchQuizzes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleQuizCreatorSave = async (quizData, originalQuiz) => {
    try {
      console.log('🔍 handleQuizCreatorSave called with:', {
        quizData,
        originalQuiz,
        returnUrl
      });
      
      const submissionData = {
        title: quizData.title,
        description: quizData.description,
        courseId: quizData.courseId,
        moduleId: quizData.moduleId, // Include moduleId
        type: 'quiz',
        duration: quizData.timeLimit || 30,
        totalPoints: quizData.totalPoints || 0,
        passingScore: 70,
        dueDate: quizData.dueDate ? new Date(quizData.dueDate).toISOString() : null,
        questions: quizData.questions.map((q, index) => ({
          question: q.question,
          type: q.type,
          points: q.points,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        }))
      };

      console.log('📤 Submission data prepared:', submissionData);

      let result;
      if (originalQuiz) {
        console.log('🔄 Updating existing quiz with ID:', originalQuiz._id);
        result = await updateQuiz(originalQuiz._id, submissionData);
      } else {
        console.log('🆕 Creating new quiz');
        result = await createQuiz(submissionData);
      }
      
      console.log('✅ API call completed, result:', result);
      
      // Don't clear modal state here - let AssessmentCreator handle it
      // The modal state will be cleared when AssessmentCreator calls onClose()
      
      console.log('✅ Quiz saved successfully, returning success');
      return { success: true };
    } catch (err) {
      console.error('❌ Error in handleQuizCreatorSave:', err);
      setError(err.message || 'Failed to save quiz');
      setTimeout(() => setError(''), 3000);
      // Re-throw error so AssessmentCreator knows it failed
      throw err;
    }
  };

  const openAddModal = () => {
    setEditingQuiz(null);
    setShowQuizCreator(true);
  };

  const openEditModal = (quiz) => {
    // Build URL to the module content where this quiz appears
    const courseId = quiz.course || quiz.courseId;
    const moduleId = quiz.moduleId;
    
    let returnUrl;
    if (courseId && moduleId) {
      returnUrl = `/instructor/courses/${courseId}/modules/${moduleId}`;
      console.log('🔍 Built return URL to module content:', returnUrl);
    } else {
      returnUrl = window.location.href; // Fallback to current page
      console.log('🔍 Using current page as fallback return URL:', returnUrl);
    }
    
    sessionStorage.setItem('quizEditReturnUrl', returnUrl);
    console.log('🔍 Stored return URL:', returnUrl);
    
    // Show alert to confirm where we'll go back to
    alert(`After editing, you'll be redirected to: ${returnUrl}`);
    
    setEditingQuiz({
      ...quiz,
      courseId: quiz.course || quiz.courseId,
      timeLimit: quiz.duration || quiz.timeLimit || 30
    });
    setShowQuizCreator(true);
  };

  const viewSubmissions = (quizId) => {
    navigate(`/instructor/quizzes/${quizId}/submissions`);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading quizzes...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <ArrowBack style={{ marginRight: 6 }} /> Back
      </BackButton>

      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <HeaderContainer>
        <Title>Manage Quizzes</Title>
        <AddButton onClick={openAddModal}>
          <Add /> Create New Quiz
        </AddButton>
      </HeaderContainer>

      {quizzes.length === 0 ? (
        <EmptyState>
          <Quiz style={{ fontSize: '4rem', color: '#007BFF', marginBottom: '1rem' }} />
          <h3>No Quizzes Yet</h3>
          <p>Create your first quiz to get started with quick knowledge assessments.</p>
          <AddButton onClick={openAddModal}>
            <Add /> Create Your First Quiz
          </AddButton>
        </EmptyState>
      ) : (
        <QuizGrid>
          {quizzes.map((quiz) => (
            <QuizCard key={quiz._id}>
              <QuizTitle>{quiz.title}</QuizTitle>
              <QuizDescription>{quiz.description}</QuizDescription>
              
              <QuizMeta>
                <span>Course: {quiz.courseName || 'Unknown'}</span>
                <StatusBadge>Published</StatusBadge>
              </QuizMeta>

              <QuizMeta>
                <span>Questions: {quiz.questions?.length || 0}</span>
                <span>Points: {quiz.totalPoints || 0}</span>
                <span>Duration: {quiz.duration || 30} min</span>
              </QuizMeta>

              <ActionButtons>
                <ActionButton variant="edit" onClick={() => openEditModal(quiz)}>
                  <Edit fontSize="small" /> Edit
                </ActionButton>
                <ActionButton variant="submissions" onClick={() => viewSubmissions(quiz._id)}>
                  <Assessment fontSize="small" /> Submissions
                </ActionButton>
                <ActionButton variant="delete" onClick={() => deleteQuiz(quiz._id)}>
                  <Delete fontSize="small" /> Delete
                </ActionButton>
              </ActionButtons>
            </QuizCard>
          ))}
        </QuizGrid>
      )}

      <AssessmentCreator
        isOpen={showQuizCreator}
        onClose={() => {
          console.log('🔍 Modal onClose called - Return URL:', returnUrl); // Debug log
          console.log('🔍 Clearing modal state...');
          setShowQuizCreator(false);
          setEditingQuiz(null);
          console.log('✅ Modal state cleared');
          
          // Don't clear sessionStorage immediately - let AssessmentCreator handle it
          // This way navigation can still work even if modal closes first
          console.log('🔍 Modal closed, sessionStorage preserved for navigation');
        }}
        onSave={handleQuizCreatorSave}
        assessment={editingQuiz}
        isQuiz={true}
        courses={courses}
        preSelectedCourse={courseId}
        returnUrl={returnUrl}
      />
    </Container>
  );
};

export default Quizzes; 