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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const PostJobs = () => {
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    type: 'full-time',
    category: 'IT',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Job Posted:', jobDetails);
    alert('Job posted successfully!');
    // Reset form or redirect
    setJobDetails({
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: '',
      salary: '',
      type: 'full-time',
      category: 'IT',
    });
  };

  return (
    <Container>
      <Title>Post a New Job</Title>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <Label>Job Title</Label>
            <Input
              type="text"
              name="title"
              value={jobDetails.title}
              onChange={handleInputChange}
              placeholder="e.g., Software Engineer"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Company Name</Label>
            <Input
              type="text"
              name="company"
              value={jobDetails.company}
              onChange={handleInputChange}
              placeholder="e.g., Tech Innovations Inc."
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Location</Label>
            <Input
              type="text"
              name="location"
              value={jobDetails.location}
              onChange={handleInputChange}
              placeholder="e.g., Remote, New York, NY"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Salary (Optional)</Label>
            <Input
              type="text"
              name="salary"
              value={jobDetails.salary}
              onChange={handleInputChange}
              placeholder="e.g., $60,000 - $80,000 / year"
            />
          </FormGroup>
          <FormGroup>
            <Label>Job Type</Label>
            <Select
              name="type"
              value={jobDetails.type}
              onChange={handleInputChange}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Job Category</Label>
            <Select
              name="category"
              value={jobDetails.category}
              onChange={handleInputChange}
            >
              <option value="IT">IT & Software</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </Select>
          </FormGroup>
        </FormGrid>
        <FormGroup>
          <Label>Job Description</Label>
          <TextArea
            name="description"
            value={jobDetails.description}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of the job responsibilities."
            required
          ></TextArea>
        </FormGroup>
        <FormGroup>
          <Label>Requirements</Label>
          <TextArea
            name="requirements"
            value={jobDetails.requirements}
            onChange={handleInputChange}
            placeholder="List the required skills, qualifications, and experience."
            required
          ></TextArea>
        </FormGroup>
        <Button type="submit">Post Job</Button>
      </form>
    </Container>
  );
};

export default PostJobs; 