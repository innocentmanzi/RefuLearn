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

  @media (max-width: 900px) {
    display: none;
  }
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

const ResourceInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const ModuleBox = styled.div`
  background: #f7f7f7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const CoursesGrid = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

const CourseCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CourseInfo = styled.div`
  flex: 1;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const CourseDescription = styled.p`
  margin: 0;
  color: #555;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const initialCourses = [
  { id: 1, title: 'Intro to Programming', description: 'Learn the basics of programming.' },
  { id: 2, title: 'Web Development', description: 'Build modern web applications.' },
  { id: 3, title: 'Data Analysis', description: 'Analyze and visualize data.' },
];

// Hook to detect mobile screen
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const ManageCourses = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [showCourseBuilder, setShowCourseBuilder] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  const getInitialCourseState = () => ({
    id: null,
    title: '',
    description: '',
    category: '',
    level: '',
    prerequisites: '',
    duration: '',
    videoLinks: [],
    videoUploads: [],
    resources: [],
    resourceUploads: [],
    modules: [],
    quiz: [],
    assessments: [],
    qaEnabled: true,
  });

  const [builderCourse, setBuilderCourse] = useState(getInitialCourseState());

  const openCourseBuilder = (mode, course = null) => {
    setModalMode(mode);
    if (mode === 'add') {
      setBuilderCourse(getInitialCourseState());
    } else {
      setBuilderCourse({
        ...getInitialCourseState(),
        ...course,
      });
    }
    setShowCourseBuilder(true);
  };

  const closeModal = () => {
    setShowCourseBuilder(false);
  };

  const handleInputChange = (e) => {
    setBuilderCourse({ ...builderCourse, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      setCourses([
        ...courses,
        { ...builderCourse, id: Date.now() },
      ]);
    } else {
      setCourses(courses.map(c => c.id === builderCourse.id ? builderCourse : c));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleBuilderChange = (e) => {
    setBuilderCourse({ ...builderCourse, [e.target.name]: e.target.value });
  };

  const handleAddVideoLink = () => {
    setBuilderCourse({ ...builderCourse, videoLinks: [...builderCourse.videoLinks, ''] });
  };

  const handleVideoLinkChange = (idx, value) => {
    const updated = [...builderCourse.videoLinks];
    updated[idx] = value;
    setBuilderCourse({ ...builderCourse, videoLinks: updated });
  };

  const handleRemoveVideoLink = (idx) => {
    const updated = [...builderCourse.videoLinks];
    updated.splice(idx, 1);
    setBuilderCourse({ ...builderCourse, videoLinks: updated });
  };

  const handleAddResource = () => {
    setBuilderCourse({ ...builderCourse, resources: [...builderCourse.resources, ''] });
  };

  const handleResourceChange = (idx, value) => {
    const updated = [...builderCourse.resources];
    updated[idx] = value;
    setBuilderCourse({ ...builderCourse, resources: updated });
  };

  const handleRemoveResource = (idx) => {
    const updated = [...builderCourse.resources];
    updated.splice(idx, 1);
    setBuilderCourse({ ...builderCourse, resources: updated });
  };

  const handleAddModule = () => {
    const newModule = { title: '', content: '', resources: [], video: null };
    setBuilderCourse({ ...builderCourse, modules: [...builderCourse.modules, newModule] });
  };

  const handleModuleChange = (idx, field, value) => {
    const updated = [...builderCourse.modules];
    updated[idx] = { ...updated[idx], [field]: value };
    setBuilderCourse({ ...builderCourse, modules: updated });
  };

  const handleRemoveModule = (idx) => {
    const updated = builderCourse.modules.filter((_, i) => i !== idx);
    setBuilderCourse({ ...builderCourse, modules: updated });
  };

  const handleAddQuestion = () => {
    const newQuestion = { text: '', options: ['', '', '', ''], correctAnswer: 0 };
    setBuilderCourse({ ...builderCourse, quiz: [...builderCourse.quiz, newQuestion] });
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const updated = [...builderCourse.quiz];
    updated[qIdx] = { ...updated[qIdx], [field]: value };
    setBuilderCourse({ ...builderCourse, quiz: updated });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...builderCourse.quiz];
    updated[qIdx].options[oIdx] = value;
    setBuilderCourse({ ...builderCourse, quiz: updated });
  };

  const handleRemoveQuestion = (qIdx) => {
    const updated = builderCourse.quiz.filter((_, i) => i !== qIdx);
    setBuilderCourse({ ...builderCourse, quiz: updated });
  };

  const handleAddAssessment = () => {
    const newAssessment = { title: '', description: '', dueDate: '' };
    setBuilderCourse({ ...builderCourse, assessments: [...builderCourse.assessments, newAssessment] });
  };

  const handleAssessmentChange = (idx, field, value) => {
    const updated = [...builderCourse.assessments];
    updated[idx] = { ...updated[idx], [field]: value };
    setBuilderCourse({ ...builderCourse, assessments: updated });
  };

  const handleRemoveAssessment = (idx) => {
    const updated = builderCourse.assessments.filter((_, i) => i !== idx);
    setBuilderCourse({ ...builderCourse, assessments: updated });
  };

  const handleSaveCourseBuilder = () => {
    if (!builderCourse.title || !builderCourse.description) return;
    if (builderCourse.id) {
      setCourses(courses.map(c => c.id === builderCourse.id ? builderCourse : c));
    } else {
      setCourses([...courses, { ...builderCourse, id: Date.now() }]);
    }
    setShowCourseBuilder(false);
  };

  const handleBuilderSelect = (e) => {
    setBuilderCourse({ ...builderCourse, [e.target.name]: e.target.value });
  };

  const handleVideoFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBuilderCourse({
        ...builderCourse,
        videoUploads: [...builderCourse.videoUploads, e.target.files[0].name],
      });
    }
  };

  const handleRemoveVideoUpload = (idx) => {
    const updated = [...builderCourse.videoUploads];
    updated.splice(idx, 1);
    setBuilderCourse({ ...builderCourse, videoUploads: updated });
  };

  const handleResourceFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBuilderCourse({
        ...builderCourse,
        resourceUploads: [...builderCourse.resourceUploads, e.target.files[0].name],
      });
    }
  };

  const handleRemoveResourceUpload = (idx) => {
    const updated = [...builderCourse.resourceUploads];
    updated.splice(idx, 1);
    setBuilderCourse({ ...builderCourse, resourceUploads: updated });
  };

  return (
    <Container>
      <Title>Manage Courses</Title>
      <AddButton onClick={() => openCourseBuilder('add')}>+ Add New Course</AddButton>

      {isMobile ? (
        <CoursesGrid>
          {courses.map(course => (
            <CourseCard key={course.id}>
              <CourseInfo>
                <CourseTitle>{course.title}</CourseTitle>
                <CourseDescription>{course.description}</CourseDescription>
              </CourseInfo>
              <CardActions>
                <ActionButton onClick={() => openCourseBuilder('edit', course)}>View/Edit</ActionButton>
                <ActionButton color="#dc3545" onClick={() => handleDelete(course.id)}>Delete</ActionButton>
              </CardActions>
            </CourseCard>
          ))}
        </CoursesGrid>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Description</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <Td>{course.title}</Td>
                <Td>{course.description}</Td>
                <Td>
                  <ActionButton onClick={() => openCourseBuilder('edit', course)}>View/Edit</ActionButton>
                  <ActionButton color="#dc3545" onClick={() => handleDelete(course.id)}>Delete</ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showCourseBuilder && (
        <ModalOverlay>
          <ModalContent style={{ maxWidth: 600 }}>
            <ModalTitle>{modalMode === 'add' ? 'Create New Course' : 'Edit Course'}</ModalTitle>

            {/* Basic Info Section */}
            <ModuleBox>
              <Label>Course Overview</Label>
              <Input
                name="title"
                placeholder="Course Title"
                value={builderCourse.title}
                onChange={handleBuilderChange}
              />
              <Input
                name="description"
                placeholder="Course Description"
                value={builderCourse.description}
                onChange={handleBuilderChange}
              />
              <Select name="category" value={builderCourse.category} onChange={handleBuilderSelect}>
                <option value="">Select Category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="language">Language</option>
                <option value="other">Other</option>
              </Select>
              <Select name="level" value={builderCourse.level} onChange={handleBuilderSelect}>
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
              <Input
                name="prerequisites"
                placeholder="Prerequisites (comma separated)"
                value={builderCourse.prerequisites}
                onChange={handleBuilderChange}
              />
              <Input
                name="duration"
                placeholder="Duration (e.g. 6 weeks, 10 hours)"
                value={builderCourse.duration}
                onChange={handleBuilderChange}
              />
            </ModuleBox>

            {/* Modules Section */}
            <ModuleBox>
              <Label>Modules / Lessons</Label>
              {(builderCourse.modules || []).map((mod, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Input
                    value={mod.title}
                    placeholder="Module/Lesson Title"
                    onChange={e => handleModuleChange(idx, 'title', e.target.value)}
                  />
                  <TextArea
                    value={mod.content}
                    placeholder="Module/Lesson Content"
                    onChange={e => handleModuleChange(idx, 'content', e.target.value)}
                  />
                  <ActionButton color="#e74c3c" onClick={() => handleRemoveModule(idx)}>Remove Module</ActionButton>
                </div>
              ))}
              <ActionButton color="#27ae60" onClick={handleAddModule}>+ Add Module/Lesson</ActionButton>
            </ModuleBox>

            {/* Quiz Section */}
            <ModuleBox>
              <Label>Course Quiz</Label>
              {(builderCourse.quiz || []).map((q, qIdx) => (
                <div key={qIdx} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <Label>Question {qIdx + 1}</Label>
                  <TextArea value={q.text} onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)} placeholder="Question text" />
                  <Label>Options</Label>
                  {q.options.map((opt, oIdx) => (
                    <Input key={oIdx} value={opt} onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} />
                  ))}
                  <Label>Correct Answer</Label>
                  <Select value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', parseInt(e.target.value))}>
                    {q.options.map((opt, oIdx) => (
                      <option key={oIdx} value={oIdx}>{`Option ${oIdx + 1}`}</option>
                    ))}
                  </Select>
                  <ActionButton color="#e74c3c" onClick={() => handleRemoveQuestion(qIdx)} style={{marginTop: '0.5rem'}}>Remove Question</ActionButton>
                </div>
              ))}
              <ActionButton color="#27ae60" onClick={handleAddQuestion}>+ Add Question</ActionButton>
            </ModuleBox>

            {/* Assessments Section */}
            <ModuleBox>
              <Label>Assessments</Label>
                {(builderCourse.assessments || []).map((assessment, idx) => (
                <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <Label>Assessment {idx + 1}</Label>
                    <Input value={assessment.title} onChange={(e) => handleAssessmentChange(idx, 'title', e.target.value)} placeholder="Assessment Title" />
                    <TextArea value={assessment.description} onChange={(e) => handleAssessmentChange(idx, 'description', e.target.value)} placeholder="Description" />
                    <Input type="date" value={assessment.dueDate} onChange={(e) => handleAssessmentChange(idx, 'dueDate', e.target.value)} />
                    <ActionButton color="#e74c3c" onClick={() => handleRemoveAssessment(idx)} style={{marginTop: '0.5rem'}}>Remove Assessment</ActionButton>
                </div>
                ))}
              <ActionButton color="#27ae60" onClick={handleAddAssessment}>+ Add Assessment</ActionButton>
            </ModuleBox>

            {/* Settings Section */}
            <ModuleBox>
                <Label>Course Settings</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                        type="checkbox"
                        id="qaEnabled"
                        checked={builderCourse.qaEnabled}
                        onChange={(e) => setBuilderCourse({ ...builderCourse, qaEnabled: e.target.checked })}
                    />
                    <label htmlFor="qaEnabled">Enable Student Q&A Forum</label>
                </div>
            </ModuleBox>

            <StickyFooter>
              <ActionButton onClick={handleSaveCourseBuilder} disabled={!builderCourse.title || !builderCourse.description}>
                Save Course
              </ActionButton>
              <ActionButton color="#888" onClick={closeModal}>Cancel</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ManageCourses; 