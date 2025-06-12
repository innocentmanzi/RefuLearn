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

const initialCourses = [
  { id: 1, title: 'Intro to Programming', description: 'Learn the basics of programming.' },
  { id: 2, title: 'Web Development', description: 'Build modern web applications.' },
  { id: 3, title: 'Data Analysis', description: 'Analyze and visualize data.' },
];

const ManageCourses = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCourse, setCurrentCourse] = useState({ id: null, title: '', description: '' });
  const [showCourseBuilder, setShowCourseBuilder] = useState(false);
  const [videoFiles, setVideoFiles] = useState([]); // For uploaded video files
  const [resourceFiles, setResourceFiles] = useState([]); // For uploaded resource files
  const [builderCourse, setBuilderCourse] = useState({
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
  });

  const openAddModal = () => {
    setModalMode('add');
    setCurrentCourse({ id: null, title: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setModalMode('edit');
    setCurrentCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setCurrentCourse({ ...currentCourse, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      setCourses([
        ...courses,
        { ...currentCourse, id: Date.now() },
      ]);
    } else {
      setCourses(courses.map(c => c.id === currentCourse.id ? currentCourse : c));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const openCourseBuilder = (course) => {
    setBuilderCourse({
      ...course,
      videoLinks: Array.isArray(course.videoLinks) ? course.videoLinks : [],
      videoUploads: Array.isArray(course.videoUploads) ? course.videoUploads : [],
      resources: Array.isArray(course.resources) ? course.resources : [],
      resourceUploads: Array.isArray(course.resourceUploads) ? course.resourceUploads : [],
      modules: Array.isArray(course.modules) ? course.modules : [],
      category: course.category || '',
      level: course.level || '',
      prerequisites: course.prerequisites || '',
      duration: course.duration || '',
    });
    setShowCourseBuilder(true);
  };

  const closeCourseBuilder = () => {
    setShowCourseBuilder(false);
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
    setBuilderCourse({ ...builderCourse, modules: [...builderCourse.modules, { title: '', content: '' }] });
  };

  const handleModuleChange = (idx, field, value) => {
    const updated = [...builderCourse.modules];
    updated[idx][field] = value;
    setBuilderCourse({ ...builderCourse, modules: updated });
  };

  const handleRemoveModule = (idx) => {
    const updated = [...builderCourse.modules];
    updated.splice(idx, 1);
    setBuilderCourse({ ...builderCourse, modules: updated });
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
      setVideoFiles([...videoFiles, e.target.files[0]]);
    }
  };

  const handleRemoveVideoUpload = (idx) => {
    const updated = [...builderCourse.videoUploads];
    updated.splice(idx, 1);
    setBuilderCourse({ ...builderCourse, videoUploads: updated });
    const updatedFiles = [...videoFiles];
    updatedFiles.splice(idx, 1);
    setVideoFiles(updatedFiles);
  };

  const handleResourceFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBuilderCourse({
        ...builderCourse,
        resourceUploads: [...builderCourse.resourceUploads, e.target.files[0].name],
      });
      setResourceFiles([...resourceFiles, e.target.files[0]]);
    }
  };

  const handleRemoveResourceUpload = (idx) => {
    const updated = [...builderCourse.resourceUploads];
    updated.splice(idx, 1);
    setBuilderCourse({ ...builderCourse, resourceUploads: updated });
    const updatedFiles = [...resourceFiles];
    updatedFiles.splice(idx, 1);
    setResourceFiles(updatedFiles);
  };

  return (
    <Container>
      <Title>Manage Courses</Title>
      <AddButton onClick={openAddModal}>+ Add New Course</AddButton>
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
                <ActionButton onClick={() => openEditModal(course)}>Edit</ActionButton>
                <ActionButton color="#3498db" onClick={() => openCourseBuilder(course)}>View/Edit</ActionButton>
                <ActionButton color="#e74c3c" onClick={() => handleDelete(course.id)}>Delete</ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{modalMode === 'add' ? 'Add New Course' : 'Edit Course'}</ModalTitle>
            <Input
              name="title"
              placeholder="Course Title"
              value={currentCourse.title}
              onChange={handleInputChange}
            />
            <Input
              name="description"
              placeholder="Course Description"
              value={currentCourse.description}
              onChange={handleInputChange}
            />
            <StickyFooter>
              <ActionButton onClick={handleSave}>{modalMode === 'add' ? 'Add' : 'Save'}</ActionButton>
              <ActionButton color="#888" onClick={closeModal}>Cancel</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {showCourseBuilder && (
        <ModalOverlay>
          <ModalContent style={{ maxWidth: 600 }}>
            <ModalTitle>Course Builder</ModalTitle>
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
            <Label>Video Links</Label>
            {(builderCourse.videoLinks || []).map((link, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <ResourceInput
                  value={link}
                  placeholder="YouTube/Vimeo link or video URL"
                  onChange={e => handleVideoLinkChange(idx, e.target.value)}
                />
                <ActionButton color="#e74c3c" onClick={() => handleRemoveVideoLink(idx)}>Remove</ActionButton>
              </div>
            ))}
            <ActionButton color="#27ae60" onClick={handleAddVideoLink}>+ Add Video Link</ActionButton>
            <Label style={{ marginTop: 16 }}>Upload Video Files</Label>
            <input type="file" accept="video/*" onChange={handleVideoFileUpload} />
            {(builderCourse.videoUploads || []).map((file, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span>{file}</span>
                <ActionButton color="#e74c3c" onClick={() => handleRemoveVideoUpload(idx)}>Remove</ActionButton>
              </div>
            ))}
            <Label style={{ marginTop: 16 }}>Resources</Label>
            {(builderCourse.resources || []).map((res, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <ResourceInput
                  value={res}
                  placeholder="Resource link or file name"
                  onChange={e => handleResourceChange(idx, e.target.value)}
                />
                <ActionButton color="#e74c3c" onClick={() => handleRemoveResource(idx)}>Remove</ActionButton>
              </div>
            ))}
            <ActionButton color="#27ae60" onClick={handleAddResource}>+ Add Resource Link</ActionButton>
            <Label style={{ marginTop: 16 }}>Upload Resource Files</Label>
            <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.rar" onChange={handleResourceFileUpload} />
            {(builderCourse.resourceUploads || []).map((file, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span>{file}</span>
                <ActionButton color="#e74c3c" onClick={() => handleRemoveResourceUpload(idx)}>Remove</ActionButton>
              </div>
            ))}
            <Label style={{ marginTop: 16 }}>Modules/Lessons</Label>
            {(builderCourse.modules || []).map((mod, idx) => (
              <ModuleBox key={idx}>
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
              </ModuleBox>
            ))}
            <ActionButton color="#27ae60" onClick={handleAddModule}>+ Add Module/Lesson</ActionButton>
            <StickyFooter>
              <ActionButton onClick={handleSaveCourseBuilder} disabled={!builderCourse.title || !builderCourse.description}>
                Save Course
              </ActionButton>
              <ActionButton color="#888" onClick={closeCourseBuilder}>Cancel</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ManageCourses; 