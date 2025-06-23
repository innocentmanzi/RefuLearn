import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;
const Form = styled.form`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  @media (max-width: 600px) {
    padding: 1rem;
    max-width: 98vw;
  }
`;
const Input = styled.input`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;
const TextArea = styled.textarea`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  min-height: 80px;
`;
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;
const SuccessMsg = styled.div`
  color: #27ae60;
  font-weight: 600;
  margin-top: 1rem;
`;

const PostScholarship = () => {
  const [form, setForm] = useState({
    title: '', provider: '', location: '', deadline: '', description: '', link: '', benefits: ''
  });
  const [success, setSuccess] = useState(false);
  const [scholarships, setScholarships] = useState([]); // mock local list

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = e => {
    e.preventDefault();
    setScholarships([...scholarships, form]);
    setSuccess(true);
    setForm({ title: '', provider: '', location: '', deadline: '', description: '', link: '', benefits: '' });
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <Container>
      <Title>Post a New Scholarship</Title>
      <Form onSubmit={handleSubmit}>
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Scholarship Title" required />
        <Input name="provider" value={form.provider} onChange={handleChange} placeholder="Provider/Organization" required />
        <Input name="location" value={form.location} onChange={handleChange} placeholder="Location (e.g., Online, Country)" required />
        <Input name="deadline" value={form.deadline} onChange={handleChange} placeholder="Deadline (YYYY-MM-DD)" required type="date" />
        <Input name="link" value={form.link} onChange={handleChange} placeholder="Application Link" required />
        <TextArea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <TextArea name="benefits" value={form.benefits} onChange={handleChange} placeholder="Benefits/Offer" required />
        <Button type="submit">Post Scholarship</Button>
        {success && <SuccessMsg>Scholarship posted successfully!</SuccessMsg>}
      </Form>
    </Container>
  );
};
export default PostScholarship; 