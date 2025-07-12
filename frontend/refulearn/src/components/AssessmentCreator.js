import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Delete, Add, RadioButtonChecked } from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const BLUE = '#007bff';
const WHITE = '#fff';

const AssessmentModal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${WHITE};
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: ${BLUE};
  margin-bottom: 1.5rem;
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

const Select = styled.select`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
`;

const QuestionCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${BLUE};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h4`
  color: #333;
  margin: 0;
`;

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const CorrectIndicator = styled.div`
  color: ${({ correct }) => correct ? '#4caf50' : '#ccc'};
  cursor: pointer;
`;

const Button = styled.button`
  background: ${({ color }) => color || BLUE};
  color: ${WHITE};
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export default function AssessmentCreator({ isOpen, onClose, onSave, assessment = null, isQuiz = false, returnUrl = null }) {
  const { token } = useUser();
  const navigate = useNavigate();
  
  // Debug logging for props
  if (isOpen) {
    console.log('🔍 AssessmentCreator opened with props:');
    console.log('  - returnUrl prop:', returnUrl);
    console.log('  - sessionStorage URL:', sessionStorage.getItem('quizEditReturnUrl'));
    console.log('  - assessment:', assessment ? { id: assessment._id, title: assessment.title } : null);
    console.log('  - isQuiz:', isQuiz);
  }
  const [assessmentData, setAssessmentData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 0,
    questions: [],
    timeLimit: 30
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1,
    explanation: ''
  });


    // Reset form when opening/closing or when assessment prop changes
  useEffect(() => {
    if (isOpen) {
      if (assessment) {
        // Editing existing assessment
        setAssessmentData({
          title: assessment.title || '',
          description: assessment.description || '',
          dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().slice(0, 16) : '',
          totalPoints: assessment.totalPoints || 0,
          questions: assessment.questions || [],
          timeLimit: assessment.timeLimit || 30
        });
      } else {
        // Creating new assessment - reset form
        setAssessmentData({
          title: '',
          description: '',
          dueDate: '',
          totalPoints: 0,
          questions: [],
          timeLimit: 30
        });
      }
      
      // Reset current question form
      setCurrentQuestion({
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1,
        explanation: ''
      });
    }
  }, [isOpen, assessment]);

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    // Validate based on question type
    if (currentQuestion.type === 'multiple-choice') {
      if (currentQuestion.options.some(opt => !opt.trim())) {
        alert('Please fill in all answer options');
        return;
      }
    } else if (currentQuestion.type === 'true-false') {
      // For true/false, ensure we have the correct answer selected
      if (currentQuestion.correctAnswer !== 0 && currentQuestion.correctAnswer !== 1) {
        alert('Please select True or False as the correct answer');
        return;
      }
    }
    // Short answer questions don't need additional validation
    
    const newQuestion = {
      ...currentQuestion,
      id: `q_${Date.now()}_${Math.random()}`
    };
    
    setAssessmentData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + currentQuestion.points
    }));
    
    // Reset current question form
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
      explanation: ''
    });
  };

  const removeQuestion = (index) => {
    const questionToRemove = assessmentData.questions[index];
    setAssessmentData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      totalPoints: prev.totalPoints - questionToRemove.points
    }));
  };

  const updateOption = (index, value) => {
    // For true/false questions, don't allow editing the options
    if (currentQuestion.type === 'true-false') {
      return;
    }
    
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleSave = async () => {
    if (!assessmentData.title.trim()) {
      alert('Please enter an assessment title');
      return;
    }
    
    if (isQuiz && assessmentData.questions.length === 0) {
      alert('Please add at least one question to the quiz');
      return;
    }
    
    // Prepare the data with moduleId included
    const dataToSave = {
      ...assessmentData,
      type: isQuiz ? 'quiz' : 'assessment'
    };
    
    try {
      console.log('🔍 Calling onSave with data:', dataToSave);
      console.log('🔍 Return URL in AssessmentCreator:', returnUrl);
      

      
      // Call onSave and wait for it to complete
      const result = await onSave(dataToSave, assessment);
      
      console.log('✅ Save completed successfully, result:', result);
      
      // Get the return URL (check both prop and sessionStorage)
      const urlToNavigate = returnUrl || sessionStorage.getItem('quizEditReturnUrl');
      
      console.log('🔍 Checking return URLs:');
      console.log('  - returnUrl prop:', returnUrl);
      console.log('  - sessionStorage:', sessionStorage.getItem('quizEditReturnUrl'));
      console.log('  - final URL to navigate:', urlToNavigate);
      
      // Debug: check if we have a return URL
      if (!urlToNavigate) {
        console.log(`⚠️ No return URL found. returnUrl prop = ${returnUrl}, sessionStorage = ${sessionStorage.getItem('quizEditReturnUrl')}`);
      }
      
      if (urlToNavigate) {
        console.log('🔙 REDIRECTING NOW to:', urlToNavigate);
        
        // Use window.location for immediate, reliable redirect
        window.location.href = urlToNavigate;
        
        // Clear the stored return URL
        sessionStorage.removeItem('quizEditReturnUrl');
        
        // Note: Code after window.location.href may not execute
        console.log('✅ Redirect initiated');
      } else {
        console.log('✅ Assessment saved successfully - closing modal');
        // Show success message without URL error
        const message = assessment ? 
          `${isQuiz ? 'Quiz' : 'Assessment'} updated successfully!` : 
          `${isQuiz ? 'Quiz' : 'Assessment'} created successfully!`;
        
        alert(message);
      }
      
      // Close the modal
      onClose();
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      alert(`Failed to save: ${error.message || 'Please try again.'}`);
      // Keep modal open on error so user can retry
    }
  };

  if (!isOpen) return null;



  return (
    <AssessmentModal>
      <ModalContent>
        <ModalTitle>
          {assessment ? 
            (isQuiz ? 'Edit Quiz' : 'Edit Assessment') : 
            (isQuiz ? 'Create Quiz' : 'Create Assessment')
          }
        </ModalTitle>
        
                  <Label>{isQuiz ? 'Quiz' : 'Assessment'} Title</Label>
          <Input
            value={assessmentData.title}
            onChange={e => setAssessmentData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={`Enter ${isQuiz ? 'quiz' : 'assessment'} title`}
          />
        
        <Label>Description</Label>
                  <TextArea
            value={assessmentData.description}
            onChange={e => setAssessmentData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={`Enter ${isQuiz ? 'quiz' : 'assessment'} description`}
            rows="3"
          />



        <Label>Due Date</Label>
        <Input
          type="datetime-local"
          value={assessmentData.dueDate}
          onChange={e => setAssessmentData(prev => ({ ...prev, dueDate: e.target.value }))}
        />
        
        {isQuiz && (
          <>
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              value={assessmentData.timeLimit}
              onChange={e => setAssessmentData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
              min="1"
              placeholder="Enter time limit in minutes"
            />
          </>
        )}
        
        <Label>Total Points: {assessmentData.totalPoints}</Label>
        {!isQuiz && (
        <Input
          type="number"
          value={assessmentData.totalPoints}
          onChange={e => setAssessmentData(prev => ({ ...prev, totalPoints: parseInt(e.target.value) || 0 }))}
          min="0"
          placeholder="Enter total points for this assessment"
        />
        )}

        {/* Question Creation Section */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ color: BLUE, marginBottom: '1rem' }}>
            {isQuiz ? 'Add Quiz Questions' : 'Add Questions'}
          </h3>
          
          {isQuiz && (
            <>
              <Label>Question Type</Label>
              <Select
                value={currentQuestion.type}
                onChange={e => setCurrentQuestion(prev => ({ 
                  ...prev, 
                  type: e.target.value,
                  // Reset options and correct answer when changing type
                  options: e.target.value === 'true-false' ? ['True', 'False'] : ['', '', '', ''],
                  correctAnswer: 0
                }))}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
              </Select>
            </>
          )}
          
          <Label>Question</Label>
          <TextArea
            value={currentQuestion.question}
            onChange={e => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
            placeholder={
              isQuiz ? 
                (currentQuestion.type === 'multiple-choice' ? 'Enter your multiple choice question' :
                 currentQuestion.type === 'true-false' ? 'Enter your true/false question' :
                 'Enter your short answer question') : 
                'Enter your question'
            }
            rows="2"
          />
          
          {/* Answer Options for Multiple Choice */}
          {isQuiz && currentQuestion.type === 'multiple-choice' && (
            <>
              <Label>Answer Options</Label>
              {currentQuestion.options.map((option, index) => (
                <OptionContainer key={index}>
                  <CorrectIndicator
                    correct={currentQuestion.correctAnswer === index}
                    onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                  >
                    <RadioButtonChecked />
                  </CorrectIndicator>
                  <OptionInput
                    value={option}
                    onChange={e => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                </OptionContainer>
              ))}
            </>
          )}
          
          {/* Answer Options for True/False */}
          {isQuiz && currentQuestion.type === 'true-false' && (
            <>
              <Label>Select the Correct Answer</Label>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CorrectIndicator
                    correct={currentQuestion.correctAnswer === 0}
                    onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 0 }))}
                  >
                    <RadioButtonChecked />
                  </CorrectIndicator>
                  <span>True</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CorrectIndicator
                    correct={currentQuestion.correctAnswer === 1}
                    onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 1 }))}
                  >
                    <RadioButtonChecked />
                  </CorrectIndicator>
                  <span>False</span>
                </div>
              </div>
            </>
          )}
          
          {/* Answer Guidelines for Short Answer */}
          {isQuiz && currentQuestion.type === 'short-answer' && (
            <>
              <Label>Answer Guidelines (optional)</Label>
              <TextArea
                value={currentQuestion.explanation}
                onChange={e => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Provide sample answers or grading criteria for this short answer question"
                rows="2"
              />
            </>
          )}
          
          {/* Explanation for Multiple Choice and True/False */}
          {isQuiz && (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') && (
            <>
              <Label>Explanation (optional)</Label>
              <TextArea
                value={currentQuestion.explanation}
                onChange={e => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer"
                rows="2"
              />
            </>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <Label style={{ margin: 0 }}>Points:</Label>
            <Input
              type="number"
              value={currentQuestion.points}
              onChange={e => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
              min="1"
              style={{ width: '80px' }}
            />
            <Button onClick={addQuestion} color="#28a745">
              Add Question
            </Button>
          </div>
        </div>

        {/* Display Added Questions */}
        {assessmentData.questions.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: BLUE, marginBottom: '1rem' }}>
              Questions ({assessmentData.questions.length})
            </h3>
            
            {assessmentData.questions.map((question, index) => (
              <QuestionCard key={question.id || index}>
                <QuestionHeader>
                  <QuestionTitle>Q{index + 1}: {question.question}</QuestionTitle>
                  <DeleteButton onClick={() => removeQuestion(index)}>
                    <Delete fontSize="small" />
                  </DeleteButton>
                </QuestionHeader>
                
                {isQuiz && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#666', 
                      marginBottom: '1rem',
                      fontWeight: 'bold'
                    }}>
                      Type: {question.type === 'multiple-choice' ? 'Multiple Choice' : 
                             question.type === 'true-false' ? 'True/False' : 'Short Answer'}
                    </div>
                    
                    {/* Multiple Choice Options */}
                    {question.type === 'multiple-choice' && question.options.map((option, optIndex) => (
                      <div key={optIndex} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        padding: '0.5rem',
                        background: question.correctAnswer === optIndex ? '#e8f5e8' : '#fff',
                        borderRadius: '4px',
                        border: question.correctAnswer === optIndex ? '2px solid #4caf50' : '1px solid #ddd'
                      }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: question.correctAnswer === optIndex ? '#4caf50' : '#ccc',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem'
                        }}>
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{option}</span>
                      </div>
                    ))}
                    
                    {/* True/False Options */}
                    {question.type === 'true-false' && (
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.5rem',
                          background: question.correctAnswer === 0 ? '#e8f5e8' : '#fff',
                          borderRadius: '4px',
                          border: question.correctAnswer === 0 ? '2px solid #4caf50' : '1px solid #ddd'
                        }}>
                          <span style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            background: question.correctAnswer === 0 ? '#4caf50' : '#ccc',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                          }}>
                            T
                          </span>
                          <span>True</span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.5rem',
                          background: question.correctAnswer === 1 ? '#e8f5e8' : '#fff',
                          borderRadius: '4px',
                          border: question.correctAnswer === 1 ? '2px solid #4caf50' : '1px solid #ddd'
                        }}>
                          <span style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            background: question.correctAnswer === 1 ? '#4caf50' : '#ccc',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                          }}>
                            F
                          </span>
                          <span>False</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Short Answer Info */}
                    {question.type === 'short-answer' && (
                      <div style={{ 
                        padding: '0.5rem', 
                        background: '#fff3cd', 
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        marginBottom: '1rem'
                      }}>
                        <strong>Answer Type:</strong> Text input (manual grading required)
                      </div>
                    )}
                    
                    {/* Explanation */}
                    {question.explanation && (
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.5rem', 
                        background: '#e3f2fd', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        <strong>
                          {question.type === 'short-answer' ? 'Answer Guidelines:' : 'Explanation:'}
                        </strong> {question.explanation}
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.9rem', 
                  color: '#666' 
                }}>
                  Points: {question.points}
                </div>
              </QuestionCard>
            ))}
          </div>
        )}
        
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button color="#6c757d" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>
              {assessment ? 
                (isQuiz ? 'Update Quiz' : 'Update Assessment') : 
                (isQuiz ? 'Save Quiz' : 'Save Assessment')
              }
            </Button>
          </div>
      </ModalContent>
    </AssessmentModal>
  );
} 