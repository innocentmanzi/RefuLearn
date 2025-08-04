import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QuizRedirect = () => {
  const { courseId, moduleId, contentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectToProperQuiz = async () => {
      try {
        console.log('🔄 QuizRedirect: Redirecting old quiz URL to proper route');
        console.log('📍 Course ID:', courseId);
        console.log('📍 Module ID:', moduleId);
        console.log('📍 Content ID (index):', contentId);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const course = data.data?.course;
          const module = course?.modules?.find(m => m._id === moduleId);
          
          if (module && module.quizzes) {
            const quizIndex = parseInt(contentId);
            const quiz = module.quizzes[quizIndex];
            
            if (quiz && quiz._id) {
              const properUrl = `/courses/${courseId}/modules/${moduleId}/quiz/${quiz._id}`;
              console.log('🚀 QuizRedirect: Redirecting to:', properUrl);
              window.location.href = properUrl;
              return;
            } else {
              console.error('❌ QuizRedirect: Quiz not found at index:', quizIndex);
              setError('Quiz not found. Please try navigating from the course overview.');
            }
          } else {
            console.error('❌ QuizRedirect: Module or quizzes not found');
            setError('Module not found. Please try navigating from the course overview.');
          }
        } else {
          console.error('❌ QuizRedirect: Failed to fetch course data');
          setError('Failed to load course data. Please try navigating from the course overview.');
        }
      } catch (error) {
        console.error('❌ QuizRedirect: Error during redirect:', error);
        setError('An error occurred. Please try navigating from the course overview.');
      } finally {
        setLoading(false);
      }
    };
    
    redirectToProperQuiz();
  }, [courseId, moduleId, contentId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Redirecting to quiz...</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Please wait while we redirect you to the correct quiz page.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{ color: '#d32f2f', fontSize: '1.2rem', marginBottom: '1rem' }}>
          {error}
        </div>
        <button 
          onClick={() => navigate(`/courses/${courseId}/overview`)}
          style={{
            background: '#007BFF',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go to Course Overview
        </button>
      </div>
    );
  }

  return null;
};

export default QuizRedirect; 