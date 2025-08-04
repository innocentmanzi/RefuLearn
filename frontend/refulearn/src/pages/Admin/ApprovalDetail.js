import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 1rem;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  
  &:hover {
    background: #545b62;
  }
`;

const Title = styled.h1`
  color: #000;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
`;

const DetailCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailLabel = styled.strong`
  color: #000;
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const DetailValue = styled.div`
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #007bff;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &.approve {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.reject {
    background: #000;
    color: white;
    
    &:hover {
      background: #333;
    }
  }
`;

const Badge = styled.div`
  background: #ffc107;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1.5rem;
`;

// New styled components for course content display
const CourseContentSection = styled.div`
  margin-top: 2rem;
  border-top: 2px solid #e9ecef;
  padding-top: 2rem;
`;

const ModuleCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ModuleTitle = styled.h3`
  color: #007bff;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ContentItem = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
`;

const ContentItemTitle = styled.h4`
  color: #495057;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
`;

const ContentItemType = styled.span`
  background: #e9ecef;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.5rem;
`;

const ContentItemData = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
  max-height: 200px;
  overflow-y: auto;
`;

const QuizCard = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
`;

const QuizTitle = styled.h4`
  color: #856404;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
`;

const QuestionItem = styled.div`
  background: white;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
`;

const QuestionText = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
`;

const OptionItem = styled.div`
  margin-left: 1rem;
  margin-bottom: 0.25rem;
  color: #6c757d;
  font-size: 0.9rem;
`;

const CorrectAnswer = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const SectionTitle = styled.h2`
  color: #495057;
  margin: 2rem 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
`;

const ApprovalDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedQuizzes, setExpandedQuizzes] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  // Helper function to safely render any field (object, array, or string)
  const renderField = (field) => {
    if (!field) return 'N/A';
    if (typeof field === 'string') return field;
    if (Array.isArray(field)) return field.join(', ');
    if (typeof field === 'object') {
      // Special handling for salary object
      if (field.min !== undefined && field.max !== undefined) {
        return `${field.min || 'N/A'} - ${field.max || 'N/A'} ${field.currency || ''}`;
      }
      return JSON.stringify(field, null, 2);
    }
    return String(field);
  };

  // Fetch complete course content
  const fetchCourseContent = async (courseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching course content for ID:', courseId);
      console.log('🔍 Using token:', token ? 'Token exists' : 'No token');
      
      // Try admin API first
      let response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Admin API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 Course content fetched from admin API:', data);
        console.log('📚 Course data structure:', data.data?.course || data);
        console.log('📚 Modules found:', (data.data?.course || data)?.modules?.length || 0);
        console.log('📚 Course title:', (data.data?.course || data)?.title);
        console.log('📚 Course ID:', (data.data?.course || data)?._id);
        
        // Debug: Log the actual course content structure
        const courseData = data.data?.course || data;
        console.log('🔍 DEBUG - Full course data:', JSON.stringify(courseData, null, 2));
        console.log('🔍 DEBUG - Course description:', courseData?.description);
        console.log('🔍 DEBUG - Course overview:', courseData?.overview);
        console.log('🔍 DEBUG - Course modules:', courseData?.modules);
        console.log('🔍 DEBUG - Course learning outcomes:', courseData?.courseLearningOutcomes);
        console.log('🔍 DEBUG - Course resources:', courseData?.courseResources);
        console.log('🔍 DEBUG - Course assessments:', courseData?.courseAssessments);
        console.log('🔍 DEBUG - Course discussions:', courseData?.courseDiscussions);
        console.log('🔍 DEBUG - Instructor info:', courseData?.instructorInfo);
        
        // Log quiz information
        console.log('🔍 DEBUG - Course-level quizzes:', courseData?.courseQuizzes?.length || 0);
        if (courseData?.courseQuizzes) {
          courseData.courseQuizzes.forEach((quiz, index) => {
            console.log(`🔍 Course Quiz ${index + 1}:`, {
              title: quiz.title,
              questionCount: quiz.questions?.length || 0,
              questions: quiz.questions?.map(q => ({
                question: q.question,
                options: q.options?.length || 0,
                correctAnswer: q.correctAnswer
              }))
            });
          });
        }
        
        if (courseData?.modules) {
          courseData.modules.forEach((module, moduleIndex) => {
            if (module.quizzes && module.quizzes.length > 0) {
              console.log(`🔍 Module ${moduleIndex + 1} quizzes:`, module.quizzes.map(quiz => ({
                title: quiz.title,
                questionCount: quiz.questions?.length || 0,
                questions: quiz.questions?.map(q => ({
                  question: q.question,
                  options: q.options?.length || 0,
                  correctAnswer: q.correctAnswer
                }))
              })));
            }
          });
        }
        
        setCourseContent(courseData);
      } else {
        console.warn('⚠️ Admin API failed, trying regular course API...');
        
        // Fallback to regular course API
        response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('🔍 Regular API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📚 Course content fetched from regular API:', data);
          const courseData = data.data?.course || data;
          setCourseContent(courseData);
        } else {
          console.error('Failed to fetch course content from both APIs:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch complete job content
  const fetchJobContent = async (jobId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching job content for ID:', jobId);
      
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('💼 Job content fetched:', data);
        setCourseContent(data.data?.job || data);
      } else {
        console.error('Failed to fetch job content:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching job content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch complete scholarship content
  const fetchScholarshipContent = async (scholarshipId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching scholarship content for ID:', scholarshipId);
      
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎓 Scholarship content fetched:', data);
        setCourseContent(data.data?.scholarship || data);
      } else {
        console.error('Failed to fetch scholarship content:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching scholarship content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get item data from navigation state or fetch from API
    if (location.state) {
      console.log('📋 REAL BACKEND DATA received for approval detail:', location.state.item);
      console.log('🔍 Item fields from backend:', Object.keys(location.state.item));
      console.log('📝 Item content preview:', {
        title: location.state.item.title,
        description: location.state.item.description?.substring(0, 100),
        createdAt: location.state.item.createdAt,
        _id: location.state.item._id
      });
      setItem(location.state.item);
      setActiveTab(location.state.activeTab);
      
      // Fetch complete content based on item type
      if (location.state.item._id) {
        if (location.state.activeTab === 'courses') {
          fetchCourseContent(location.state.item._id);
        } else if (location.state.activeTab === 'jobs') {
          fetchJobContent(location.state.item._id);
        } else if (location.state.activeTab === 'scholarships') {
          fetchScholarshipContent(location.state.item._id);
        }
      }
    } else {
      // If no state, redirect back or fetch from API
      navigate('/admin/approvals');
    }
  }, [location.state, navigate]);

  const handleApproval = async (action, reason = '') => {
    try {
      console.log('🔍 Sending approval request:', {
        action,
        reason,
        itemId: item._id,
        activeTab,
        itemType: item.type
      });
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }
      
      const requestBody = { action, reason };
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`/api/admin/${activeTab}/${item._id}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Approval successful:', responseData);
        alert(`${activeTab.slice(0, -1)} ${action}d successfully!`);
        navigate('/admin/approvals');
      } else {
        const errorText = await response.text();
        console.error('❌ Approval failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        let errorMessage = 'Error processing approval';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        alert(`Error processing approval: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error during approval:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const handleApprove = () => {
    handleApproval('approve');
  };

  const handleReject = () => {
    const reason = prompt('Reason for rejection (optional):');
    handleApproval('reject', reason);
  };

  // Render content item based on type
  const renderContentItem = (contentItem, index) => {
    const { type, title, data, url, description, content, fileType, fileSize, thumbnail, transcript } = contentItem;
    
    return (
      <ContentItem key={index}>
        <ContentItemTitle>
          <ContentItemType>{type}</ContentItemType>
          {title || `Content ${index + 1}`}
        </ContentItemTitle>
        
        <ContentItemData>
          {/* Video Content */}
          {type === 'video' && (
            <>
              {url && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Video URL:</strong> 
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                    {url}
                  </a>
                </div>
              )}
              {thumbnail && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Thumbnail:</strong> 
                  <img src={thumbnail} alt="Video thumbnail" style={{ maxWidth: '200px', marginLeft: '0.5rem' }} />
                </div>
              )}
              {transcript && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Transcript:</strong> {transcript}
                </div>
              )}
              {description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {description}
                </div>
              )}
              {data && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong> {data}
                </div>
              )}
            </>
          )}
          
          {/* File Content */}
          {type === 'file' && (
            <>
              {url && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>File URL:</strong> 
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                    {url}
                  </a>
                </div>
              )}
              {fileType && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>File Type:</strong> {fileType}
                </div>
              )}
              {fileSize && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>File Size:</strong> {fileSize}
                </div>
              )}
              {description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {description}
                </div>
              )}
              {data && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong> {data}
                </div>
              )}
            </>
          )}
          
          {/* Article Content */}
          {type === 'article' && (
            <>
              {url && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Article URL:</strong> 
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                    {url}
                  </a>
                </div>
              )}
              {content && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong>
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}
              {data && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong>
                  <div dangerouslySetInnerHTML={{ __html: data }} />
                </div>
              )}
              {description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {description}
                </div>
              )}
            </>
          )}
          
          {/* Text Content */}
          {type === 'text' && (
            <>
              {data && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong>
                  <div dangerouslySetInnerHTML={{ __html: data }} />
                </div>
              )}
              {content && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong>
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}
              {description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {description}
                </div>
              )}
            </>
          )}
          
          {/* General Content */}
          {type === 'content' && (
            <>
              {data && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong>
                  <div dangerouslySetInnerHTML={{ __html: data }} />
                </div>
              )}
              {content && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong>
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}
              {description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {description}
                </div>
              )}
            </>
          )}
          
          {/* Discussion Content */}
          {type === 'discussion' && (
            <>
              {data && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Discussion Topic:</strong> {data}
                </div>
              )}
              {content && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Content:</strong> {content}
                </div>
              )}
              {description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {description}
                </div>
              )}
            </>
          )}
          
          {/* Link Content */}
          {type === 'link' && (
            <>
              {url && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Link URL:</strong> 
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                    {url}
                  </a>
                </div>
              )}
              {description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {description}
                </div>
              )}
            </>
          )}
        </ContentItemData>
      </ContentItem>
    );
  };

  // Render quiz questions
  const renderQuiz = (quiz, index) => {
    const quizKey = `${quiz._id || index}`;
    const isExpanded = expandedQuizzes[quizKey];
    
    console.log(`🔍 Rendering quiz ${index + 1}:`, {
      title: quiz.title,
      questionCount: quiz.questions?.length || 0,
      questions: quiz.questions?.map(q => ({
        question: q.question || q.text,
        options: q.options?.length || 0,
        correctAnswer: q.correctAnswer,
        correctAnswerType: typeof q.correctAnswer,
        hasExplanation: !!q.explanation,
        explanation: q.explanation,
        fullQuestion: q
      }))
    });
    
    const toggleQuiz = () => {
      setExpandedQuizzes(prev => ({
        ...prev,
        [quizKey]: !prev[quizKey]
      }));
    };
    
    return (
      <QuizCard key={index}>
        <QuizTitle 
          onClick={toggleQuiz}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <ContentItemType>Quiz #{index + 1}</ContentItemType>
            {quiz.title || `Quiz ${index + 1}`}
            <span style={{ fontSize: '0.8rem', color: '#6c757d', marginLeft: '1rem' }}>
              ({quiz.questions?.length || 0} questions)
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </QuizTitle>
        
        {isExpanded && quiz.questions && quiz.questions.map((question, qIndex) => (
          <QuestionItem key={qIndex}>
            <QuestionText style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: '#495057' }}>Question {qIndex + 1}:</strong> 
              <span style={{ marginLeft: '0.5rem' }}>
                {question.question || question.text || 'No question text provided'}
              </span>
            </QuestionText>
            
            {question.options && question.options.map((option, oIndex) => {
              const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : 
                                  question.correct !== undefined ? question.correct :
                                  question.answer !== undefined ? question.answer : undefined;
              
              const isCorrect = typeof correctAnswer === 'number' 
                ? oIndex === correctAnswer
                : String.fromCharCode(65 + oIndex) === correctAnswer;
              
              return (
                <OptionItem 
                  key={oIndex}
                  style={{
                    backgroundColor: isCorrect ? '#d4edda' : '#f8f9fa',
                    border: isCorrect ? '2px solid #28a745' : '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '0.75rem',
                    margin: '0.5rem 0',
                    fontWeight: isCorrect ? 'bold' : 'normal',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ color: isCorrect ? '#155724' : '#495057' }}>
                    <strong>{String.fromCharCode(65 + oIndex)}.</strong> {option}
                  </span>
                  {isCorrect && (
                    <span style={{ 
                      color: '#28a745', 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      ✓ CORRECT
                    </span>
                  )}
                </OptionItem>
              );
            })}
            
            {(question.correctAnswer !== undefined || question.correct !== undefined || question.answer !== undefined) && (
              <CorrectAnswer style={{ 
                backgroundColor: '#d4edda', 
                border: '2px solid #28a745',
                borderRadius: '4px',
                padding: '1rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <strong style={{ color: '#155724' }}>✅ Correct Answer:</strong> 
                <span style={{ color: '#155724', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                  {(() => {
                    const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : 
                                        question.correct !== undefined ? question.correct :
                                        question.answer !== undefined ? question.answer : 'Not specified';
                    
                    if (typeof correctAnswer === 'number') {
                      return String.fromCharCode(65 + correctAnswer);
                    } else if (typeof correctAnswer === 'string') {
                      return correctAnswer;
                    } else {
                      return 'Not specified';
                    }
                  })()}
                </span>
              </CorrectAnswer>
            )}
            
            {question.explanation && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <strong style={{ color: '#856404' }}>💡 Explanation:</strong> 
                <span style={{ color: '#856404', marginLeft: '0.5rem' }}>
                  {question.explanation}
                </span>
              </div>
            )}
          </QuestionItem>
        ))}
        
        {!isExpanded && quiz.questions && null}
      </QuizCard>
    );
  };

  // Render course modules and content
  const renderCourseContent = () => {
    console.log('🔍 DEBUG - renderCourseContent called');
    console.log('🔍 DEBUG - courseContent:', courseContent);
    console.log('🔍 DEBUG - courseContent type:', typeof courseContent);
    console.log('🔍 DEBUG - courseContent modules:', courseContent?.modules);
    console.log('🔍 DEBUG - courseContent modules length:', courseContent?.modules?.length);
    console.log('🔍 DEBUG - courseContent description:', courseContent?.description);
    console.log('🔍 DEBUG - courseContent overview:', courseContent?.overview);
    
    if (!courseContent) {
      console.log('🔍 DEBUG - No course content found');
      return (
        <EmptyState>
          {loading ? 'Loading course content...' : 'No course content available'}
        </EmptyState>
      );
    }

    if (!courseContent.modules || courseContent.modules.length === 0) {
      console.log('🔍 DEBUG - No modules found in course content');
      return (
        <CourseContentSection>
          <SectionTitle>📚 Course Content Review</SectionTitle>
          <EmptyState>
            No modules found for this course. The instructor may not have created any modules yet.
          </EmptyState>
        </CourseContentSection>
      );
    }

    console.log('🔍 DEBUG - Rendering course content with modules:', courseContent.modules.length);
    
    return (
      <CourseContentSection>
        <SectionTitle>📚 Course Content Review</SectionTitle>
        
        {/* Course-Level Information */}
        {courseContent.instructorInfo && (
          <ModuleCard>
            <ModuleTitle>👨‍🏫 Instructor Information</ModuleTitle>
            <div style={{ marginBottom: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
              <strong>Name:</strong> {courseContent.instructorInfo.name}<br/>
              <strong>Email:</strong> {courseContent.instructorInfo.email || 'Not provided'}
            </div>
          </ModuleCard>
        )}

        {/* Course-Level Quizzes */}
        {courseContent.courseQuizzes && courseContent.courseQuizzes.length > 0 && (
          <ModuleCard>
            <ModuleTitle>❓ Course-Level Quizzes ({courseContent.courseQuizzes.length})</ModuleTitle>
            {courseContent.courseQuizzes.map((quiz, index) => renderQuiz(quiz, index))}
          </ModuleCard>
        )}

        {/* Course-Level Learning Outcomes */}
        {courseContent.courseLearningOutcomes && courseContent.courseLearningOutcomes.length > 0 && (
          <ModuleCard>
            <ModuleTitle>🎯 Course Learning Outcomes</ModuleTitle>
            {courseContent.courseLearningOutcomes.map((outcome, index) => (
              <ContentItem key={`outcome-${index}`}>
                <ContentItemTitle>
                  <ContentItemType>Learning Outcome</ContentItemType>
                  {outcome.title || `Outcome ${index + 1}`}
                </ContentItemTitle>
                <ContentItemData>
                  {outcome.description || outcome.content || 'No description provided'}
                </ContentItemData>
              </ContentItem>
            ))}
          </ModuleCard>
        )}

        {/* Course-Level Resources */}
        {courseContent.courseResources && courseContent.courseResources.length > 0 && (
          <ModuleCard>
            <ModuleTitle>📚 Course Resources</ModuleTitle>
            {courseContent.courseResources.map((resource, index) => (
              <ContentItem key={`resource-${index}`}>
                <ContentItemTitle>
                  <ContentItemType>Resource</ContentItemType>
                  {resource.title || resource.name || `Resource ${index + 1}`}
                </ContentItemTitle>
                <ContentItemData>
                  {resource.description && <><strong>Description:</strong> {resource.description}<br/></>}
                  {resource.url && <><strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a><br/></>}
                  {resource.type && <><strong>Type:</strong> {resource.type}</>}
                </ContentItemData>
              </ContentItem>
            ))}
          </ModuleCard>
        )}

        {/* Course-Level Assessments */}
        {courseContent.courseAssessments && courseContent.courseAssessments.length > 0 && (
          <ModuleCard>
            <ModuleTitle>📝 Course-Level Assessments</ModuleTitle>
            {courseContent.courseAssessments.map((assessment, index) => (
              <ContentItem key={`course-assessment-${index}`}>
                <ContentItemTitle>
                  <ContentItemType>Assessment</ContentItemType>
                  {assessment.title || `Assessment ${index + 1}`}
                </ContentItemTitle>
                <ContentItemData>
                  {assessment.description && <><strong>Description:</strong> {assessment.description}<br/></>}
                  {assessment.questions && <><strong>Questions:</strong> {assessment.questions.length}<br/></>}
                  {assessment.totalPoints && <><strong>Total Points:</strong> {assessment.totalPoints}<br/></>}
                  {assessment.duration && <><strong>Duration:</strong> {assessment.duration}</>}
                </ContentItemData>
              </ContentItem>
            ))}
          </ModuleCard>
        )}

        {/* Course-Level Discussions */}
        {courseContent.courseDiscussions && courseContent.courseDiscussions.length > 0 && (
          <ModuleCard>
            <ModuleTitle>💬 Course-Level Discussions</ModuleTitle>
            {courseContent.courseDiscussions.map((discussion, index) => (
              <ContentItem key={`course-discussion-${index}`}>
                <ContentItemTitle>
                  <ContentItemType>Discussion</ContentItemType>
                  {discussion.title || `Discussion ${index + 1}`}
                </ContentItemTitle>
                <ContentItemData>
                  {discussion.content && <><strong>Content:</strong> {discussion.content}<br/></>}
                  {discussion.category && <><strong>Category:</strong> {discussion.category}<br/></>}
                  {discussion.replies && <><strong>Replies:</strong> {discussion.replies.length}</>}
                </ContentItemData>
              </ContentItem>
            ))}
          </ModuleCard>
        )}
        
        {/* Module Content */}
        {courseContent.modules.map((module, moduleIndex) => {
          console.log(`🔍 DEBUG - Rendering module ${moduleIndex + 1}:`, module.title);
          console.log(`🔍 DEBUG - Module ${moduleIndex + 1} content items:`, module.content?.length || 0);
          console.log(`🔍 DEBUG - Module ${moduleIndex + 1} quizzes:`, module.quizzes?.length || 0);
          console.log(`🔍 DEBUG - Module ${moduleIndex + 1} assessments:`, module.assessments?.length || 0);
          console.log(`🔍 DEBUG - Module ${moduleIndex + 1} discussions:`, module.discussions?.length || 0);
          
          const moduleKey = `${module._id || moduleIndex}`;
          const isModuleExpanded = expandedModules[moduleKey];
          
          const toggleModule = () => {
            setExpandedModules(prev => ({
              ...prev,
              [moduleKey]: !prev[moduleKey]
            }));
          };
          
          const totalItems = (module.content?.length || 0) + 
                           (module.quizzes?.length || 0) + 
                           (module.assessments?.length || 0) + 
                           (module.discussions?.length || 0) + 
                           (module.learningOutcomes?.length || 0) + 
                           (module.resources?.length || 0) + 
                           (module.assignments?.length || 0);
          
          return (
            <ModuleCard key={moduleIndex}>
              <ModuleTitle 
                onClick={toggleModule}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  Module {moduleIndex + 1}: {module.title || `Module ${moduleIndex + 1}`}
                  <span style={{ fontSize: '0.8rem', color: '#6c757d', marginLeft: '1rem' }}>
                    ({totalItems} items)
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {isModuleExpanded ? '−' : '+'}
                </div>
              </ModuleTitle>
              
              {isModuleExpanded ? (
                <>
                  {module.description && (
                    <div style={{ marginBottom: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
                      {module.description}
                    </div>
                  )}

                  {/* Module Learning Outcomes */}
                  {module.learningOutcomes && module.learningOutcomes.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ color: '#007bff', marginBottom: '0.5rem' }}>🎯 Module Learning Outcomes:</h5>
                      {module.learningOutcomes.map((outcome, index) => (
                        <ContentItem key={`module-outcome-${index}`}>
                          <ContentItemTitle>
                            <ContentItemType>Learning Outcome</ContentItemType>
                            {outcome.title || `Outcome ${index + 1}`}
                          </ContentItemTitle>
                          <ContentItemData>
                            {outcome.description || outcome.content || 'No description provided'}
                          </ContentItemData>
                        </ContentItem>
                      ))}
                    </div>
                  )}

                  {/* Module Resources */}
                  {module.resources && module.resources.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ color: '#007bff', marginBottom: '0.5rem' }}>📚 Module Resources:</h5>
                      {module.resources.map((resource, index) => (
                        <ContentItem key={`module-resource-${index}`}>
                          <ContentItemTitle>
                            <ContentItemType>Resource</ContentItemType>
                            {resource.title || resource.name || `Resource ${index + 1}`}
                          </ContentItemTitle>
                          <ContentItemData>
                            {resource.description && <><strong>Description:</strong> {resource.description}<br/></>}
                            {resource.url && <><strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a><br/></>}
                            {resource.type && <><strong>Type:</strong> {resource.type}</>}
                          </ContentItemData>
                        </ContentItem>
                      ))}
                    </div>
                  )}

                  {/* Module Assignments */}
                  {module.assignments && module.assignments.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ color: '#007bff', marginBottom: '0.5rem' }}>📋 Module Assignments:</h5>
                      {module.assignments.map((assignment, index) => (
                        <ContentItem key={`module-assignment-${index}`}>
                          <ContentItemTitle>
                            <ContentItemType>Assignment</ContentItemType>
                            {assignment.title || `Assignment ${index + 1}`}
                          </ContentItemTitle>
                          <ContentItemData>
                            {assignment.description && <><strong>Description:</strong> {assignment.description}<br/></>}
                            {assignment.instructions && <><strong>Instructions:</strong> {assignment.instructions}<br/></>}
                            {assignment.dueDate && <><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}<br/></>}
                            {assignment.points && <><strong>Points:</strong> {assignment.points}</>}
                          </ContentItemData>
                        </ContentItem>
                      ))}
                    </div>
                  )}
                  
                  {/* Render content items */}
                  {module.content && module.content.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ color: '#007bff', marginBottom: '0.5rem' }}>📖 Module Content:</h5>
                      {module.content.map((contentItem, contentIndex) => 
                        renderContentItem(contentItem, contentIndex)
                      )}
                    </div>
                  )}
                  
                  {/* Render quizzes */}
                  {module.quizzes && module.quizzes.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ color: '#007bff', marginBottom: '0.5rem' }}>❓ Module Quizzes:</h5>
                      {module.quizzes.map((quiz, quizIndex) => 
                        renderQuiz(quiz, quizIndex)
                      )}
                    </div>
                  )}
                  
                  {/* Render assessments */}
                  {module.assessments && module.assessments.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ color: '#007bff', marginBottom: '0.5rem' }}>📝 Module Assessments:</h5>
                      {module.assessments.map((assessment, assessmentIndex) => (
                        <ContentItem key={`assessment-${assessmentIndex}`}>
                          <ContentItemTitle>
                            <ContentItemType>Assessment</ContentItemType>
                            {assessment.title || `Assessment ${assessmentIndex + 1}`}
                          </ContentItemTitle>
                          <ContentItemData>
                            {assessment.description && <><strong>Description:</strong> {assessment.description}<br/></>}
                            {assessment.questions && <><strong>Questions:</strong> {assessment.questions.length}<br/></>}
                            {assessment.totalPoints && <><strong>Total Points:</strong> {assessment.totalPoints}<br/></>}
                            {assessment.duration && <><strong>Duration:</strong> {assessment.duration}<br/></>}
                            {assessment.type && <><strong>Type:</strong> {assessment.type}</>}
                          </ContentItemData>
                        </ContentItem>
                      ))}
                    </div>
                  )}

                  {/* Render discussions */}
                  {module.discussions && module.discussions.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ color: '#007bff', marginBottom: '0.5rem' }}>💬 Module Discussions:</h5>
                      {module.discussions
                        .filter((discussion) => {
                          // Log all discussions for debugging
                          console.log('🔍 Discussion being filtered:', {
                            title: discussion.title,
                            content: discussion.content,
                            category: discussion.category
                          });
                          
                          // Filter out obvious placeholder content
                          const title = discussion.title || '';
                          const content = discussion.content || '';
                          
                          // Filter out placeholder patterns and very short content
                          const isPlaceholder = 
                            title.toLowerCase().includes('fsdgfsdgdg') || 
                            title.toLowerCase().includes('sfgsdgfsdgfsd') ||
                            content.toLowerCase().includes('fsdgfsdgdg') ||
                            content.toLowerCase().includes('sfgsdgfsdgfsd') ||
                            title.length < 3 ||
                            content.length < 3;
                          
                          return !isPlaceholder;
                        })
                        .map((discussion, discussionIndex) => (
                          <ContentItem key={`discussion-${discussionIndex}`}>
                            <ContentItemTitle>
                              <ContentItemType>Discussion #{discussionIndex + 1}</ContentItemType>
                              {discussion.title || `Discussion ${discussionIndex + 1}`}
                            </ContentItemTitle>
                            <ContentItemData>
                                                             {discussion.content && discussion.content.length > 2 && (
                                 <><strong>Topic:</strong> {discussion.content}</>
                               )}
                            </ContentItemData>
                          </ContentItem>
                        ))}
                    </div>
                  )}
                </>
              ) : null}
            </ModuleCard>
          );
        })}
      </CourseContentSection>
    );
  };

  // Render job content
  const renderJobContent = () => {
    if (!courseContent) {
      return (
        <EmptyState>
          {loading ? 'Loading job content...' : 'No job content available'}
        </EmptyState>
      );
    }

    return (
      <CourseContentSection>
        <SectionTitle>💼 Job Details Review</SectionTitle>
        
        {/* Employer Information */}
        {courseContent.employerInfo && (
          <ModuleCard>
            <ModuleTitle>👔 Employer Information</ModuleTitle>
            <div style={{ marginBottom: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
              {courseContent.employerInfo.name && courseContent.employerInfo.name !== 'Unknown' && (
                <><strong>Name:</strong> {courseContent.employerInfo.name}<br/></>
              )}
              {courseContent.employerInfo.email && courseContent.employerInfo.email !== 'Not provided' && (
                <><strong>Email:</strong> {courseContent.employerInfo.email}<br/></>
              )}
              {courseContent.employerInfo.companyName && courseContent.employerInfo.companyName !== 'Not provided' && (
                <><strong>Company:</strong> {courseContent.employerInfo.companyName}</>
              )}
            </div>
          </ModuleCard>
        )}


      </CourseContentSection>
    );
  };

  // Render scholarship content
  const renderScholarshipContent = () => {
    if (!courseContent) {
      return (
        <EmptyState>
          {loading ? 'Loading scholarship content...' : 'No scholarship content available'}
        </EmptyState>
      );
    }

    return (
      <CourseContentSection>
        <SectionTitle>🎓 Scholarship Details Review</SectionTitle>
        
        {/* Provider Information */}
        {courseContent.employerInfo && (
          <ModuleCard>
            <ModuleTitle>🏢 Provider Information</ModuleTitle>
            <div style={{ marginBottom: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
              {courseContent.employerInfo.name && courseContent.employerInfo.name !== 'Unknown' && (
                <><strong>Name:</strong> {courseContent.employerInfo.name}<br/></>
              )}
              {courseContent.employerInfo.email && courseContent.employerInfo.email !== 'Not provided' && (
                <><strong>Email:</strong> {courseContent.employerInfo.email}<br/></>
              )}
              {courseContent.employerInfo.companyName && courseContent.employerInfo.companyName !== 'Not provided' && (
                <><strong>Company:</strong> {courseContent.employerInfo.companyName}</>
              )}
            </div>
          </ModuleCard>
        )}


      </CourseContentSection>
    );
  };

  if (!item) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin/approvals')}>
          ← Back to Approvals
        </BackButton>
        <Title>{item.title}</Title>
      </Header>

            <DetailCard>
        <Badge>Pending Approval</Badge>

        {/* Course-specific fields */}
        {activeTab === 'courses' && (
          <>
            <DetailSection>
              <DetailLabel>Course Title:</DetailLabel>
              <DetailValue>{renderField(item.title)}</DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Category:</DetailLabel>
              <DetailValue>{renderField(item.category) || 'Not specified'}</DetailValue>
            </DetailSection>

            {/* Show instructor-created description only if it's not generic */}
            {courseContent?.description && 
             !courseContent.description.includes('JavaScript (JS) is a high-level') && 
             !courseContent.description.includes('World Wide Web') && (
              <DetailSection>
                <DetailLabel>Course Description:</DetailLabel>
                <DetailValue>{renderField(courseContent.description)}</DetailValue>
              </DetailSection>
            )}

            {item.level && (
              <DetailSection>
                <DetailLabel>Level:</DetailLabel>
                <DetailValue>{renderField(item.level)}</DetailValue>
              </DetailSection>
            )}

            {item.instructor && (
              <DetailSection>
                <DetailLabel>Instructor:</DetailLabel>
                <DetailValue>{renderField(item.instructor)}</DetailValue>
              </DetailSection>
            )}
          </>
        )}

        {/* Job-specific fields - Only show fields used in job creation form */}
        {activeTab === 'jobs' && (
          <>
            <DetailSection>
              <DetailLabel>Job Title:</DetailLabel>
              <DetailValue>{renderField(item.title)}</DetailValue>
            </DetailSection>

            {item.company && (
              <DetailSection>
                <DetailLabel>Company:</DetailLabel>
                <DetailValue>{renderField(item.company)}</DetailValue>
              </DetailSection>
            )}

            {item.location && (
              <DetailSection>
                <DetailLabel>Location:</DetailLabel>
                <DetailValue>{renderField(item.location)}</DetailValue>
              </DetailSection>
            )}

            {item.description && (
              <DetailSection>
                <DetailLabel>Description:</DetailLabel>
                <DetailValue>{renderField(item.description)}</DetailValue>
              </DetailSection>
            )}

            {item.required_skills && item.required_skills.length > 0 && (
              <DetailSection>
                <DetailLabel>Required Skills:</DetailLabel>
                <DetailValue>
                  {Array.isArray(item.required_skills) 
                    ? item.required_skills.join(', ')
                    : renderField(item.required_skills)
                  }
                </DetailValue>
              </DetailSection>
            )}

            {/* Show only the salary field that was actually used */}
            {item.salary && !item.salary_range && (
              <DetailSection>
                <DetailLabel>Salary:</DetailLabel>
                <DetailValue>{renderField(item.salary)}</DetailValue>
              </DetailSection>
            )}

            {item.salary_range && !item.salary && (
              <DetailSection>
                <DetailLabel>Salary Range:</DetailLabel>
                <DetailValue>{renderField(item.salary_range)}</DetailValue>
              </DetailSection>
            )}

            {item.job_type && (
              <DetailSection>
                <DetailLabel>Job Type:</DetailLabel>
                <DetailValue>{renderField(item.job_type)}</DetailValue>
              </DetailSection>
            )}

            {item.application_deadline && (
              <DetailSection>
                <DetailLabel>Application Deadline:</DetailLabel>
                <DetailValue>{new Date(item.application_deadline).toLocaleDateString()}</DetailValue>
              </DetailSection>
            )}

            {item.application_link && (
              <DetailSection>
                <DetailLabel>Application Link:</DetailLabel>
                <DetailValue>
                  <a href={item.application_link} target="_blank" rel="noopener noreferrer" style={{color: '#007bff'}}>
                    {item.application_link}
                  </a>
                </DetailValue>
              </DetailSection>
            )}
          </>
        )}

        {/* Scholarship-specific fields - Only show fields used in scholarship creation form */}
        {activeTab === 'scholarships' && (
          <>
            <DetailSection>
              <DetailLabel>Scholarship Title:</DetailLabel>
              <DetailValue>{renderField(item.title)}</DetailValue>
            </DetailSection>

            {item.description && (
              <DetailSection>
                <DetailLabel>Description:</DetailLabel>
                <DetailValue>{renderField(item.description)}</DetailValue>
              </DetailSection>
            )}

            {item.provider && (
              <DetailSection>
                <DetailLabel>Provider:</DetailLabel>
                <DetailValue>{renderField(item.provider)}</DetailValue>
              </DetailSection>
            )}

            {item.location && (
              <DetailSection>
                <DetailLabel>Location:</DetailLabel>
                <DetailValue>{renderField(item.location)}</DetailValue>
              </DetailSection>
            )}

            {item.benefits && (
              <DetailSection>
                <DetailLabel>Benefits:</DetailLabel>
                <DetailValue>{renderField(item.benefits)}</DetailValue>
              </DetailSection>
            )}

            {item.requirements && item.requirements.length > 0 && (
              <DetailSection>
                <DetailLabel>Requirements:</DetailLabel>
                <DetailValue>
                  {Array.isArray(item.requirements) 
                    ? item.requirements.join(', ')
                    : renderField(item.requirements)
                  }
                </DetailValue>
              </DetailSection>
            )}

            {item.deadline && (
              <DetailSection>
                <DetailLabel>Deadline:</DetailLabel>
                <DetailValue>{new Date(item.deadline).toLocaleDateString()}</DetailValue>
              </DetailSection>
            )}

            {item.link && (
              <DetailSection>
                <DetailLabel>Link:</DetailLabel>
                <DetailValue>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{color: '#007bff'}}>
                    {item.link}
                  </a>
                </DetailValue>
              </DetailSection>
            )}
          </>
        )}

        {/* Common fields for all types */}
        <DetailSection>
          <DetailLabel>Created:</DetailLabel>
          <DetailValue>{new Date(item.createdAt).toLocaleString()}</DetailValue>
        </DetailSection>

        <DetailSection>
          <DetailLabel>Status:</DetailLabel>
          <DetailValue>
            <span style={{ 
              color: item.approvalStatus === 'approved' ? 'green' : 
                     item.approvalStatus === 'rejected' ? 'red' : 'orange',
              fontWeight: 'bold'
            }}>
              {item.approvalStatus || 'pending'}
            </span>
          </DetailValue>
        </DetailSection>



        {/* Render complete course content for courses */}
        {activeTab === 'courses' && renderCourseContent()}
        {/* Render job content for jobs */}
        {activeTab === 'jobs' && renderJobContent()}
        {/* Render scholarship content for scholarships */}
        {activeTab === 'scholarships' && renderScholarshipContent()}
      </DetailCard>

      <ButtonGroup>
        <Button className="approve" onClick={handleApprove}>
          Approve
        </Button>
        <Button className="reject" onClick={handleReject}>
          Reject
        </Button>
      </ButtonGroup>
    </Container>
  );
  };
  
  export default ApprovalDetail; 