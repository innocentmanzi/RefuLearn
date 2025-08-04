import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';
import offlineIntegrationService from '../services/offlineIntegrationService';

const AssessmentContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 1rem 0;
`;

const AssessmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const AssessmentCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const AssessmentTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const AssessmentDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const AssessmentDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const AssessmentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.completed {
    background: #ffc107;
    color: #000;
    cursor: not-allowed;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.completed {
    background: #d4edda;
    color: #155724;
  }
  
  &.in-progress {
    background: #fff3cd;
    color: #856404;
  }
  
  &.offline {
    background: #f8d7da;
    color: #721c24;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AssessmentModal = styled.div`
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
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`;

const QuestionTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #333;
`;

const QuestionOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const OptionInput = styled.input`
  margin: 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #007bff;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const TimerDisplay = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
  color: #856404;
`;

const ResultsContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const ScoreDisplay = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const ScoreValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.score >= 70 ? '#28a745' : '#dc3545'};
`;

const ScoreLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

const OfflineAssessmentSystem = () => {
  const { user } = useUser();
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [processing, setProcessing] = useState(new Set());
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchTerm, activeFilter]);

  useEffect(() => {
    let timer;
    if (timeRemaining > 0 && showAssessmentModal && !showResults) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining, showAssessmentModal, showResults]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const assessmentsData = await offlineIntegrationService.getOfflineAssessments(user?.id);
      setAssessments(assessmentsData || []);
    } catch (error) {
      console.error('❌ Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    let filtered = assessments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'completed':
        filtered = filtered.filter(assessment => assessment.completed);
        break;
      case 'in-progress':
        filtered = filtered.filter(assessment => assessment.inProgress);
        break;
      case 'offline':
        filtered = filtered.filter(assessment => assessment.isOfflineCreated);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredAssessments(filtered);
  };

  const handleStartAssessment = async (assessment) => {
    try {
      setProcessing(prev => new Set(prev).add(assessment.id));
      
      const attempt = await offlineIntegrationService.takeAssessment(assessment.id);
      
      setSelectedAssessment(assessment);
      setCurrentAttempt(attempt);
      setCurrentQuestion(0);
      setAnswers({});
      setTimeRemaining(assessment.duration * 60); // Convert minutes to seconds
      setShowResults(false);
      setShowAssessmentModal(true);
      
      console.log('✅ Assessment started');
    } catch (error) {
      console.error('❌ Failed to start assessment:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(assessment.id);
        return newSet;
      });
    }
  };

  const handleSubmitAssessment = async () => {
    if (!currentAttempt) return;
    
    try {
      setProcessing(prev => new Set(prev).add('submit'));
      
      const answersArray = Object.entries(answers || {}).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer
      }));
      
      const result = await offlineIntegrationService.submitAssessment(currentAttempt.id, answersArray);
      
      setResults(result);
      setShowResults(true);
      
      // Update assessment in state
      setAssessments(prev => prev.map(assessment =>
        assessment.id === selectedAssessment.id
          ? { ...assessment, completed: true, score: result.score }
          : assessment
      ));
      
      console.log('✅ Assessment submitted');
    } catch (error) {
      console.error('❌ Failed to submit assessment:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete('submit');
        return newSet;
      });
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (selectedAssessment?.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleViewResults = (assessment) => {
    // Load and display results
    console.log('Viewing results for:', assessment.title);
  };

  const getAssessmentStatus = (assessment) => {
    if (assessment.completed) return 'completed';
    if (assessment.inProgress) return 'in-progress';
    if (assessment.isOfflineCreated) return 'offline';
    return null;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'offline': return 'Offline';
      default: return '';
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  };

  const calculateProgress = () => {
    if (!selectedAssessment?.questions) return 0;
    return ((currentQuestion + 1) / selectedAssessment.questions.length) * 100;
  };

  if (loading) {
    return (
      <AssessmentContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          Loading assessments...
        </div>
      </AssessmentContainer>
    );
  }

  return (
    <>
      <AssessmentContainer>
        <h2>Assessment System</h2>
        
        <SearchBar
          type="text"
          placeholder="Search assessments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterButtons>
          <FilterButton
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            All Assessments
          </FilterButton>
          <FilterButton
            active={activeFilter === 'completed'}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </FilterButton>
          <FilterButton
            active={activeFilter === 'in-progress'}
            onClick={() => setActiveFilter('in-progress')}
          >
            In Progress
          </FilterButton>
          <FilterButton
            active={activeFilter === 'offline'}
            onClick={() => setActiveFilter('offline')}
          >
            Offline
          </FilterButton>
        </FilterButtons>

        {filteredAssessments.length === 0 ? (
          <EmptyState>
            <p>No assessments found matching your criteria.</p>
          </EmptyState>
        ) : (
          <AssessmentGrid>
            {filteredAssessments.map((assessment) => {
              const status = getAssessmentStatus(assessment);
              const isProcessing = processing.has(assessment.id);
              
              return (
                <AssessmentCard key={assessment.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <AssessmentTitle>{assessment.title || 'Untitled Assessment'}</AssessmentTitle>
                    {status && (
                      <StatusBadge className={status}>
                        {getStatusText(status)}
                      </StatusBadge>
                    )}
                  </div>
                  
                  <AssessmentDescription>
                    {assessment.description || 'No description available'}
                  </AssessmentDescription>
                  
                  <AssessmentDetails>
                    <DetailItem>
                      <DetailLabel>Duration</DetailLabel>
                      <DetailValue>{assessment.duration || 0} minutes</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Questions</DetailLabel>
                      <DetailValue>{assessment.questions?.length || 0}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Passing Score</DetailLabel>
                      <DetailValue>{assessment.passingScore || 70}%</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Due Date</DetailLabel>
                      <DetailValue>{formatDate(assessment.dueDate)}</DetailValue>
                    </DetailItem>
                  </AssessmentDetails>
                  
                  {assessment.score && (
                    <div style={{ marginBottom: '1rem' }}>
                      <DetailLabel>Your Score</DetailLabel>
                      <DetailValue style={{ 
                        color: assessment.score >= (assessment.passingScore || 70) ? '#28a745' : '#dc3545',
                        fontSize: '1.2rem'
                      }}>
                        {assessment.score}%
                      </DetailValue>
                    </div>
                  )}
                  
                  <AssessmentActions>
                    {!assessment.completed ? (
                      <ActionButton
                        className="primary"
                        onClick={() => handleStartAssessment(assessment)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <LoadingSpinner /> : ''}
                        {assessment.inProgress ? 'Continue' : 'Start'}
                      </ActionButton>
                    ) : (
                      <ActionButton
                        className="success"
                        onClick={() => handleViewResults(assessment)}
                      >
                        View Results
                      </ActionButton>
                    )}
                  </AssessmentActions>
                </AssessmentCard>
              );
            })}
          </AssessmentGrid>
        )}
      </AssessmentContainer>

      {/* Assessment Modal */}
      {showAssessmentModal && selectedAssessment && (
        <AssessmentModal>
          <ModalContent>
            <ModalHeader>
              <h3>{selectedAssessment.title}</h3>
              <CloseButton onClick={() => setShowAssessmentModal(false)}>×</CloseButton>
            </ModalHeader>
            
            {showResults ? (
              <ResultsContainer>
                <h4>Assessment Results</h4>
                <ScoreDisplay>
                  <ScoreValue score={results?.score?.percentage || 0}>
                    {results?.score?.percentage || 0}%
                  </ScoreValue>
                  <ScoreLabel>
                    {results?.score?.score || 0} out of {results?.score?.totalQuestions || 0} questions correct
                  </ScoreLabel>
                </ScoreDisplay>
                
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <ActionButton
                    className="primary"
                    onClick={() => setShowAssessmentModal(false)}
                  >
                    Close
                  </ActionButton>
                </div>
              </ResultsContainer>
            ) : (
              <>
                <TimerDisplay>
                  Time Remaining: {formatTime(timeRemaining)}
                </TimerDisplay>
                
                <ProgressBar>
                  <ProgressFill progress={calculateProgress()} />
                </ProgressBar>
                
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  Question {currentQuestion + 1} of {selectedAssessment.questions?.length || 0}
                </div>
                
                {selectedAssessment.questions && selectedAssessment.questions[currentQuestion] && (
                  <QuestionContainer>
                    <QuestionTitle>
                      {selectedAssessment.questions[currentQuestion].question}
                    </QuestionTitle>
                    
                    <QuestionOptions>
                      {selectedAssessment.questions[currentQuestion].options?.map((option, index) => (
                        <OptionLabel key={index}>
                          <OptionInput
                            type="radio"
                            name={`question_${currentQuestion}`}
                            value={option}
                            checked={answers[currentQuestion] === option}
                            onChange={() => handleAnswerChange(currentQuestion, option)}
                          />
                          {option}
                        </OptionLabel>
                      ))}
                    </QuestionOptions>
                  </QuestionContainer>
                )}
                
                <AssessmentActions>
                  <ActionButton
                    className="secondary"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </ActionButton>
                  
                  {currentQuestion < (selectedAssessment.questions?.length || 0) - 1 ? (
                    <ActionButton
                      className="primary"
                      onClick={handleNextQuestion}
                    >
                      Next
                    </ActionButton>
                  ) : (
                    <ActionButton
                      className="success"
                      onClick={handleSubmitAssessment}
                      disabled={processing.has('submit')}
                    >
                      {processing.has('submit') ? <LoadingSpinner /> : ''}
                      Submit
                    </ActionButton>
                  )}
                </AssessmentActions>
              </>
            )}
          </ModalContent>
        </AssessmentModal>
      )}
    </>
  );
};

export default OfflineAssessmentSystem; 