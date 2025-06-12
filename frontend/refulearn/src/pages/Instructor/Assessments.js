import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const Th = styled.th`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 0.8rem;
  text-align: left;
`;

const Td = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
`;

const ActionButton = styled.button`
  background: ${({ color, theme }) => color || theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
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
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  min-width: 350px;
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
  padding: 0.7rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
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
  padding: 0.4rem;
  margin-bottom: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
  z-index: 2;
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

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...builderAssessment.questions];
    updated[idx][field] = value;
    setBuilderAssessment({ ...builderAssessment, questions: updated });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...builderAssessment.questions];
    updated[qIdx].options[oIdx] = value;
    setBuilderAssessment({ ...builderAssessment, questions: updated });
  };

  const handleAddOption = (qIdx) => {
    const updated = [...builderAssessment.questions];
    updated[qIdx].options.push('');
    setBuilderAssessment({ ...builderAssessment, questions: updated });
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    const updated = [...builderAssessment.questions];
    updated[qIdx].options.splice(oIdx, 1);
    setBuilderAssessment({ ...builderAssessment, questions: updated });
  };

  const handleRemoveQuestion = (idx) => {
    const updated = [...builderAssessment.questions];
    updated.splice(idx, 1);
    setBuilderAssessment({ ...builderAssessment, questions: updated });
  };

  const handleSaveBuilder = () => {
    if (!builderAssessment.title || builderAssessment.questions.length === 0) return;
    if (builderAssessment.id) {
      setAssessments(assessments.map(a => a.id === builderAssessment.id ? builderAssessment : a));
    } else {
      setAssessments([...assessments, { ...builderAssessment, id: Date.now() }]);
    }
    setShowBuilder(false);
  };

  return (
    <Container>
      <Title>Manage Assessments</Title>
      <AddButton onClick={openAddModal}>+ Add New Assessment</AddButton>
      <Table>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {assessments.map(assessment => (
            <tr key={assessment.id}>
              <Td>{assessment.title}</Td>
              <Td>{assessment.description}</Td>
              <Td>
                <ActionButton onClick={() => openEditModal(assessment)}>Edit</ActionButton>
                <ActionButton color="#e74c3c" onClick={() => handleDelete(assessment.id)}>Delete</ActionButton>
                <ActionButton color="#3498db" onClick={() => openBuilder(assessment)}>View/Edit</ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{modalMode === 'add' ? 'Add New Assessment' : 'Edit Assessment'}</ModalTitle>
            <Input
              name="title"
              placeholder="Assessment Title"
              value={currentAssessment.title}
              onChange={handleInputChange}
            />
            <Input
              name="description"
              placeholder="Assessment Description"
              value={currentAssessment.description}
              onChange={handleInputChange}
            />
            <ModalActions>
              <ActionButton onClick={handleSave}>{modalMode === 'add' ? 'Add' : 'Save'}</ActionButton>
              <ActionButton color="#888" onClick={closeModal}>Cancel</ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {showBuilder && (
        <ModalOverlay>
          <ModalContent style={{ maxWidth: 700 }}>
            <ModalTitle>Assessment Builder</ModalTitle>
            <Input
              name="title"
              placeholder="Assessment Title"
              value={builderAssessment.title}
              onChange={handleBuilderChange}
            />
            <Input
              name="description"
              placeholder="Assessment Description"
              value={builderAssessment.description}
              onChange={handleBuilderChange}
            />
            <Select name="courseId" value={builderAssessment.courseId} onChange={handleBuilderChange}>
              <option value="">Attach to Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
            <Input
              name="module"
              placeholder="Module (optional)"
              value={builderAssessment.module}
              onChange={handleBuilderChange}
            />
            <Input
              name="timeLimit"
              placeholder="Time Limit (minutes)"
              value={builderAssessment.timeLimit}
              onChange={handleBuilderChange}
            />
            <Input
              name="passingScore"
              placeholder="Passing Score (%)"
              value={builderAssessment.passingScore}
              onChange={handleBuilderChange}
            />
            <Label>Questions</Label>
            {builderAssessment.questions.map((q, idx) => (
              <QuestionBox key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>Q{idx + 1} ({q.type === 'mcq' ? 'Multiple Choice' : q.type === 'short' ? 'Short Answer' : 'File Upload'})</b>
                  <ActionButton color="#e74c3c" onClick={() => handleRemoveQuestion(idx)}>Remove</ActionButton>
                </div>
                <TextArea
                  value={q.text}
                  placeholder="Question text"
                  onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
                />
                {q.type === 'mcq' && (
                  <>
                    <Label>Options</Label>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <OptionInput
                          value={opt}
                          placeholder={`Option ${oIdx + 1}`}
                          onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                        />
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correct === oIdx}
                          onChange={() => handleQuestionChange(idx, 'correct', oIdx)}
                        /> Correct
                        <ActionButton color="#e74c3c" onClick={() => handleRemoveOption(idx, oIdx)}>Remove</ActionButton>
                      </div>
                    ))}
                    <ActionButton color="#27ae60" onClick={() => handleAddOption(idx)}>+ Add Option</ActionButton>
                  </>
                )}
                <Label>Explanation/Feedback</Label>
                <TextArea
                  value={q.explanation}
                  placeholder="Explanation or feedback for this question"
                  onChange={e => handleQuestionChange(idx, 'explanation', e.target.value)}
                />
              </QuestionBox>
            ))}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <ActionButton color="#2980b9" onClick={() => handleAddQuestion('mcq')}>+ Multiple Choice</ActionButton>
              <ActionButton color="#2980b9" onClick={() => handleAddQuestion('short')}>+ Short Answer</ActionButton>
              <ActionButton color="#2980b9" onClick={() => handleAddQuestion('file')}>+ File Upload</ActionButton>
            </div>
            <StickyFooter>
              <ActionButton onClick={handleSaveBuilder} disabled={!builderAssessment.title || builderAssessment.questions.length === 0}>
                Save Assessment
              </ActionButton>
              <ActionButton color="#888" onClick={closeBuilder}>Cancel</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Assessments; 