import React, { useState } from 'react';
import styled from 'styled-components';

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

const AssessmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AssessmentCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 2fr 3fr 1.5fr;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const AssessmentHeader = styled(AssessmentCard)`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: bold;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const AssessmentInfo = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.primary};
  }
  p {
    margin: 0;
    color: #666;
  }

  @media (max-width: 768px) {
    h3::before {
      content: 'Title: ';
      font-weight: bold;
      display: inline-block;
      width: 90px;
    }
    p::before {
      content: 'Description: ';
      font-weight: bold;
      display: inline-block;
      width: 90px;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  background: ${({ color, theme }) => color || theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &.delete {
    background: ${({ theme }) => theme.colors.danger || '#e74c3c'};
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  position: relative;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const QuestionBox = styled.div`
  background: #f7f7f7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const OptionInput = styled.input`
  width: 90%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
`;

const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  z-index: 2;
  border-top: 1px solid #eee;
`;

const initialAssessments = [
  { id: 1, title: 'Quiz 1', description: 'Basic programming concepts.' },
  { id: 2, title: 'Midterm Exam', description: 'Covers all topics up to week 6.' },
  { id: 3, title: 'Final Project', description: 'Build a web application.' },
];

const initialCourses = [
  { id: 1, title: 'Intro to Programming' },
  { id: 2, title: 'Web Development' },
  { id: 3, title: 'Data Analysis' },
];

const Assessments = () => {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentAssessment, setCurrentAssessment] = useState({ id: null, title: '', description: '' });
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderAssessment, setBuilderAssessment] = useState({
    id: null,
    title: '',
    description: '',
    courseId: '',
    module: '',
    timeLimit: '',
    passingScore: '',
    questions: [],
  });
  const [courses] = useState(initialCourses);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentAssessment({ id: null, title: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (assessment) => {
    setModalMode('edit');
    setCurrentAssessment(assessment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setCurrentAssessment({ ...currentAssessment, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      setAssessments([
        ...assessments,
        { ...currentAssessment, id: Date.now() },
      ]);
    } else {
      setAssessments(assessments.map(a => a.id === currentAssessment.id ? currentAssessment : a));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setAssessments(assessments.filter(a => a.id !== id));
  };

  const openBuilder = (assessment) => {
    setBuilderAssessment({
      ...assessment,
      questions: assessment.questions || [],
      courseId: assessment.courseId || '',
      module: assessment.module || '',
      timeLimit: assessment.timeLimit || '',
      passingScore: assessment.passingScore || '',
    });
    setShowBuilder(true);
  };

  const closeBuilder = () => setShowBuilder(false);

  const handleBuilderChange = (e) => {
    setBuilderAssessment({ ...builderAssessment, [e.target.name]: e.target.value });
  };

  const handleAddQuestion = (type) => {
    setBuilderAssessment({
      ...builderAssessment,
      questions: [
        ...builderAssessment.questions,
        type === 'mcq'
          ? { type: 'mcq', text: '', options: ['', ''], correct: 0, explanation: '' }
          : type === 'short'
          ? { type: 'short', text: '', explanation: '' }
          : { type: 'file', text: '', explanation: '' },
      ],
    });
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const newQuestions = [...builderAssessment.questions];
    newQuestions[qIdx][field] = value;
    setBuilderAssessment({ ...builderAssessment, questions: newQuestions });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const newQuestions = [...builderAssessment.questions];
    newQuestions[qIdx].options[oIdx] = value;
    setBuilderAssessment({ ...builderAssessment, questions: newQuestions });
  };

  const handleAddOption = (qIdx) => {
    const newQuestions = [...builderAssessment.questions];
    newQuestions[qIdx].options.push('');
    setBuilderAssessment({ ...builderAssessment, questions: newQuestions });
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    const newQuestions = [...builderAssessment.questions];
    newQuestions[qIdx].options.splice(oIdx, 1);
    setBuilderAssessment({ ...builderAssessment, questions: newQuestions });
  };

  const handleRemoveQuestion = (idx) => {
    const newQuestions = [...builderAssessment.questions];
    newQuestions.splice(idx, 1);
    setBuilderAssessment({ ...builderAssessment, questions: newQuestions });
  };

  const handleSaveBuilder = () => {
    // In a real app, you'd save this to your backend/database
    console.log('Saving assessment:', builderAssessment);
    const updatedAssessment = { ...currentAssessment, ...builderAssessment };
    setAssessments(assessments.map(a => a.id === builderAssessment.id ? updatedAssessment : a));
    closeBuilder();
  };

  return (
    <Container>
      <Title>Manage Assessments</Title>
      <AddButton onClick={openAddModal}>+ Add New Assessment</AddButton>

      <AssessmentList>
        <AssessmentHeader>
          <div>Title</div>
          <div>Description</div>
          <div>Actions</div>
        </AssessmentHeader>
        {assessments.map(assessment => (
          <AssessmentCard key={assessment.id}>
            <AssessmentInfo>
              <h3>{assessment.title}</h3>
            </AssessmentInfo>
            <AssessmentInfo>
              <p>{assessment.description}</p>
            </AssessmentInfo>
            <ActionButtons>
              <ActionButton onClick={() => openBuilder(assessment)}>View/Edit</ActionButton>
              <ActionButton 
                className="delete" 
                onClick={() => handleDelete(assessment.id)}
              >
                Delete
              </ActionButton>
            </ActionButtons>
          </AssessmentCard>
        ))}
      </AssessmentList>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{modalMode === 'add' ? 'Add' : 'Edit'} Assessment</ModalTitle>
            <Input
              name="title"
              placeholder="Assessment Title"
              value={currentAssessment.title}
              onChange={handleInputChange}
            />
            <Input
              name="description"
              placeholder="Description"
              value={currentAssessment.description}
              onChange={handleInputChange}
            />
            <ModalActions>
              <ActionButton onClick={handleSave}>Save</ActionButton>
              <ActionButton onClick={closeModal} color="#aaa">Cancel</ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {showBuilder && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Assessment Builder: {builderAssessment.title}</ModalTitle>
            
            <Label htmlFor="courseId">Course:</Label>
            <Select 
              id="courseId"
              name="courseId" 
              value={builderAssessment.courseId} 
              onChange={handleBuilderChange}
            >
              <option value="">Select a Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </Select>

            <Label htmlFor="module">Module:</Label>
            <Input 
              id="module"
              name="module" 
              placeholder="e.g., Module 1"
              value={builderAssessment.module} 
              onChange={handleBuilderChange} 
            />
            
            {/* ... more builder fields ... */}

            <Label>Questions:</Label>
            {builderAssessment.questions.map((q, qIdx) => (
              <QuestionBox key={qIdx}>
                {/* ... question rendering logic ... */}
              </QuestionBox>
            ))}
            
            <ModalActions>
              <ActionButton onClick={() => handleAddQuestion('mcq')}>Add MCQ</ActionButton>
              <ActionButton onClick={() => handleAddQuestion('short')}>Add Short Answer</ActionButton>
              <ActionButton onClick={() => handleAddQuestion('file')}>Add File Upload</ActionButton>
            </ModalActions>
            
            <StickyFooter>
              <ActionButton onClick={handleSaveBuilder}>Save Assessment</ActionButton>
              <ActionButton onClick={closeBuilder} color="#aaa">Close Builder</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Assessments; 