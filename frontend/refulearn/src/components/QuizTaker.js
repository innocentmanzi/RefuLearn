import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Quiz, 
  CheckCircle, 
  RadioButtonUnchecked, 
  CheckBox, 
  CheckBoxOutlineBlank,
  AccessTime,
  Assignment,
  Send
} from '@mui/icons-material';
import offlineIntegrationService from '../services/offlineIntegrationService';

const QuizContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const QuizHeader = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const QuizTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
`;

const QuizHeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuizInfo = styled.div`
  flex: 1;
`;

const QuizNumber = styled.div`
  background: #007BFF;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const QuizDescription = styled.div`
  color: #6b7280;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
`;



const QuizMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  font-size: 0.9375rem;
  opacity: 0.9;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuizBody = styled.div`
  padding: 2rem;
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const QuestionNumber = styled.div`
  background: #007BFF;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const QuestionText = styled.h3`
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.6;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 2px solid ${props => props.selected ? '#007BFF' : '#e5e7eb'};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    border-color: ${props => props.disabled ? '#e5e7eb' : '#007BFF'};
    background: ${props => props.disabled ? 'white' : '#f8faff'};
  }
`;

const OptionText = styled.span`
  flex: 1;
  color: #374151;
  font-size: 0.9375rem;
`;

const TextAnswerInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9375rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const QuizActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

const ProgressInfo = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.primary ? '#007BFF' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#6b7280'};
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#0056b3' : '#f3f4f6'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const ScoreDisplay = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const ScoreText = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ScoreLabel = styled.div`
  font-size: 1.125rem;
  opacity: 0.9;
`;

const EditModeContainer = styled.div`
  padding: 2rem;
  background: #fff7ed;
  border: 2px solid #fb923c;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const EditModeText = styled.div`
  color: #ea580c;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const EditButton = styled.button`
  background: #ea580c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
`;

function QuizTaker({ quiz, userRole, onEdit, onComplete, onSubmissionFound, quizNumber = 1, isLoading = false, initialSubmissionData = null }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  
  // Timer states
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // CRITICAL DEBUG: Check what userRole QuizTaker receives
  console.log('🔍 QUIZTAKER RECEIVED PROPS:', {
    userRole,
    userRoleType: typeof userRole,
    isRefugee: userRole === 'refugee',
    quizTitle: quiz?.title,
    hasQuestions: !!quiz?.questions,
    questionCount: quiz?.questions?.length
  });

  // Debug: Log the complete quiz data received
  console.log('🔍 COMPLETE QUIZ DATA RECEIVED BY QUIZTAKER:', {
    quizId: quiz?._id,
    title: quiz?.title,
    description: quiz?.description,
    questions: quiz?.questions?.map((q, idx) => ({
      question: q.question,
      type: q.type,
      correctAnswer: q.correctAnswer,
      options: q.options
    })) || [],
    allQuizFields: quiz ? Object.keys(quiz) : []
  });
  
  // Add debug function to window for easy access
  useEffect(() => {
    window.debugQuizData = () => {
      console.log('🔍 DEBUG QUIZ DATA:', {
        quizId: quiz?._id,
        title: quiz?.title,
        description: quiz?.description,
        questions: quiz?.questions?.map((q, idx) => ({
          question: q.question,
          type: q.type,
          correctAnswer: q.correctAnswer,
          options: q.options
        })) || [],
        allQuizFields: quiz ? Object.keys(quiz) : [],
        url: window.location.href
      });
    };
    
    // Add debug function to check quiz completion status
    window.checkQuizCompletion = () => {
      console.log('🔍 Checking quiz completion status...');
      checkSubmissionStatus();
    };
    
    // Add debug function to manually search for quiz data
    window.searchQuizData = async () => {
      console.log('🔍 Manually searching for quiz completion data...');
      const token = localStorage.getItem('token');
      
      try {
        // Check quiz sessions
        console.log('🔍 Checking quiz sessions...');
        const sessionResponse = await fetch(`/api/quiz-sessions/user/${quiz?._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          console.log('📋 Quiz sessions data:', sessionData);
        }
        
        // Check course submissions
        console.log('🔍 Checking course submissions...');
        const submissionsResponse = await fetch(`/api/courses/${quiz?.courseId}/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          console.log('📋 Course submissions data:', submissionsData);
        }
        
        // Check course progress
        console.log('🔍 Checking course progress...');
        const progressResponse = await fetch(`/api/courses/${quiz?.courseId}/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          console.log('📋 Course progress data:', progressData);
        }
        
        // Check all user quiz sessions (debug endpoint)
        console.log('🔍 Checking all user quiz sessions...');
        const allSessionsResponse = await fetch(`/api/quiz-sessions/debug/user-sessions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (allSessionsResponse.ok) {
          const allSessionsData = await allSessionsResponse.json();
          console.log('📋 All user quiz sessions:', allSessionsData);
        }
        
      } catch (error) {
        console.error('❌ Error searching for quiz data:', error);
      }
    };
  }, [quiz]);

  // Check for existing submissions
  const checkSubmissionStatus = async () => {
    if (!quiz?._id) {
      console.log('❌ No quiz ID available for submission check');
      setCheckingSubmission(false);
      return;
    }
    
    console.log('🔍 Checking submission status for:', {
      assessmentId: quiz._id,
      courseId: quiz.courseId,
      moduleId: quiz.moduleId
    });
    
    // DEBUG: Log current answers state
    console.log('🔍 Current answers state before checking submission:', answers);
    console.log('🔍 Current submitted state:', submitted);
    console.log('🔍 Current alreadySubmitted state:', alreadySubmitted);
    
    // Check if we have initial submission data passed from parent
    if (initialSubmissionData && initialSubmissionData.answers) {
      console.log('🎯 Using initial submission data:', initialSubmissionData);
      setAlreadySubmitted(true);
      setSubmissionData(initialSubmissionData);
      setSubmitted(true);
      setScore(initialSubmissionData.score || 0);
      setAnswers(initialSubmissionData.answers);
      console.log('✅ Set answers from initial submission data:', initialSubmissionData.answers);
      setCheckingSubmission(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    
    // Check for quiz completion in multiple ways
    let isCompleted = false;
    let completionData = null;
    
    try {
      
      // Method 1: Check quiz sessions
      const sessionResponse = await fetch(`/api/quiz-sessions/${quiz._id}/completion-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData.success && sessionData.data && sessionData.data.isCompleted) {
          isCompleted = true;
          completionData = {
            score: sessionData.data.score,
            timeSpent: sessionData.data.timeSpent,
            submittedAt: sessionData.data.completedAt,
            answers: sessionData.data.answers
          };
          console.log('✅ Found quiz completion via session:', completionData);
        }
      }
    } catch (sessionError) {
      console.log('ℹ️ Session check failed:', sessionError.message);
    }
    
    // Method 1.5: Check all quiz sessions for this quiz
    if (!isCompleted) {
      try {
        const allSessionsResponse = await fetch(`/api/quiz-sessions/user/${quiz._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (allSessionsResponse.ok) {
          const sessionsData = await allSessionsResponse.json();
          if (sessionsData.success && sessionsData.data && sessionsData.data.sessions) {
            const completedSession = sessionsData.data.sessions.find(s => s.status === 'completed');
            if (completedSession) {
              isCompleted = true;
              completionData = {
                score: completedSession.score,
                timeSpent: completedSession.timeSpent,
                submittedAt: completedSession.submittedAt,
                answers: completedSession.answers
              };
              console.log('✅ Found quiz completion via user sessions:', completionData);
            }
          }
        }
      } catch (userSessionsError) {
        console.log('ℹ️ User sessions check failed:', userSessionsError.message);
      }
    }
    
    // Method 2: Check course submissions
    if (!isCompleted) {
      try {
        const url = `/api/courses/${quiz.courseId}/submissions?assessmentId=${quiz._id}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.submissions && data.data.submissions.length > 0) {
            isCompleted = true;
            const submission = data.data.submissions[0];
            completionData = {
              score: submission.score,
              timeSpent: submission.timeSpent,
              submittedAt: submission.submittedAt,
              answers: submission.answers
            };
            console.log('✅ Found quiz completion via submissions:', completionData);
          }
        }
      } catch (submissionError) {
        console.log('ℹ️ Submission check failed:', submissionError.message);
      }
    }
    
    // Method 2.5: Check all submissions for this user and find quiz submissions
    if (!isCompleted) {
      try {
        const allSubmissionsResponse = await fetch(`/api/courses/${quiz.courseId}/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (allSubmissionsResponse.ok) {
          const allSubmissionsData = await allSubmissionsResponse.json();
          if (allSubmissionsData.success && allSubmissionsData.data && allSubmissionsData.data.submissions) {
            // Look for any submission that matches this quiz ID
            const quizSubmission = allSubmissionsData.data.submissions.find(s => 
              s.assessmentId === quiz._id || 
              s.quizId === quiz._id ||
              s._id === quiz._id
            );
            
            if (quizSubmission) {
              isCompleted = true;
              completionData = {
                score: quizSubmission.score,
                timeSpent: quizSubmission.timeSpent,
                submittedAt: quizSubmission.submittedAt,
                answers: quizSubmission.answers
              };
              console.log('✅ Found quiz completion via all submissions:', completionData);
            }
          }
        }
      } catch (allSubmissionsError) {
        console.log('ℹ️ All submissions check failed:', allSubmissionsError.message);
      }
    }
    
    // If quiz is completed, set the completion state
    if (isCompleted && completionData) {
      console.log('🎯 FOUND QUIZ COMPLETION DATA:', completionData);
      console.log('🎯 ANSWERS FROM DATABASE:', completionData.answers);
      
      setAlreadySubmitted(true);
      setSubmissionData(completionData);
      setSubmitted(true);
      setScore(completionData.score || 0);
      // CRITICAL FIX: Set the answers state with submitted answers for review display
      if (completionData.answers) {
        console.log('✅ Setting answers state with:', completionData.answers);
        setAnswers(completionData.answers);
        console.log('✅ Set answers state with submitted answers:', completionData.answers);
      } else {
        console.warn('⚠️ No answers found in completion data!');
      }
      console.log('✅ Quiz already completed, showing results');
      
      // Notify parent component about found submission data
      if (onSubmissionFound) {
        onSubmissionFound(completionData);
      }
    } else {
      console.log('❌ No completion data found. isCompleted:', isCompleted, 'completionData:', completionData);
      console.log('📋 Quiz not completed yet, allowing new attempt');
    }
  };

  // Check for existing quiz session
  const checkQuizSession = async () => {
    if (!quiz?._id || userRole !== 'refugee') return;
    
    try {
      const token = localStorage.getItem('token');
              const response = await fetch(`/api/quiz-sessions/${quiz._id}/status?v=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.hasActiveSession) {
          console.log('✅ Found existing quiz session:', data.data);
          console.log('🔧 Setting sessionId to:', data.data.sessionId);
          setSessionId(data.data.sessionId);
          setQuizStarted(true);
          setTimeRemaining(data.data.timeRemaining);
          setTimerActive(data.data.timeRemaining > 0);
          // Restore previous answers
          if (data.data.answers) {
            setAnswers(data.data.answers);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking quiz session:', error);
    }
  };

  // Debug logging for quiz data
  useEffect(() => {
    console.log('🔍 QuizTaker received quiz data:', quiz);
    console.log('🔍 Quiz required properties:', {
      _id: quiz?._id,
      courseId: quiz?.courseId,
      moduleId: quiz?.moduleId,
      duration: quiz?.duration,
      hasQuestions: !!quiz?.questions,
      questionCount: quiz?.questions?.length || 0
    });
    console.log('🔍 Initial submission data:', initialSubmissionData);
    console.log('🔍 Quiz questions:', quiz?.questions);
    if (quiz?.questions) {
      quiz.questions.forEach((q, index) => {
        console.log(`🔍 Question ${index + 1}:`, {
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        });
      });
    }
    
    // If we have initial submission data, use it immediately
    if (initialSubmissionData && initialSubmissionData.answers) {
      console.log('🎯 Setting up quiz with initial submission data:', initialSubmissionData);
      setAlreadySubmitted(true);
      setSubmissionData(initialSubmissionData);
      setSubmitted(true);
      setScore(initialSubmissionData.score || 0);
      setAnswers(initialSubmissionData.answers);
      console.log('✅ Set answers from initial submission data:', initialSubmissionData.answers);
      return; // Don't check submission status if we have initial data
    }
    
    // Check for existing quiz session first
    checkQuizSession();
    
    // Check submission status when component loads
    console.log('🔄 useEffect triggered, calling checkSubmissionStatus');
    checkSubmissionStatus();
  }, [quiz, initialSubmissionData]);

  // Timer effect - starts countdown when quiz is started
  useEffect(() => {
    let timer;
    
    if (timerActive && timeRemaining > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! Auto-submit the quiz
            console.log('⏰ Time is up! Auto-submitting quiz...');
            setTimerActive(false);
            handleSubmit();
            return 0;
          }
          const newTime = prev - 1;
          // Log every 30 seconds to track timer
          if (newTime % 30 === 0) {
            console.log(`⏰ Timer: ${formatTime(newTime)} remaining`);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, submitted]);

  // Start quiz function
  const startQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let success = false;
      
      // Check if quiz object exists
      if (!quiz) {
        throw new Error('Quiz data is not available. Please refresh the page and try again.');
      }

      console.log('🚀 Starting quiz with data:', {
        quizId: quiz._id,
        courseId: quiz.courseId,
        moduleId: quiz.moduleId,
        duration: quiz.duration,
        isOnline,
        hasToken: !!token
      });

      // Validate required quiz data
      if (!quiz._id) {
        console.error('❌ Quiz object missing _id:', quiz);
        throw new Error('Quiz ID is missing. Please refresh the page and try again.');
      }
      if (!quiz.courseId) {
        console.error('❌ Quiz object missing courseId:', quiz);
        throw new Error('Course ID is missing. Please refresh the page and try again.');
      }
      if (!quiz.moduleId) {
        console.error('❌ Quiz object missing moduleId:', quiz);
        throw new Error('Module ID is missing. Please refresh the page and try again.');
      }
      if (!quiz.duration) {
        console.warn('⚠️ Quiz duration not set, using default 30 minutes');
      }
      if (!quiz.questions || quiz.questions.length === 0) {
        throw new Error('Quiz has no questions');
      }

      if (isOnline) {
        try {
          // Try online quiz start first (preserving existing behavior)
          console.log('🌐 Online mode: Starting quiz...');
          
          const response = await fetch('/api/quiz-sessions/start', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              quizId: quiz._id,
              courseId: quiz.courseId,
              moduleId: quiz.moduleId,
              duration: parseInt(quiz.duration) || 30
            })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Online quiz start successful:', data);
            
            if (data.success && data.data && data.data.sessionId) {
              setSessionId(data.data.sessionId);
              success = true;
              console.log('✅ Session ID set:', data.data.sessionId);
            } else {
              console.log('⚠️ No sessionId in response, but continuing with quiz start...');
              console.log('⚠️ Response data:', data);
              success = true; // Continue anyway, will use fallback submission
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Quiz start failed:', response.status, errorText);
            throw new Error('Failed to start quiz online');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online quiz start failed:', onlineError);
          // Fall back to simple local quiz start (no offline service dependency)
          console.log('🔄 Falling back to local quiz start...');
          success = true;
          console.log('✅ Local quiz start successful (no session tracking)');
        }
      } else {
        // Offline quiz start (simplified)
        console.log('📴 Offline mode: Starting quiz locally...');
        success = true;
        console.log('✅ Offline quiz start successful (local mode)');
      }

      if (success) {
        // Quiz started successfully (either online or offline)
        const durationInSeconds = parseInt(quiz.duration) * 60;
        setQuizStarted(true);
        setTimeRemaining(durationInSeconds); // Convert to seconds
        setTimerActive(true);
        console.log('🚀 Quiz started! Timer:', quiz?.duration, 'minutes (', durationInSeconds, 'seconds)');
        console.log('⏰ Timer initialized with:', durationInSeconds, 'seconds');
      } else {
        throw new Error('Failed to start quiz');
      }
    } catch (error) {
      console.error('❌ Error starting quiz session:', error);
      const errorMessage = error.message || 'Failed to start quiz. Please try again.';
      alert(errorMessage);
    }
  };

  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Save answers to backend
  const saveAnswersToSession = async (newAnswers) => {
    if (!sessionId) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/quiz-sessions/${sessionId}/answers`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: newAnswers })
      });
    } catch (error) {
      console.error('❌ Error saving answers:', error);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    if (submitted) return;
    
    const newAnswers = {
      ...answers,
      [questionIndex]: answer
    };
    
    setAnswers(newAnswers);
    
    // Save to backend session
    saveAnswersToSession(newAnswers);
  };

  const handleSubmit = async () => {
    if (loading || submitted) return;
    
    setLoading(true);
    try {
      console.log('🚀 Submitting quiz with sessionId:', sessionId);
      console.log('🚀 Answers to submit:', answers);
      
      if (sessionId) {
        // Submit via quiz session endpoint
        const token = localStorage.getItem('token');
        console.log('🚀 Submitting to quiz session endpoint...');
        console.log('🔧 Using sessionId:', sessionId);
        

        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`/api/quiz-sessions/${sessionId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ answers }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        console.log('🚀 Submit response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Quiz submitted successfully:', data.data);
          
          setScore(data.data.score || 0);
          setSubmitted(true);
          setTimerActive(false);
          
          // Call completion callback
          if (onComplete) {
            onComplete({
              score: data.data.score || 0,
              answers: data.data.answers,
              totalQuestions: quiz.questions.length,
              timeSpent: data.data.timeSpent
            });
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to submit quiz:', response.status, errorText);
          // Don't show alert here, let it fall through to the catch block
          throw new Error(errorText || 'Quiz session submission failed');
        }
              } else {
          console.log('⚠️ No sessionId available, trying course-based submission...');
          
          // Try course-based submission as fallback
          try {
            const token = localStorage.getItem('token');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(`/api/courses/${quiz.courseId}/quiz/${quiz._id}/submit`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                answers,
                timeSpent: (parseInt(quiz.duration) * 60) - (timeRemaining || 0) // Calculate time spent
              }),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            console.log('🚀 Course-based submit response status:', response.status);
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ Course-based quiz submission successful:', data.data);
              
              setScore(data.data.score || 0);
              setSubmitted(true);
              setTimerActive(false);
              
              // Call completion callback
              if (onComplete) {
                onComplete({
                  score: data.data.score || 0,
                  answers: data.data.answers,
                  totalQuestions: quiz.questions.length,
                  timeSpent: data.data.timeSpent
                });
              }
            } else {
              const errorText = await response.text();
              console.error('❌ Course-based submission failed:', response.status, errorText);
              throw new Error(errorText || 'Course-based submission failed');
            }
          } catch (courseError) {
            console.log('⚠️ Course-based submission failed, using local calculation...');
            console.log('⚠️ Course error:', courseError.message);
            
            // Final fallback to local calculation
            let correctAnswers = 0;
            quiz.questions.forEach((question, index) => {
              const userAnswer = answers[index];
              const correctAnswer = question.correctAnswer;
              
              if (question.type === 'multiple_choice') {
                if (userAnswer === correctAnswer) {
                  correctAnswers++;
                }
              } else if (question.type === 'true_false') {
                // Handle different formats of true/false answers
                const normalizedUserAnswer = userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1';
                const normalizedCorrectAnswer = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1';
                
                if (normalizedUserAnswer === normalizedCorrectAnswer) {
                  correctAnswers++;
                }
              } else if (question.type === 'short_answer') {
                // For short answers, we'll mark as correct for now
                // In a real app, this would need manual grading or better matching
                if (userAnswer && userAnswer.trim().length > 0) {
                  correctAnswers++;
                }
              }
            });
            
            const calculatedScore = Math.round((correctAnswers / quiz.questions.length) * 100);
            console.log('✅ Local calculation completed:', {
              correctAnswers,
              totalQuestions: quiz.questions.length,
              score: calculatedScore
            });
            
            setScore(calculatedScore);
            setSubmitted(true);
            setTimerActive(false);
            
            // Call completion callback
            if (onComplete) {
              onComplete({
                score: calculatedScore,
                answers: answers,
                totalQuestions: quiz.questions.length,
                correctAnswers: correctAnswers,
                timeSpent: (parseInt(quiz.duration) * 60) - (timeRemaining || 0)
              });
            }
          }
        }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      if (error.name === 'AbortError') {
        alert('Quiz submission timed out. Using local calculation instead.');
        // Fall back to local calculation
        let correctAnswers = 0;
        quiz.questions.forEach((question, index) => {
          const userAnswer = answers[index];
          const correctAnswer = question.correctAnswer;
          
          if (question.type === 'multiple_choice') {
            if (userAnswer === correctAnswer) {
              correctAnswers++;
            }
          } else if (question.type === 'true_false') {
            const normalizedUserAnswer = userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1';
            const normalizedCorrectAnswer = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1';
            
            if (normalizedUserAnswer === normalizedCorrectAnswer) {
              correctAnswers++;
            }
          } else if (question.type === 'short_answer') {
            if (userAnswer && userAnswer.trim().length > 0) {
              correctAnswers++;
            }
          }
        });
        
        const calculatedScore = Math.round((correctAnswers / quiz.questions.length) * 100);
        setScore(calculatedScore);
        setSubmitted(true);
        setTimerActive(false);
        
        if (onComplete) {
          onComplete({
            score: calculatedScore,
            answers: answers,
            totalQuestions: quiz.questions.length,
            correctAnswers: correctAnswers,
            timeSpent: (parseInt(quiz.duration) * 60) - (timeRemaining || 0)
          });
        }
      } else {
        alert(error.message || 'Failed to submit quiz. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAnsweredCount = () => {
    const count = Object.keys(answers).length;
    console.log('🔍 Answered count:', count, 'Answers:', answers);
    return count;
  };

  const renderQuestion = (question, index) => {
    const userAnswer = answers[index];
    
    // Debug logging for each question
    console.log(`🔍 Rendering question ${index + 1}:`, {
      type: question.type,
      question: question.question,
      correctAnswer: question.correctAnswer,
      correctAnswerType: typeof question.correctAnswer,
      hasOptions: question.options ? true : false,
      optionsLength: question.options ? question.options.length : 0,
      options: question.options,
      userRole: userRole,
      shouldShowInteractive: userRole === 'refugee'
    });
    
    // CRITICAL: Check exact type matching (support both dash and underscore formats)
    const isMultipleChoice = question.type === 'multiple_choice' || question.type === 'multiple-choice';
    const isTrueFalse = question.type === 'true_false' || question.type === 'true-false';
    const isShortAnswer = question.type === 'short_answer' || question.type === 'short-answer';
    
    console.log(`🔍 TYPE MATCHING Q${index + 1}:`, {
      rawType: question.type,
      isMultipleChoice,
      isTrueFalse, 
      isShortAnswer,
      typeOfType: typeof question.type,
      allPossibleTypes: ['multiple_choice', 'true_false', 'short_answer', 'multiple-choice', 'true-false', 'short-answer']
    });
    
    // Special debug for true/false questions
    if (question.type === 'true_false') {
      console.log(`🔍 TRUE/FALSE DEBUG for Q${index + 1}:`, {
        rawCorrectAnswer: question.correctAnswer,
        type: typeof question.correctAnswer,
        isTrue: question.correctAnswer === true,
        isStringTrue: question.correctAnswer === 'true',
        isNumber1: question.correctAnswer === 1,
        isString1: question.correctAnswer === '1',
        evaluatesToTrue: (question.correctAnswer === true || question.correctAnswer === 'true' || question.correctAnswer === 1 || question.correctAnswer === '1')
      });
    }
    
    return (
      <QuestionContainer key={index}>
        <QuestionNumber>{index + 1}</QuestionNumber>
        <QuestionText>{question.question || 'No question text available'}</QuestionText>
        
        {/* Display question type for instructor */}
        {userRole === 'instructor' && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.5rem', 
            background: '#e3f2fd', 
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: '#1565c0'
          }}>
            <strong>Type:</strong> {question.type} | 
            <strong> Points:</strong> {question.points || 1} | 
            <strong> Correct Answer:</strong> {
              isMultipleChoice ? 
                `Option ${(question.correctAnswer || 0) + 1}` :
              isTrueFalse ?
                (() => {
                  const correctAnswerIsTrue = question.correctAnswer === true || 
                                            question.correctAnswer === 'true' || 
                                            question.correctAnswer === 1 || 
                                            question.correctAnswer === '1';
                  console.log(`🔍 ANSWER DISPLAY DEBUG: correctAnswer=${question.correctAnswer}, type=${typeof question.correctAnswer}, correctAnswerIsTrue=${correctAnswerIsTrue}`);
                  return correctAnswerIsTrue ? 'True' : 'False';
                })() :
                question.correctAnswer?.toString() || 'Not set'
            }
            {question.explanation && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}
        
        {isMultipleChoice && (
          <OptionsContainer>
            {(() => {
              console.log(`🔍 MULTIPLE CHOICE Q${index + 1} - Rendering options, userRole: ${userRole}, isRefugee: ${userRole === 'refugee'}`);
              return null;
            })()}
            {question.options && question.options.length > 0 ? (
              question.options.map((option, optIndex) => (
                <OptionItem
                  key={optIndex}
                  selected={userRole === 'refugee' ? userAnswer === optIndex : false}
                  disabled={submitted || userRole === 'instructor'}
                  onClick={() => userRole === 'refugee' && handleAnswerChange(index, optIndex)}
                  style={{
                    backgroundColor: userRole === 'instructor' && question.correctAnswer === optIndex ? '#e8f5e8' : undefined,
                    borderColor: userRole === 'instructor' && question.correctAnswer === optIndex ? '#4caf50' : undefined
                  }}
                >
                  {userRole === 'refugee' ? (
                    userAnswer === optIndex ? 
                      <CheckCircle style={{ color: '#007BFF' }} /> : 
                      <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                  ) : (
                    question.correctAnswer === optIndex ?
                      <CheckCircle style={{ color: '#4caf50' }} /> :
                      <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                  )}
                  <OptionText>{option || `Option ${optIndex + 1} (empty)`}</OptionText>
                </OptionItem>
              ))
            ) : (
              <div style={{ 
                padding: '1rem', 
                background: '#fff3cd', 
                borderRadius: '4px',
                color: '#856404',
                border: '1px solid #ffeaa7'
              }}>
                No options available for this multiple choice question
              </div>
            )}
          </OptionsContainer>
        )}
        
        {isTrueFalse && (
          <OptionsContainer>
            {(() => {
              // Determine the correct answer more explicitly
              const correctAnswerIsTrue = question.correctAnswer === true || 
                                        question.correctAnswer === 'true' || 
                                        question.correctAnswer === 1 || 
                                        question.correctAnswer === '1';
              
              console.log('🔍 TRUE/FALSE RENDERING:', {
                question: question.question,
                rawCorrectAnswer: question.correctAnswer,
                correctAnswerIsTrue,
                willHighlightTrue: correctAnswerIsTrue,
                willHighlightFalse: !correctAnswerIsTrue,
                userRole: userRole,
                shouldShowInteractive: userRole === 'refugee'
              });
              
              return (
                <>
                  <OptionItem
                    selected={userRole === 'refugee' ? userAnswer === true : false}
                    disabled={submitted || userRole === 'instructor'}
                    onClick={() => userRole === 'refugee' && handleAnswerChange(index, true)}
                    style={{
                      backgroundColor: userRole === 'instructor' && correctAnswerIsTrue ? '#e8f5e8' : undefined,
                      borderColor: userRole === 'instructor' && correctAnswerIsTrue ? '#4caf50' : undefined
                    }}
                  >
                    {userRole === 'refugee' ? (
                      userAnswer === true ? 
                        <CheckCircle style={{ color: '#007BFF' }} /> : 
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    ) : (
                      correctAnswerIsTrue ?
                        <CheckCircle style={{ color: '#4caf50' }} /> :
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    )}
                    <OptionText>True</OptionText>
                  </OptionItem>
                  <OptionItem
                    selected={userRole === 'refugee' ? userAnswer === false : false}
                    disabled={submitted || userRole === 'instructor'}
                    onClick={() => userRole === 'refugee' && handleAnswerChange(index, false)}
                    style={{
                      backgroundColor: userRole === 'instructor' && !correctAnswerIsTrue ? '#e8f5e8' : undefined,
                      borderColor: userRole === 'instructor' && !correctAnswerIsTrue ? '#4caf50' : undefined
                    }}
                  >
                    {userRole === 'refugee' ? (
                      userAnswer === false ? 
                        <CheckCircle style={{ color: '#007BFF' }} /> : 
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    ) : (
                      !correctAnswerIsTrue ?
                        <CheckCircle style={{ color: '#4caf50' }} /> :
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    )}
                    <OptionText>False</OptionText>
                  </OptionItem>
                </>
              );
            })()}
          </OptionsContainer>
        )}
        
        {isShortAnswer && (
          <>
            {(() => {
              console.log(`🔍 SHORT ANSWER Q${index + 1} - Rendering text input, userRole: ${userRole}, isRefugee: ${userRole === 'refugee'}`);
              return null;
            })()}
            <TextAnswerInput
              value={userRole === 'refugee' ? (userAnswer || '') : ''}
              onChange={(e) => userRole === 'refugee' && handleAnswerChange(index, e.target.value)}
              placeholder={userRole === 'refugee' ? "Type your answer here..." : "Student will type answer here"}
              disabled={submitted || userRole === 'instructor'}
              readOnly={userRole === 'instructor'}
            />
            {userRole === 'instructor' && question.correctAnswer && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem', 
                background: '#e8f5e8', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: '#2e7d32'
              }}>
                <strong>Sample Answer:</strong> {question.correctAnswer}
              </div>
            )}
          </>
        )}
      </QuestionContainer>
    );
  };

  // Show assignment submission form for assessments without questions
  if (quiz.type === 'assessment' && (!quiz.questions || quiz.questions.length === 0)) {
    return (
      <QuizContainer>
        <QuizHeader>
          <QuizHeaderTop>
            <QuizInfo>
              <QuizTitle>Assessment 1: {quiz?.title || 'Untitled Assessment'}</QuizTitle>
              {quiz?.totalPoints && (
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  marginTop: '0.5rem'
                }}>
                  {quiz.totalPoints} Points
                </div>
              )}
              {quiz?.description && (
                <QuizDescription>{quiz.description}</QuizDescription>
              )}
            </QuizInfo>
          </QuizHeaderTop>
        </QuizHeader>
        
        <QuizBody>
          {checkingSubmission ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
                Checking Submission Status...
              </h3>
              <p style={{ color: '#6b7280' }}>
                Please wait while we check if you've already submitted this assignment.
              </p>
            </div>
          ) : alreadySubmitted ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                background: '#d4edda',
                color: '#155724',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #c3e6cb',
                marginBottom: '1rem'
              }}>
                <h3 style={{ color: '#155724', marginBottom: '0.5rem' }}>
                  ✅ Quiz Already Completed
                </h3>
                <p style={{ color: '#155724', margin: 0 }}>
                  You have already completed this quiz on {new Date(submissionData?.submittedAt).toLocaleDateString()}
                </p>
              </div>
              {submissionData && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#374151', marginBottom: '1rem' }}>
                    Quiz Results:
                  </h4>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: submissionData.score >= 70 ? '#28a745' : '#dc3545',
                    marginBottom: '0.5rem'
                  }}>
                    {submissionData.score}%
                  </div>
                  <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    {submissionData.score >= 70 ? '🎉 Great job! You passed the quiz.' : '📚 Consider reviewing the material.'}
                  </div>
                  <p style={{ color: '#6b7280', margin: '0.25rem 0' }}>
                    <strong>Completed:</strong> {new Date(submissionData.submittedAt).toLocaleString()}
                  </p>
                  {submissionData.timeSpent && (
                    <p style={{ color: '#6b7280', margin: '0.25rem 0' }}>
                      <strong>Time Spent:</strong> {Math.floor(submissionData.timeSpent / 60)}m {submissionData.timeSpent % 60}s
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : !showSubmissionForm ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
                Ready to Submit Your Assignment?
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                When you're ready to submit your work for this assessment, click the button below to choose your submission method.
              </p>
              <button
                onClick={() => setShowSubmissionForm(true)}
                style={{
                  background: '#007BFF',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                Submit Assignment
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => setShowSubmissionForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007BFF',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ← Back to Assessment
                </button>
              </div>
              <AssignmentSubmissionForm 
                assessmentId={quiz?._id}
                courseId={quiz?.courseId}
                moduleId={quiz?.moduleId}
                assessmentTitle={quiz?.title}
                onSubmissionSuccess={(submissionData) => {
                  setAlreadySubmitted(true);
                  setSubmissionData(submissionData);
                  setShowSubmissionForm(false);
                }}
              />
            </div>
          )}
        </QuizBody>
      </QuizContainer>
    );
  }

  // Show error message for quizzes without questions
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <QuizContainer>
        <QuizHeader>
          <QuizHeaderTop>
            <QuizInfo>
              <QuizTitle>Quiz: {quiz?.title || 'Untitled Quiz'}</QuizTitle>
              {quiz?.description && (
                <QuizDescription>{quiz.description}</QuizDescription>
              )}
            </QuizInfo>
          </QuizHeaderTop>
        </QuizHeader>
        
        <QuizBody>
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '1rem' }}>
              ⚠️ Quiz Has No Questions
            </h3>
            <p style={{ color: '#856404', marginBottom: '1rem' }}>
              This quiz exists but doesn't have any questions yet. Please contact your instructor to add questions.
            </p>
            <div style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '4px',
              textAlign: 'left',
              fontSize: '0.875rem'
            }}>
              <strong>Quiz Info:</strong><br/>
              Title: {quiz?.title || 'Untitled'}<br/>
              Description: {quiz?.description || 'No description'}<br/>
              Questions: {quiz?.questions?.length || 0}<br/>
              ID: {quiz?._id}<br/>
              Type: {quiz?.type || 'quiz'}
            </div>
          </div>
        </QuizBody>
      </QuizContainer>
    );
  }

  return (
    <QuizContainer>
      <QuizHeader>
        <QuizHeaderTop>
          <QuizInfo>
            <QuizTitle>
              {quiz.type === 'quiz' ? 'Quiz' : 
               quiz.type === 'assessment' ? 'Assessment' : 
               quiz.type === 'exam' ? 'Exam' : 
               'Quiz'} {quizNumber}: {quiz.title || `Untitled ${quiz.type === 'quiz' ? 'Quiz' : quiz.type === 'assessment' ? 'Assessment' : quiz.type === 'exam' ? 'Exam' : 'Quiz'}`}
            </QuizTitle>
            {quiz.totalPoints && (
              <div style={{ 
                color: '#6b7280', 
                fontSize: '1rem', 
                fontWeight: 'bold',
                marginTop: '0.5rem'
              }}>
                {quiz.totalPoints} Points
              </div>
            )}
            {quiz.description && (
              <QuizDescription>{quiz.description}</QuizDescription>
            )}
          </QuizInfo>
        </QuizHeaderTop>
      </QuizHeader>



      {submitted ? (
        <ResultsContainer>
          <ScoreDisplay>
            <ScoreText>{score}%</ScoreText>
            <ScoreLabel>Final Score</ScoreLabel>
          </ScoreDisplay>
          <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
            You answered {Object.keys(answers).length} out of {quiz.questions.length} questions
            <button 
              onClick={() => {
                console.log('🔍 Manual debug - Current answers:', answers);
                console.log('🔍 Manual debug - Checking submission status...');
                checkSubmissionStatus();
              }}
              style={{ 
                marginLeft: '1rem',
                padding: '0.25rem 0.5rem', 
                background: '#007BFF', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Debug Answers
            </button>
          </div>
          <div style={{ color: '#6b7280', marginBottom: '2rem' }}>
            {score >= 70 ? '🎉 Great job! You passed the quiz.' : ''}
          </div>

          {/* Question Review Section */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '2rem', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginTop: '2rem'
          }}>
            <h3 style={{ color: '#007BFF', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              📋 Question Review
            </h3>
            {(() => {
              console.log('🔍 RENDERING QUIZ REVIEW - Current answers state:', answers);
              console.log('🔍 RENDERING QUIZ REVIEW - Answers object keys:', Object.keys(answers));
              console.log('🔍 RENDERING QUIZ REVIEW - Submitted state:', submitted);
              console.log('🔍 RENDERING QUIZ REVIEW - Already submitted state:', alreadySubmitted);
              return null;
            })()}
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index];
              const correctAnswer = question.correctAnswer;
              let isCorrect = false;
              let userAnswerText = '';
              let correctAnswerText = '';
              
              console.log(`🔍 Question ${index + 1} review - userAnswer:`, userAnswer, 'type:', typeof userAnswer);

              // Determine if answer is correct and format answer texts
              if (question.type === 'multiple-choice' || question.type === 'multiple_choice') {
                isCorrect = userAnswer === correctAnswer;
                userAnswerText = question.options && question.options[userAnswer] ? question.options[userAnswer] : 'No answer';
                correctAnswerText = question.options && question.options[correctAnswer] ? question.options[correctAnswer] : 'Not set';
              } else if (question.type === 'true-false' || question.type === 'true_false') {
                const normalizedUserAnswer = userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1';
                const normalizedCorrectAnswer = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1';
                isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
                userAnswerText = userAnswer ? (normalizedUserAnswer ? 'True' : 'False') : 'No answer';
                correctAnswerText = normalizedCorrectAnswer ? 'True' : 'False';
              } else if (question.type === 'short-answer' || question.type === 'short_answer') {
                userAnswerText = userAnswer || 'No answer';
                correctAnswerText = correctAnswer || 'No correct answer specified';
                // For short answer, consider correct if user provided any answer
                isCorrect = userAnswer && userAnswer.toString().trim().length > 0;
              }

              return (
                <div key={index} style={{
                  padding: '1rem',
                  borderBottom: '1px solid #eee',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    <strong>Q{index + 1}: {question.question}</strong>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: isCorrect ? '#d4edda' : '#f8d7da',
                    borderRadius: '6px',
                    border: `1px solid ${isCorrect ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    {isCorrect ? (
                      <CheckCircle style={{ color: '#28a745', fontSize: '1.2rem' }} />
                    ) : (
                      <div style={{ 
                        color: '#dc3545', 
                        fontSize: '1.2rem',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>✗</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>Your answer:</strong> {userAnswerText}
                      </div>
                      <div style={{ color: '#721c24' }}>
                        <strong>Correct answer:</strong> {correctAnswerText}
                      </div>
                    </div>
                  </div>
                  {question.explanation && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#f8f9fa',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      color: '#6c757d'
                    }}>
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ResultsContainer>
      ) : isLoading ? (
        /* Loading Screen */
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '3rem 2rem',
          margin: '1rem 0',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#1f2937', 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem' 
            }}>
              Loading Quiz...
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              lineHeight: '1.6'
            }}>
              Please wait while we prepare your quiz.
            </p>
          </div>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007BFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : !quizStarted && userRole === 'refugee' && quiz && quiz._id ? (
        /* Start Quiz Screen for Refugees */
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '3rem 2rem',
          margin: '1rem 0',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#1f2937', 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem' 
            }}>
              Ready to Start the Quiz?
            </h3>
                        <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              lineHeight: '1.6',
              marginBottom: '2rem' 
            }}>
              Once you click "Start Quiz", the timer will begin and you'll have{' '}
              <strong>{quiz.duration || 'unlimited'} {quiz.duration ? 'minutes' : 'time'}</strong> to complete all questions.
            </p>
          </div>
          <button
            onClick={startQuiz}
            disabled={isLoading || !quiz || !quiz._id}
            style={{
              background: isLoading || !quiz || !quiz._id ? '#9ca3af' : '#007BFF',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: isLoading || !quiz || !quiz._id ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              margin: '0 auto',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isLoading && quiz && quiz._id) {
                e.target.style.background = '#0056b3';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && quiz && quiz._id) {
                e.target.style.background = '#007BFF';
              }
            }}
          >
            {isLoading ? '⏳ Loading...' : '🚀 Start Quiz'}
          </button>
        </div>
      ) : !quiz || !quiz._id ? (
        /* Quiz Not Loaded Screen */
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '3rem 2rem',
          margin: '1rem 0',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#dc3545', 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem' 
            }}>
              Quiz Not Available
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              lineHeight: '1.6'
            }}>
              The quiz data could not be loaded. Please refresh the page or contact support.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#007BFF',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#0056b3'}
            onMouseOut={(e) => e.target.style.background = '#007BFF'}
          >
            🔄 Refresh Page
          </button>
        </div>
      ) : (
        <>
          {/* Timer Display */}
          {(timerActive || timeRemaining !== null) && (
            <div style={{
              background: '#fff',
              border: '2px solid #007BFF',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: timeRemaining <= 300 ? '#dc3545' : '#007BFF', // Red when 5 minutes or less
                marginBottom: '0.5rem'
              }}>
                ⏰ Time Remaining: {timeRemaining !== null ? formatTime(timeRemaining) : 'Timer not active'}
              </div>
              {timeRemaining <= 300 && timeRemaining > 0 && (
                <div style={{
                  fontSize: '0.9rem',
                  color: '#dc3545',
                  fontWeight: '500'
                }}>
                  ⚠️ Less than 5 minutes remaining!
                </div>
              )}

            </div>
          )}
          
          <QuizBody>
            {quiz.questions.map((question, index) => renderQuestion(question, index))}
          </QuizBody>

          <QuizActions>
            <ProgressInfo>
              {userRole === 'refugee' && (
                <>
                  <div style={{ marginBottom: '0.5rem' }}>
                    {`${getAnsweredCount()} of ${quiz.questions.length} questions answered`}
                  </div>
                  {timerActive && timeRemaining !== null && (
                    <div style={{
                      fontSize: '0.9rem',
                      color: timeRemaining <= 300 ? '#dc3545' : '#007BFF',
                      fontWeight: '500'
                    }}>
                      ⏰ {formatTime(timeRemaining)} remaining
                    </div>
                  )}
                </>
              )}
            </ProgressInfo>
            {userRole === 'instructor' ? (
              <ActionButton onClick={onEdit}>
                Edit Quiz
              </ActionButton>
            ) : (
              <ActionButton
                primary
                onClick={handleSubmit}
                disabled={loading || getAnsweredCount() === 0}
              >
                <Send />
                {loading ? 'Submitting...' : `Submit Quiz (${getAnsweredCount()}/${quiz.questions.length})`}
              </ActionButton>
            )}
          </QuizActions>
        </>
      )}
    </QuizContainer>
  );
  };

// Assignment Submission Form Component
function AssignmentSubmissionForm({ assessmentId, courseId, moduleId, assessmentTitle, onSubmissionSuccess }) {
  const [submissionType, setSubmissionType] = useState('file'); // 'file' or 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validation
    if (submissionType === 'file' && !selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    if (submissionType === 'link' && !submissionLink.trim()) {
      alert('Please enter a submission link');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let success = false;
      
      const formData = new FormData();
      formData.append('assessmentId', assessmentId);
      formData.append('courseId', courseId);
      formData.append('moduleId', moduleId);
      formData.append('submissionType', submissionType);
      formData.append('submissionText', submissionText);
      
      if (submissionType === 'file' && selectedFile) {
        formData.append('submissionFile', selectedFile);
      } else if (submissionType === 'link') {
        formData.append('submissionLink', submissionLink);
      }

      if (isOnline) {
        try {
          // Try online submission first (preserving existing behavior)
          console.log('🌐 Online mode: Submitting assignment...');
          
          const response = await fetch('/api/courses/submissions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const responseData = await response.json();
            success = true;
            console.log('✅ Online assignment submission successful');
            
            setSubmitted(true);
            alert('Assignment submitted successfully!');
            
            // Call the success callback with submission data
            if (onSubmissionSuccess) {
              onSubmissionSuccess({
                submissionType,
                submittedAt: new Date(),
                status: 'Submitted',
                ...responseData.data
              });
            }
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit assignment');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online submission failed, using offline:', onlineError);
          // Fall back to offline submission
          const result = await offlineIntegrationService.submitAssignmentOffline({
            assessmentId,
            courseId,
            moduleId,
            submissionType,
            submissionText,
            submissionLink: submissionType === 'link' ? submissionLink : null,
            submissionFile: submissionType === 'file' ? selectedFile : null
          });
          
          if (result.success) {
            success = true;
            console.log('✅ Offline assignment submission successful');
            
            setSubmitted(true);
            alert('Assignment submitted offline! Will sync when online.');
            
            // Call the success callback with submission data
            if (onSubmissionSuccess) {
              onSubmissionSuccess({
                submissionType,
                submittedAt: new Date(),
                status: 'Submitted Offline',
                offline: true
              });
            }
          } else {
            throw new Error('Failed to submit assignment offline');
          }
        }
      } else {
        // Offline submission
        console.log('📴 Offline mode: Submitting assignment offline...');
        const result = await offlineIntegrationService.submitAssignmentOffline({
          assessmentId,
          courseId,
          moduleId,
          submissionType,
          submissionText,
          submissionLink: submissionType === 'link' ? submissionLink : null,
          submissionFile: submissionType === 'file' ? selectedFile : null
        });
        
        if (result.success) {
          success = true;
          console.log('✅ Offline assignment submission successful');
          
          setSubmitted(true);
          alert('Assignment submitted offline! Will sync when online.');
          
          // Call the success callback with submission data
          if (onSubmissionSuccess) {
            onSubmissionSuccess({
              submissionType,
              submittedAt: new Date(),
              status: 'Submitted Offline',
              offline: true
            });
          }
        } else {
          throw new Error('Failed to submit assignment offline');
        }
      }

      if (!success) {
        throw new Error('Failed to submit assignment');
      }

    } catch (error) {
      console.error('❌ Assignment submission error:', error);
      alert('Failed to submit assignment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: '#f0f9ff',
        borderRadius: '12px',
        border: '1px solid #0ea5e9'
      }}>
        <CheckCircle style={{ fontSize: '4rem', color: '#0ea5e9', marginBottom: '1rem' }} />
        <h3 style={{ color: '#0c4a6e', marginBottom: '1rem' }}>Assignment Submitted!</h3>
        <p style={{ color: '#075985', marginBottom: '0' }}>
          Your assignment has been submitted successfully. Your instructor will review it and provide feedback.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#f9fafb',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem' }}>
          Submit Your Assignment
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
          Choose how you'd like to submit your work for this assignment
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Submission Type Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Submission Type
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="submissionType"
                value="file"
                checked={submissionType === 'file'}
                onChange={(e) => setSubmissionType(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              📎 Upload File
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="submissionType"
                value="link"
                checked={submissionType === 'link'}
                onChange={(e) => setSubmissionType(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              🔗 Submit Link
            </label>
          </div>
        </div>

        {/* File Upload */}
        {submissionType === 'file' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Upload Assignment File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                cursor: 'pointer'
              }}
            />
            {selectedFile && (
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Link Submission */}
        {submissionType === 'link' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Assignment Link
            </label>
            <input
              type="url"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              placeholder="https://example.com/your-assignment"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
        )}

        {/* Additional Text */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Additional Comments (Optional)
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Add any additional comments about your submission..."
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#007BFF',
            color: 'white',
            border: 'none',
            padding: '0.875rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          <Send />
          {loading ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </div>
  );
}

export default QuizTaker; 