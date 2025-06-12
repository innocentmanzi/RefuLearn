import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem 1.5rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const SubTitle = styled.h2`
  color: #555;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
`;

const BookButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
`;

const BookingFormContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e3e8f0;
`;

const FormTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const CancelButton = styled(BackButton)`
  background: #ccc;
  &:hover {
    background: #b3b3b3;
  }
`;

const SubmitButton = styled(BookButton)`
  /* Uses the same styles as BookButton */
`;

const Badge = styled.span`
  display: inline-block;
  background: ${({ $color }) => $color || '#e3e8f0'};
  color: ${({ $textcolor }) => $textcolor || '#333'};
  border-radius: 12px;
  padding: 0.2rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 500;
  margin-right: 0.5rem;
`;

const MentorDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mentor = location.state;

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [issue, setIssue] = useState('');
  const [reason, setReason] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');

  if (!mentor) {
    return <Container>Mentor details not found.</Container>;
  }

  const handleBookMentor = () => {
    setShowBookingForm(true);
  };

  const handleCancelBooking = () => {
    setShowBookingForm(false);
    setIssue('');
    setReason('');
    setBookingDate('');
    setBookingStartTime('');
    setBookingEndTime('');
  };

  const handleSubmitBooking = () => {
    console.log('Booking submitted:', { mentorId: mentor.id, issue, reason, bookingDate, bookingStartTime, bookingEndTime });
    alert('Booking submitted! (Placeholder)');

    setIssue('');
    setReason('');
    setBookingDate('');
    setBookingStartTime('');
    setBookingEndTime('');
    setShowBookingForm(false);
  };

  return (
    <Container>
      <ActionButtons>
        <BackButton onClick={() => navigate(-1)}>Back to Mentors</BackButton>
        {!showBookingForm && <BookButton onClick={handleBookMentor}>Book Mentor</BookButton>}
      </ActionButtons>
      
      <Title>{mentor.name}</Title>
      
      <SubTitle>About</SubTitle>
      <InfoItem><strong>Expertise:</strong> {mentor.expertise}</InfoItem>
      <InfoItem><strong>Languages:</strong> {mentor.languages}</InfoItem>
      <InfoItem><strong>Availability:</strong> {mentor.availability}</InfoItem>

      <SubTitle>Bio</SubTitle>
      <InfoItem>{mentor.bio}</InfoItem>

      {showBookingForm && (
        <BookingFormContainer>
          <FormTitle>Book a Session with {mentor.name}</FormTitle>
          <FormGroup>
            <Label htmlFor="issue">Issue or Topic:</Label>
            <Input 
              type="text" 
              id="issue" 
              name="issue" 
              value={issue} 
              onChange={(e) => setIssue(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="reason">Reason for Booking:</Label>
            <Textarea 
              id="reason" 
              name="reason" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            ></Textarea>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="bookingDate">Preferred Date:</Label>
            <Input 
              type="date" 
              id="bookingDate" 
              name="bookingDate" 
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="bookingStartTime">Preferred Start Time:</Label>
            <Input 
              type="time" 
              id="bookingStartTime" 
              name="bookingStartTime" 
              value={bookingStartTime}
              onChange={(e) => setBookingStartTime(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="bookingEndTime">Preferred End Time:</Label>
            <Input 
              type="time" 
              id="bookingEndTime" 
              name="bookingEndTime" 
              value={bookingEndTime}
              onChange={(e) => setBookingEndTime(e.target.value)}
            />
          </FormGroup>
          <FormActions>
            <CancelButton onClick={handleCancelBooking}>Cancel</CancelButton>
            <SubmitButton onClick={handleSubmitBooking}>Submit Booking</SubmitButton>
          </FormActions>
        </BookingFormContainer>
      )}

    </Container>
  );
};

export default MentorDetail; 