import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Stat = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const SectionTitle = styled.h2`
  color: #555;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1rem;
`;

const ChartPlaceholder = styled.div`
  background: #f7f7f7;
  border-radius: 8px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
`;

const StudentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StudentItem = styled.li`
  padding: 0.7rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuickAction = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  margin-top: 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const StickyFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ color }) => color || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ color }) => color && `${color}cc`};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [reply, setReply] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [released, setReleased] = useState(false);
  const [studentSubmissions, setStudentSubmissions] = useState([
    { name: 'Alice Johnson', assignment: 'Module 1 Homework', submittedAt: '2025-06-07', file: 'homework1.pdf', grade: null, feedback: '' },
    { name: 'Bob Smith', assignment: 'Module 1 Homework', submittedAt: '2025-06-07', file: 'homework1_bob.pdf', grade: null, feedback: '' },
    { name: 'Carlos Lee', assignment: 'Module 1 Homework', submittedAt: '2025-06-07', file: 'homework1_carlos.pdf', grade: null, feedback: '' },
    { name: 'Dina Patel', assignment: 'Module 1 Homework', submittedAt: '2025-06-07', file: 'homework1_dina.pdf', grade: null, feedback: '' },
  ]);
  const submissionDetail = {
    student: 'Alice Johnson',
    assignment: 'Module 1 Homework',
    submittedAt: '2025-06-07',
    file: 'homework1.pdf',
    grade: 'Pending',
  };
  const messageDetail = {
    from: 'Bob Smith',
    message: 'I need help with the last assignment.',
    sentAt: '2025-06-08 10:30',
  };
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [instructorName] = useState('John Doe');
  const [welcomeText, setWelcomeText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const welcomeMessage = isFirstLogin ? `Welcome ${instructorName}!` : `Welcome back ${instructorName}!`;
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= welcomeMessage.length) {
        setWelcomeText(welcomeMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 100);
    return () => clearInterval(typingInterval);
  }, [welcomeMessage]);
  const coursesManaged = studentSubmissions.length;
  const studentsSet = new Set(studentSubmissions.map(s => s.name));
  const totalStudents = studentsSet.size;
  const totalAssessments = 3 + studentSubmissions.filter(s => s.grade !== null).length;
  const studentProgress = [
    { name: 'Alice Johnson', progress: '80%' },
    { name: 'Bob Smith', progress: '65%' },
    { name: 'Carlos Lee', progress: '92%' },
    { name: 'Dina Patel', progress: '74%' },
  ];
  const [showSubmissionsList, setShowSubmissionsList] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressData, setProgressData] = useState([
    { name: 'Alice', progress: 80 },
    { name: 'Bob', progress: 65 },
    { name: 'Carlos', progress: 92 },
    { name: 'Dina', progress: 74 },
  ]);
  const [showMessagesList, setShowMessagesList] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([
    { from: 'Bob Smith', message: 'I need help with the last assignment.', sentAt: '2025-06-08 10:30' },
    { from: 'Alice Johnson', message: 'Can you explain module 2?', sentAt: '2025-06-08 09:15' },
    { from: 'Carlos Lee', message: 'I submitted my homework.', sentAt: '2025-06-07 18:00' },
    { from: 'Dina Patel', message: 'Thank you for the feedback!', sentAt: '2025-06-07 17:45' },
  ]);

  return (
    <Container>
      <Title>
        <span>
          {welcomeText}
          {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
        </span>
      </Title>
      <OverviewGrid>
        <OverviewCard>
          <Stat>{coursesManaged}</Stat>
          <StatLabel>Courses Managed</StatLabel>
        </OverviewCard>
        <OverviewCard>
          <Stat>{totalStudents}</Stat>
          <StatLabel>Students</StatLabel>
        </OverviewCard>
        <OverviewCard>
          <Stat>{totalAssessments}</Stat>
          <StatLabel>Assessments</StatLabel>
        </OverviewCard>
      </OverviewGrid>

      <SectionTitle>Student Progress</SectionTitle>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={progressData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="progress" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <StudentList>
        {studentProgress.map((student, idx) => (
          <StudentItem key={idx}>
            <span>{student.name}</span>
            <span style={{ color: '#888', fontSize: '0.95rem' }}>{student.progress}</span>
          </StudentItem>
        ))}
      </StudentList>

      <SectionTitle>Quick Actions</SectionTitle>
      <QuickAction onClick={() => navigate('/manage-courses')}>Create Course</QuickAction>
      <QuickAction onClick={() => navigate('/assessments')}>Manage Assessments</QuickAction>

      <SectionTitle>Recent Activity</SectionTitle>
      <DashboardGrid>
        <Card onClick={() => setShowSubmissionsList(true)} style={{ cursor: 'pointer' }}>
          <CardTitle>New Submission</CardTitle>
          <p>Student "Alice Johnson" submitted an assignment.</p>
        </Card>
        <Card onClick={() => setShowMessagesList(true)} style={{ cursor: 'pointer' }}>
          <CardTitle>Message</CardTitle>
          <p>Message from student "Bob Smith".</p>
        </Card>
      </DashboardGrid>

      {showSubmissionsList && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>All Student Submissions</ModalTitle>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {studentSubmissions.map((sub, idx) => (
                <li key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><b>{sub.name}</b> - {sub.assignment}</span>
                    <ActionButton onClick={() => { setSelectedStudent(sub); setShowSubmissionsList(false); }}>View & Grade</ActionButton>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#888' }}>Submitted: {sub.submittedAt} | File: {sub.file} | Grade: {sub.grade ? sub.grade : 'Pending'}</div>
                </li>
              ))}
            </ul>
            <StickyFooter>
              <ActionButton color="#888" onClick={() => setShowSubmissionsList(false)}>Close</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      {selectedStudent && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Submission: {selectedStudent.name}</ModalTitle>
            <div><b>Assignment:</b> {selectedStudent.assignment}</div>
            <div><b>Submitted At:</b> {selectedStudent.submittedAt}</div>
            <div><b>File:</b> {selectedStudent.file}</div>
            <div><b>Grade:</b> {selectedStudent.grade ? selectedStudent.grade : 'Pending'}</div>
            <div style={{ margin: '1rem 0', background: '#f7f7f7', padding: '1rem', borderRadius: 8 }}>
              <b>Student's Work:</b>
              <div style={{ marginTop: 8 }}>
                {/* Mocked original answer or file preview */}
                {selectedStudent.file.endsWith('.pdf') ? (
                  <a href={`#/${selectedStudent.file}`} target="_blank" rel="noopener noreferrer">View PDF: {selectedStudent.file}</a>
                ) : (
                  <div>Answer: Lorem ipsum dolor sit amet, student answer goes here.</div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label>Enter Grade:</label>
              <Input
                placeholder="e.g. 85 or B+"
                value={grade}
                onChange={e => setGrade(e.target.value)}
              />
              <label>Feedback:</label>
              <TextArea
                placeholder="Write feedback for the student..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
            </div>
            <StickyFooter>
              <ActionButton
                onClick={() => {
                  setStudentSubmissions(subs => subs.map(s =>
                    s.name === selectedStudent.name ? { ...s, grade, feedback } : s
                  ));
                  setProgressData(data => data.map(d =>
                    d.name === selectedStudent.name.split(' ')[0] ? { ...d, progress: Math.min(100, Number(grade) || d.progress) } : d
                  ));
                  setSelectedStudent(null);
                  setGrade('');
                  setFeedback('');
                }}
                disabled={!grade || !feedback}
              >
                Release Grade
              </ActionButton>
              <ActionButton color="#888" onClick={() => { setSelectedStudent(null); setGrade(''); setFeedback(''); }}>Close</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      {showMessagesList && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>All Student Messages</ModalTitle>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {messages.map((msg, idx) => (
                <li key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><b>{msg.from}</b>: {msg.message}</span>
                    <ActionButton onClick={() => { setSelectedMessage(msg); setShowMessagesList(false); }}>Reply</ActionButton>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#888' }}>Sent: {msg.sentAt}</div>
                </li>
              ))}
            </ul>
            <StickyFooter>
              <ActionButton color="#888" onClick={() => setShowMessagesList(false)}>Close</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      {selectedMessage && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Message from {selectedMessage.from}</ModalTitle>
            <div style={{ marginBottom: '1rem' }}>{selectedMessage.message}</div>
            <Input
              placeholder="Type your reply..."
              value={reply}
              onChange={e => setReply(e.target.value)}
            />
            <StickyFooter>
              <ActionButton onClick={() => { setReply(''); setSelectedMessage(null); }}>Send Reply</ActionButton>
              <ActionButton color="#888" onClick={() => setSelectedMessage(null)}>Close</ActionButton>
            </StickyFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default InstructorDashboard; 