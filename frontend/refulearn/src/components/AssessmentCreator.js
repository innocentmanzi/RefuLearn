import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Delete, Add, RadioButtonChecked, Edit } from '@mui/icons-material';
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
  margin-left: 0.5rem;
`;

const EditButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
`;

const QuestionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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
    courseId: '',
    moduleId: '',
    dueDate: '',
    totalPoints: 0,
    questions: [],
    timeLimit: 30
  });

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1,
    explanation: ''
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);


    // Reset form when opening/closing or when assessment prop changes
  useEffect(() => {
    if (isOpen) {
      if (assessment) {
        // Editing existing assessment
        setAssessmentData({
          title: assessment.title || '',
          description: assessment.description || '',
          courseId: assessment.courseId || assessment.course || '',
          moduleId: assessment.moduleId || '',
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
          courseId: '',
          moduleId: '',
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
      
      // Reset editing state
      setEditingQuestionIndex(null);
    }
  }, [isOpen, assessment]);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch('/api/instructor/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data?.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch modules for a course
  const fetchModules = async (courseId) => {
    if (!courseId) {
      setModules([]);
      return;
    }

    try {
      setLoadingModules(true);
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data.data?.course?.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoadingModules(false);
    }
  };

  // Load courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Load modules when course changes
  useEffect(() => {
    if (assessmentData.courseId) {
      fetchModules(assessmentData.courseId);
    } else {
      setModules([]);
    }
  }, [assessmentData.courseId]);

  // Add validation function for quiz questions
  const validateQuizQuestion = (question) => {
    if (!question || !question.question) return { valid: false, error: 'Question text is required' };
    
    const questionText = question.question.trim();
    
    // Very basic validation - just ensure it's not empty and has some content
    if (questionText.length === 0) {
      return { valid: false, error: 'Question text cannot be empty' };
    }
    
    if (questionText.length < 3) {
      return { valid: false, error: 'Question text should be at least 3 characters long' };
    }
    
    // Only reject extremely obvious test data patterns
    const obviousTestPatterns = [
      /^test$/i,
      /^abc$/i,
      /^123$/i,
      /^xxx+$/i,
    ];
    
    if (obviousTestPatterns.some(pattern => pattern.test(questionText))) {
      return { valid: false, error: `Please provide a meaningful question instead of "${question.question}"` };
    }
    
    // Validate options for multiple choice questions
    if (question.type === 'multiple-choice' || question.type === 'multiple_choice') {
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        return { valid: false, error: 'Multiple choice questions must have at least 2 options' };
      }
      
      // Basic validation for options - just ensure they're not empty
      const emptyOptions = question.options.filter((option) => {
        return !option || option.trim().length === 0;
      });
      
      if (emptyOptions.length > 0) {
        return { valid: false, error: 'All answer options must have content' };
      }
    }
    
    return { valid: true };
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    // Validate the question
    const questionValidation = validateQuizQuestion(currentQuestion);
    if (!questionValidation.valid) {
      alert(`Invalid Question: ${questionValidation.error}`);
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

  const startEditingQuestion = (index) => {
    const questionToEdit = assessmentData.questions[index];
    setCurrentQuestion({
      question: questionToEdit.question,
      type: questionToEdit.type,
      options: questionToEdit.options || ['', '', '', ''],
      correctAnswer: questionToEdit.correctAnswer,
      points: questionToEdit.points,
      explanation: questionToEdit.explanation || ''
    });
    setEditingQuestionIndex(index);
  };

  const saveEditedQuestion = () => {
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
      if (currentQuestion.correctAnswer !== 0 && currentQuestion.correctAnswer !== 1) {
        alert('Please select True or False as the correct answer');
        return;
      }
    }
    
    const oldQuestion = assessmentData.questions[editingQuestionIndex];
    const updatedQuestion = {
      ...currentQuestion,
      id: oldQuestion.id || `q_${Date.now()}_${Math.random()}`
    };
    
    setAssessmentData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[editingQuestionIndex] = updatedQuestion;
      
      // Update total points
      const pointsDifference = currentQuestion.points - oldQuestion.points;
      
      return {
        ...prev,
        questions: newQuestions,
        totalPoints: prev.totalPoints + pointsDifference
      };
    });
    
    // Reset form and editing state
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
      explanation: ''
    });
    setEditingQuestionIndex(null);
  };

  const cancelEditing = () => {
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
      explanation: ''
    });
    setEditingQuestionIndex(null);
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
        
        // Success message - no alert needed
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

        <Label>Course</Label>
        <Select
          value={assessmentData.courseId}
          onChange={e => setAssessmentData(prev => ({ 
            ...prev, 
            courseId: e.target.value,
            moduleId: '' // Reset module when course changes
          }))}
          disabled={loadingCourses}
        >
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </Select>

        <Label>Module</Label>
        <Select
          value={assessmentData.moduleId}
          onChange={e => setAssessmentData(prev => ({ ...prev, moduleId: e.target.value }))}
          disabled={!assessmentData.courseId || loadingModules}
        >
          <option value="">Select a module</option>
          {modules.map(module => (
            <option key={module._id} value={module._id}>
              {module.title}
            </option>
          ))}
        </Select>



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
            {editingQuestionIndex !== null ? 
              (isQuiz ? 'Edit Quiz Question' : 'Edit Question') : 
              (isQuiz ? 'Add Quiz Questions' : 'Add Questions')}
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
                  correctAnswer: e.target.value === 'short-answer' ? '' : 0
                }))}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
              </Select>
            </>
          )}
          
          {/* Add helpful guidance */}
          <div style={{
            background: '#e3f2fd',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #bbdefb'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
              💡 Tips for Creating Good Quiz Questions:
            </h4>
            <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#1976d2' }}>
              <li>Use clear, specific question words (What, How, When, Where, Why, Which)</li>
              <li>Avoid test data like "test123", "asdf", or random letters</li>
              <li>Questions should be at least 10 characters and contain 3+ words</li>
              <li>For multiple choice: provide meaningful, distinct answer options</li>
              <li>Example: "What is the capital of France?" instead of "gfdgds"</li>
            </ul>
          </div>
          
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
          
          {/* Correct Answer for Short Answer */}
          {isQuiz && currentQuestion.type === 'short-answer' && (
            <>
              <Label>Expected Answer</Label>
              <Input
                value={currentQuestion.correctAnswer || ''}
                onChange={e => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                placeholder="Enter the expected correct answer"
              />
              
              <Label>Answer Guidelines (optional)</Label>
              <TextArea
                value={currentQuestion.explanation}
                onChange={e => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Provide additional grading criteria or alternative acceptable answers"
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
          
          {/* Show type-specific guidance */}
          {currentQuestion.type === 'multiple-choice' && (
            <div style={{
              background: '#f3e5f5',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#7b1fa2'
            }}>
              <strong>Multiple Choice Tips:</strong> Provide 4 clear, distinct answer options. Make sure only one is correct and avoid similar-sounding options.
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div style={{
              background: '#e8f5e9',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#2e7d32'
            }}>
              <strong>True/False Tips:</strong> Create clear statements that are definitively true or false. Avoid ambiguous statements.
            </div>
          )}

          {currentQuestion.type === 'short-answer' && (
            <div style={{
              background: '#fff3e0',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#f57c00'
            }}>
              <strong>Short Answer Tips:</strong> Ask for specific information that can be answered in a few words or sentences. Provide the expected answer for grading reference.
            </div>
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
            {editingQuestionIndex !== null ? (
              <>
                <Button onClick={saveEditedQuestion} color="#28a745">
                  Save Changes
                </Button>
                <Button onClick={cancelEditing} color="#6c757d">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={addQuestion} color="#28a745">
                Add Question
              </Button>
            )}
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
                  <QuestionButtons>
                    <EditButton onClick={() => startEditingQuestion(index)}>
                      <Edit fontSize="small" />
                    </EditButton>
                    <DeleteButton onClick={() => removeQuestion(index)}>
                      <Delete fontSize="small" />
                    </DeleteButton>
                  </QuestionButtons>
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
                        background: question.correctAnswer ? '#e8f5e8' : '#fff3cd', 
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        border: question.correctAnswer ? '2px solid #4caf50' : '1px solid #ffc107'
                      }}>
                        <strong>✓ Correct Answer:</strong> {question.correctAnswer || 'No correct answer set'}
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