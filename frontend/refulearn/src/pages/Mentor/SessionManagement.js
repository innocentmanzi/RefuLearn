import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import db from '../../pouchdb';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CalendarDay = styled.div`
  background: ${({ isToday, isSelected }) => 
    isToday ? 'rgba(0, 123, 255, 0.1)' : 
    isSelected ? 'rgba(0, 123, 255, 0.2)' : '#fff'};
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  min-height: 120px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const DayNumber = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${({ isToday }) => isToday ? '#007bff' : '#333'};
`;

const SessionSlot = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const SessionDetails = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SessionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const SessionStatus = styled.span`
  background: ${({ status }) => 
    status === 'completed' ? '#28a745' :
    status === 'upcoming' ? '#007bff' :
    status === 'cancelled' ? '#dc3545' : '#ffc107'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const SessionInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  margin-bottom: 1rem;
  resize: vertical;
`;

const SessionNotes = styled.div`
  margin-top: 1.5rem;
`;

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AddNoteButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const NoteItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const NoteDate = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const NoteContent = styled.p`
  margin: 0;
  color: #333;
`;

const FeedbackForm = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const RatingStar = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ active }) => active ? '#ffc107' : '#ddd'};
  cursor: pointer;
  
  &:hover {
    color: #ffc107;
  }
`;

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    mentee: '',
    type: ''
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const mentees = ['Alice Johnson', 'Bob Smith', 'Carlos Lee'];
  const sessionTypes = ['One-on-One', 'Group', 'Workshop'];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const result = await db.allDocs({
          include_docs: true,
          startkey: 'session_',
          endkey: 'session_\\ufff0'
        });
        const fetchedSessions = result.rows.map(row => row.doc);
        setSessions(fetchedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  // Generate calendar days
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth(currentYear, currentMonth) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(currentYear, currentMonth) }, (_, i) => i);

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setShowScheduleModal(true);
    setScheduleForm(prev => ({ ...prev, date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` }));
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };

  const handleScheduleSession = () => {
    // Here you would typically make an API call to schedule the session
    console.log('Scheduling session:', scheduleForm);
    setShowScheduleModal(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        content: newNote
      };
      setSelectedSession({
        ...selectedSession,
        notes: [...selectedSession.notes, note]
      });
      setNewNote('');
      setShowNoteModal(false);
    }
  };

  const handleSubmitFeedback = () => {
    if (rating > 0) {
      setSelectedSession({
        ...selectedSession,
        feedback: {
          rating,
          comment: feedback
        }
      });
      setRating(0);
      setFeedback('');
    }
  };

  return (
    <Container>
      <Title>Session Management</Title>
      
      <CalendarGrid>
        <CalendarHeader>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <DayNumber key={day}>{day}</DayNumber>
          ))}
        </CalendarHeader>
        {emptyDays.map((_, idx) => <CalendarDay key={`empty-${idx}`} />)}
        {days.map(day => {
          const today = new Date();
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const hasSession = sessions.some(session => 
            new Date(session.date).getDate() === day &&
            new Date(session.date).getMonth() === currentMonth &&
            new Date(session.date).getFullYear() === currentYear
          );
          const daySessions = sessions.filter(session => 
            new Date(session.date).getDate() === day &&
            new Date(session.date).getMonth() === currentMonth &&
            new Date(session.date).getFullYear() === currentYear
          );

          return (
            <CalendarDay 
              key={day} 
              isToday={isToday} 
              isSelected={selectedDate === day}
              onClick={() => handleDateClick(day)}
            >
              <DayNumber isToday={isToday}>{day}</DayNumber>
              {daySessions.map(session => (
                <SessionSlot key={session.id} onClick={(e) => { e.stopPropagation(); handleSessionClick(session); }}>
                  {session.time} - {session.mentee}
                </SessionSlot>
              ))}
            </CalendarDay>
          );
        })}
      </CalendarGrid>

      {showScheduleModal && (
        <Modal>
          <ModalContent>
            <h2>Schedule New Session</h2>
            <FormGroup>
              <Label>Date</Label>
              <Input 
                type="date" 
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
              />
            </FormGroup>
            <FormGroup>
              <Label>Time</Label>
              <Input 
                type="time" 
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
              />
            </FormGroup>
            <FormGroup>
              <Label>Mentee</Label>
              <Select 
                value={scheduleForm.mentee}
                onChange={(e) => setScheduleForm({...scheduleForm, mentee: e.target.value})}
              >
                <option value="">Select Mentee</option>
                {mentees.map(mentee => (
                  <option key={mentee} value={mentee}>{mentee}</option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Session Type</Label>
              <Select
                value={scheduleForm.type}
                onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
              >
                <option value="">Select Type</option>
                {sessionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </FormGroup>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleScheduleSession}>Schedule Session</Button>
              <Button 
                onClick={() => setShowScheduleModal(false)}
                style={{ background: '#666' }}
              >
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {selectedSession && (
        <SessionDetails>
          <SessionHeader>
            <SessionTitle>Session with {selectedSession.mentee}</SessionTitle>
            <SessionStatus status={selectedSession.status}>
              {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
            </SessionStatus>
          </SessionHeader>

          <SessionInfo>
            <InfoItem>
              <InfoLabel>Date</InfoLabel>
              <InfoValue>{selectedSession.date}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Time</InfoLabel>
              <InfoValue>{selectedSession.time}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Duration</InfoLabel>
              <InfoValue>{selectedSession.duration}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Type</InfoLabel>
              <InfoValue>{selectedSession.type}</InfoValue>
            </InfoItem>
          </SessionInfo>

          <SessionNotes>
            <NotesHeader>
              <h4>Session Notes</h4>
              <AddNoteButton onClick={() => setShowNoteModal(true)}>
                Add Note
              </AddNoteButton>
            </NotesHeader>
            {selectedSession.notes.map(note => (
              <NoteItem key={note.id}>
                <NoteHeader>
                  <NoteDate>{note.date}</NoteDate>
                </NoteHeader>
                <NoteContent>{note.content}</NoteContent>
              </NoteItem>
            ))}
          </SessionNotes>

          {selectedSession.status === 'completed' && !selectedSession.feedback && (
            <FeedbackForm>
              <h4>Session Feedback</h4>
              <RatingContainer>
                {[1, 2, 3, 4, 5].map(star => (
                  <RatingStar
                    key={star}
                    active={star <= rating}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </RatingStar>
                ))}
              </RatingContainer>
              <TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add your feedback..."
              />
              <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
            </FeedbackForm>
          )}

          {selectedSession.feedback && (
            <FeedbackForm>
              <h4>Session Feedback</h4>
              <RatingContainer>
                {[1, 2, 3, 4, 5].map(star => (
                  <RatingStar
                    key={star}
                    active={star <= selectedSession.feedback.rating}
                  >
                    ★
                  </RatingStar>
                ))}
              </RatingContainer>
              <NoteContent>{selectedSession.feedback.comment}</NoteContent>
            </FeedbackForm>
          )}
        </SessionDetails>
      )}

      {showNoteModal && (
        <Modal>
          <ModalContent>
            <h3>Add Session Note</h3>
            <TextArea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note..."
            />
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleAddNote}>Add Note</Button>
              <Button 
                onClick={() => setShowNoteModal(false)}
                style={{ background: '#666' }}
              >
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default SessionManagement; 