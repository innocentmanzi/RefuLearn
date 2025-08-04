import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import { theme } from '../../theme';
import AssessmentCreator from '../../components/AssessmentCreator';


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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const AssessmentCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const AssessmentTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
  margin-right: 0.5rem;
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ status }) => 
    status === 'published' ? '#d4edda' : 
    status === 'draft' ? '#fff3cd' : '#f8d7da'
  };
  color: ${({ status }) => 
    status === 'published' ? '#155724' : 
    status === 'draft' ? '#856404' : '#721c24'
  };
  border: 1px solid ${({ status }) => 
    status === 'published' ? '#c3e6cb' : 
    status === 'draft' ? '#ffeaa7' : '#f5c6cb'
  };
`;

const AssessmentDescription = styled.p`
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AssessmentMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  color: #666;
  
  strong {
    color: #333;
    margin-right: 0.3rem;
  }
`;

const CourseInfo = styled.div`
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
`;

const CourseName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.3rem;
`;

const CourseType = styled.div`
  font-size: 0.85rem;
  color: #666;
  text-transform: capitalize;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
`;

const ActionButton = styled.button`
  background: ${({ variant, theme }) => 
    variant === 'edit' ? theme.colors.primary :
    variant === 'publish' ? '#28a745' :
    variant === 'unpublish' ? '#6c757d' :
    variant === 'submissions' ? '#17a2b8' :
    variant === 'delete' ? '#dc3545' : theme.colors.primary
  };
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.7rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  flex: 1;
  min-width: 85px;
  white-space: nowrap;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.6rem;
    font-size: 0.75rem;
    min-width: 80px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.85rem;
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
  resize: vertical;
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

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const OptionInput = styled.input`
  width: 90%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
`;

const SearchBarContainer = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const SearchInputContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto 1rem;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const ComboBoxContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
`;

const ComboBoxInput = styled.div`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &.active {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  .placeholder {
    color: #aaa;
    background: transparent;
  }
  
  .arrow {
    font-size: 0.8rem;
    color: #666;
    transition: transform 0.2s;
  }
  
  &.active .arrow {
    transform: rotate(180deg);
  }
  
  span {
    background: transparent;
  }
`;

const ComboBoxDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.5rem;
`;

const ComboBoxOption = styled.div`
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
    border-radius: 0 0 12px 12px;
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
`;

const OptionTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.3rem;
`;

const OptionSubtitle = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const SelectedAssessmentView = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
`;

const DropdownButton = styled.button`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:after {
    content: '▼';
    font-size: 0.8rem;
    color: #666;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.25rem;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const FilterTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
`;

const FilterTag = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    margin: 0;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const LatestAssessmentsSection = styled.div`
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'white'};
  color: ${({ active }) => active ? 'white' : '#333'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsInfo = styled.div`
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const QuestionContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  flex: 1;
`;

const QuestionType = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: capitalize;
`;

const QuestionText = styled.p`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
`;

const QuestionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const OptionsContainer = styled.div`
  margin-top: 1rem;
`;

const OptionItem = styled.div`
  background: ${({ isCorrect }) => isCorrect ? '#d4edda' : '#fff'};
  border: 1px solid ${({ isCorrect }) => isCorrect ? '#c3e6cb' : '#e0e0e0'};
  border-radius: 6px;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${({ isCorrect }) => isCorrect && `
    color: #155724;
    font-weight: 500;
  `}
`;

const CorrectAnswerBox = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 0.8rem;
  margin-top: 1rem;
  color: #155724;
  
  strong {
    display: block;
    margin-bottom: 0.5rem;
  }
`;

const AssessmentDetailsView = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const QuestionsSection = styled.div`
  margin-top: 2rem;
`;

const QuestionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EditableInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const EditableTextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const EditableSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const SmallButton = styled.button`
  background: ${({ variant, theme }) => 
    variant === 'save' ? '#28a745' :
    variant === 'cancel' ? '#6c757d' :
    variant === 'edit' ? theme.colors.primary :
    variant === 'delete' ? '#dc3545' : theme.colors.primary
  };
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const AddQuestionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const EditingContainer = styled.div`
  background: #f8f9fa;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const EditingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const EditingTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => columns || '1fr 1fr'};
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const CorrectIndicator = styled.div`
  color: ${({ correct, theme }) => correct ? '#4caf50' : '#ccc'};
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TrueFalseContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const TrueFalseOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: 2px solid ${({ selected, theme }) => selected ? theme.colors.primary : '#e0e0e0'};
  border-radius: 6px;
  background: ${({ selected, theme }) => selected ? theme.colors.primary + '20' : 'white'};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const RadioButton = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${({ selected, theme }) => selected ? theme.colors.primary : '#ccc'};
  border-radius: 50%;
  background: ${({ selected, theme }) => selected ? theme.colors.primary : 'white'};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: white;
    display: ${({ selected }) => selected ? 'block' : 'none'};
  }
`;

const Assessments = () => {
  const { token } = useUser();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [assessmentData, setAssessmentData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'quiz',
    duration: '',
    totalPoints: 100,
    passingScore: 70,
    dueDate: '',
    questions: []
  });
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssessmentSubmissions, setSelectedAssessmentSubmissions] = useState(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showAssessmentCreator, setShowAssessmentCreator] = useState(false);
  const [editingAssessmentCreator, setEditingAssessmentCreator] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [assessmentsPerPage] = useState(6);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Combo box states
  const [comboBoxValue, setComboBoxValue] = useState('');
  const [showComboDropdown, setShowComboDropdown] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedCourseAssessments, setSelectedCourseAssessments] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'course', 'assessment'
  
  // Question editing states
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionData, setEditingQuestionData] = useState({});

  // Fetch assessments
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching instructor assessments...');
      
      const response = await fetch('/api/instructor/assessments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Assessments data received');
        setAssessments(data.data?.assessments || []);
      } else {
        throw new Error('Failed to fetch assessments');
      }
    } catch (err) {
      console.error('❌ Assessments fetch failed:', err);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL courses for dropdown (both published and unpublished courses from database)
  const fetchCourses = async () => {
    try {
      console.log('🔄 Fetching instructor courses for assessments...');
      
      const response = await fetch('/api/instructor/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      console.log('🔍 FULL API Response:', data);
      console.log('📚 Fetched ALL courses from database:', data.data?.courses);
      
      // Use all courses returned from the database (both published and unpublished)
      const coursesData = data.data?.courses || [];
      
      console.log('📊 Course details:', coursesData.map(c => ({ 
        id: c._id, 
        title: c.title, 
        published: c.isPublished,
        instructor: c.instructor 
      })));
      
      if (coursesData.length === 0) {
        console.warn('❌ No courses found. Create some courses first.');
      } else {
        console.log(`✅ Found ${coursesData.length} courses total`);
      }
      
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]); // Set empty array on error
    }
  };

  // Create assessment
  const createAssessment = async (assessmentData) => {
    try {
      console.log('Creating assessment with data:', assessmentData);
      
      const response = await fetch('/api/instructor/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Assessment creation failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create assessment`);
      }

      const result = await response.json();
      console.log('✅ Assessment created successfully:', result);
      
      setSuccess('Assessment created and published successfully');
      fetchAssessments();
      closeModal();
      
      setTimeout(() => setSuccess(''), 3000);
      
      // Return the result with courseId for navigation
      return {
        courseId: result.data?.courseId || assessmentData.courseId,
        assessment: result.data?.assessment
      };
    } catch (err) {
      console.error('❌ Create assessment error:', err); // Debug log
      setError(err.message || 'Failed to create assessment');
      setTimeout(() => setError(''), 3000);
      throw err; // Re-throw to handle in calling function
    }
  };

  // Update assessment
  const updateAssessment = async (assessmentId, assessmentData) => {
    try {
      console.log('🔄 Updating assessment...');
      
      const response = await fetch(`/api/instructor/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        throw new Error('Failed to update assessment');
      }

      console.log('✅ Assessment updated successfully');
      setSuccess('Assessment updated successfully');
      fetchAssessments();
      closeModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Update assessment error:', err);
      setError(err.message || 'Failed to update assessment');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Delete assessment
  const deleteAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) {
      return;
    }

    try {
      console.log('Deleting assessment:', assessmentId); // Debug log
      
      const response = await fetch(`/api/instructor/assessments/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete failed:', errorData); // Debug log
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to delete assessment`);
      }

      const result = await response.json();
      console.log('Delete successful:', result); // Debug log

      setSuccess('Assessment deleted successfully');
      fetchAssessments();
      
      // Navigate back to grid view if we're currently viewing this assessment
      if (selectedAssessment && selectedAssessment._id === assessmentId) {
        handleBackToGrid();
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err); // Debug log
      setError(err.message || 'Failed to delete assessment');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Toggle assessment status
  const toggleStatus = async (assessmentId, currentStatus) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    
    try {
      const response = await fetch(`/api/instructor/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update assessment status');
      }

      setSuccess(`Assessment ${newStatus} successfully`);
      fetchAssessments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update assessment status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Fetch assessment submissions
  const fetchAssessmentSubmissions = async (assessmentId) => {
    try {
      setSubmissionsLoading(true);
      const response = await fetch(`/api/instructor/assessments/${assessmentId}/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessment submissions');
      }

      const data = await response.json();
      setSelectedAssessmentSubmissions({
        ...data.data,
        submissions: data.data?.submissions || []
      });
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // View assessment submissions
  const viewAssessmentSubmissions = (assessment) => {
    setSelectedAssessmentSubmissions(assessment);
    fetchAssessmentSubmissions(assessment._id);
    setShowSubmissionsModal(true);
  };

  useEffect(() => {
    // Always fetch data, regardless of token status
    fetchAssessments();
    fetchCourses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
      if (showComboDropdown && !event.target.closest('.combo-box-container')) {
        setShowComboDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showComboDropdown]);

  const openAddModal = () => {
    setEditingAssessmentCreator(null);
    setShowAssessmentCreator(true);
  };

  const handleAssessmentCreatorSave = async (assessmentData, originalAssessment) => {
    try {
      // Format the data for the backend (simplified form)
      const submissionData = {
        title: assessmentData.title,
        description: assessmentData.description,
        type: assessmentData.type || 'assessment',
        totalPoints: assessmentData.totalPoints || 0,
        dueDate: assessmentData.dueDate ? new Date(assessmentData.dueDate).toISOString() : null,
        questions: assessmentData.questions || []
      };

      let result;
      if (originalAssessment) {
        // Editing existing assessment
        result = await updateAssessment(originalAssessment._id, submissionData);
      } else {
        // Creating new assessment
        result = await createAssessment(submissionData);
      }
      
      setShowAssessmentCreator(false);
      setEditingAssessmentCreator(null);
      
      // Refresh the assessments list
      fetchAssessments();
      
    } catch (err) {
      setError(err.message || 'Failed to save assessment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAssessment(null);
    setAssessmentData({
      title: '',
      description: '',
      courseId: '',
      type: 'quiz',
      duration: '',
      totalPoints: 100,
      passingScore: 70,
      dueDate: '',
      questions: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setAssessmentData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSave = () => {
    if (!assessmentData.title || !assessmentData.description || !assessmentData.courseId) {
      setError('Title, description, and course are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Format the data for the backend
    const submissionData = {
      title: assessmentData.title,
      description: assessmentData.description,
      courseId: assessmentData.courseId,
      type: assessmentData.type || 'quiz',
      duration: parseInt(assessmentData.duration) || 60,
      totalPoints: parseInt(assessmentData.totalPoints) || 100,
      passingScore: parseInt(assessmentData.passingScore) || 70,
      dueDate: assessmentData.dueDate ? new Date(assessmentData.dueDate).toISOString() : null,
      questions: [] // Start with empty questions array for simple creation
    };

    if (editingAssessment) {
      updateAssessment(editingAssessment._id, submissionData);
    } else {
      createAssessment(submissionData);
    }
  };

  const handleDelete = (id) => {
    deleteAssessment(id);
  };

  const openBuilder = (assessment) => {
    setEditingAssessment(assessment);
    setAssessmentData({
      title: assessment.title || '',
      description: assessment.description || '',
      courseId: assessment.courseId || assessment.course || '',
      moduleId: assessment.moduleId || '',
      type: assessment.type || 'quiz',
      duration: assessment.duration || assessment.timeLimit || '',
      totalPoints: assessment.totalPoints || 100,
      passingScore: assessment.passingScore || 70,
      dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().slice(0, 16) : '',
      questions: assessment.questions || []
    });
    setShowBuilder(true);
  };

  const closeBuilder = () => setShowBuilder(false);

  const handleBuilderChange = (e) => {
    const { name, value, type } = e.target;
    setAssessmentData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleAddQuestion = (type) => {
    const newQuestion = {
      _id: Date.now().toString(),
      question: '',
      type: type,
      points: 10,
      options: type === 'multiple-choice' ? ['', '', '', ''] : [],
      correctAnswer: '',
      rubric: []
    };

    setAssessmentData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    setAssessmentData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIdx] = {
        ...updatedQuestions[qIdx],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setAssessmentData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIdx].options[oIdx] = value;
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleRemoveQuestion = (qIdx) => {
    setAssessmentData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIdx)
    }));
  };

  const handleSaveBuilder = () => {
    if (!assessmentData.title || !assessmentData.description || !assessmentData.courseId) {
      setError('Title, description, and course are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (assessmentData.questions.length === 0) {
      setError('At least one question is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Calculate total points from questions
    const totalPoints = assessmentData.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    
    const submissionData = {
      title: assessmentData.title,
      description: assessmentData.description,
      courseId: assessmentData.courseId,
      moduleId: assessmentData.moduleId || 'default-module',
      timeLimit: parseInt(assessmentData.duration) || 60,
      totalPoints: totalPoints,
      dueDate: assessmentData.dueDate ? new Date(assessmentData.dueDate).toISOString() : null,
      questions: assessmentData.questions.map((q, index) => ({
        id: q._id || `question_${Date.now()}_${index}`,
        type: q.type === 'multiple-choice' ? 'multiple_choice' : 
              q.type === 'true-false' ? 'true_false' : 
              q.type === 'short-answer' ? 'short_answer' : q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        points: q.points || 10,
        explanation: q.explanation || '',
        order: index + 1
      }))
    };

    if (editingAssessment) {
      updateAssessment(editingAssessment._id, submissionData);
    } else {
      createAssessment(submissionData);
    }
    closeBuilder();
  };

  // Filter and search functionality
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (assessment.courseName && assessment.courseName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = selectedCourse === '' || assessment.course === selectedCourse || assessment.courseId === selectedCourse;
    const matchesStatus = selectedStatus === '' || assessment.status === selectedStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Get latest 3 published assessments
  const latestPublishedAssessments = assessments
    .filter(assessment => assessment.status === 'published')
    .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
    .slice(0, 3);

  // Pagination
  const indexOfLastAssessment = currentPage * assessmentsPerPage;
  const indexOfFirstAssessment = indexOfLastAssessment - assessmentsPerPage;
  const currentAssessments = filteredAssessments.slice(indexOfFirstAssessment, indexOfLastAssessment);
  const totalPages = Math.ceil(filteredAssessments.length / assessmentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCourseFilter = (courseId) => {
    setSelectedCourse(courseId);
    setCurrentPage(1);
    setShowDropdown(false);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Combo box functionality
  const handleComboBoxClick = () => {
    setShowComboDropdown(!showComboDropdown);
  };

  const getFilteredOptions = () => {
    // Show only assessments - filter by search term if provided
    const searchFilter = comboBoxValue.toLowerCase();
    
    const assessmentOptions = assessments
      .filter(assessment => 
        !comboBoxValue || 
        assessment.title.toLowerCase().includes(searchFilter) ||
        assessment.description.toLowerCase().includes(searchFilter) ||
        (assessment.courseName && assessment.courseName.toLowerCase().includes(searchFilter))
      )
      .sort((a, b) => {
        // Sort by status (published first) then by title
        if (a.status === 'published' && b.status !== 'published') return -1;
        if (b.status === 'published' && a.status !== 'published') return 1;
        return a.title.localeCompare(b.title);
      })
      .map(assessment => ({
        type: 'assessment',
        id: assessment._id,
        title: assessment.title,
        subtitle: `${assessment.courseName || 'Unknown Course'} • ${assessment.status || 'draft'}`,
        data: assessment
      }));

    return assessmentOptions;
  };

  const handleOptionSelect = (option) => {
    setSelectedAssessment(option.assessment);
    setSelectedCourseAssessments(option.courseAssessments);
    setViewMode(option.type);
    setComboBoxValue(option.title);
    setShowComboDropdown(false);
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setSelectedAssessment(null);
    setSelectedCourseAssessments(null);
    setComboBoxValue('');
    setShowComboDropdown(false);
  };

  const handleAssessmentClick = (assessment) => {
    console.log('Clicking on assessment:', assessment); // Debug log
    
    // Ensure all questions have IDs before setting the selected assessment
    if (assessment.questions && assessment.questions.length > 0) {
      assessment.questions = assessment.questions.map((question, index) => {
        if (!question._id) {
          question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
          console.log(`Generated ID for question ${index + 1}:`, question._id);
        }
        return question;
      });
    }
    
    setSelectedAssessment(assessment);
    setViewMode('assessment');
  };

  // Start editing a question
  const startEditingQuestion = (question, index) => {
    console.log('Starting to edit question:', question); // Debug log
    
    // Ensure the question has an ID - if not, generate one
    if (!question._id) {
      question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated new ID for question:', question._id);
    }
    
    setEditingQuestionId(index);
    
    // Create a proper copy of the question data with all necessary fields
    const questionData = {
      _id: question._id,
      question: question.question || '',
      type: question.type || 'multiple-choice',
      points: question.points || 1,
      options: question.options ? [...question.options] : ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      explanation: question.explanation || ''
    };
    
    console.log('Setting editing question data:', questionData); // Debug log
    setEditingQuestionData(questionData);
  };

  // Save question changes
  const saveQuestionChanges = async (questionIndex) => {
    try {
      console.log('Starting to save question changes for index:', questionIndex);
      console.log('Current editing data:', editingQuestionData);
      console.log('Selected assessment:', selectedAssessment);

      // Validate required fields
      if (!editingQuestionData.question || !editingQuestionData.question.trim()) {
        setError('Question text is required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (!editingQuestionData.type) {
        setError('Question type is required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (!editingQuestionData.points || editingQuestionData.points < 1) {
        setError('Points must be at least 1');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Validate type-specific requirements
      if (editingQuestionData.type === 'multiple-choice') {
        if (!editingQuestionData.options || editingQuestionData.options.length < 2) {
          setError('Multiple choice questions must have at least 2 options');
          setTimeout(() => setError(''), 3000);
          return;
        }
        
        const nonEmptyOptions = editingQuestionData.options.filter(option => option.trim());
        if (nonEmptyOptions.length < 2) {
          setError('Please provide at least 2 non-empty options');
          setTimeout(() => setError(''), 3000);
          return;
        }

        if (!editingQuestionData.correctAnswer || !editingQuestionData.correctAnswer.trim()) {
          setError('Please select a correct answer for multiple choice question');
          setTimeout(() => setError(''), 3000);
          return;
        }

        if (!editingQuestionData.options.includes(editingQuestionData.correctAnswer)) {
          setError('Correct answer must be one of the provided options');
          setTimeout(() => setError(''), 3000);
          return;
        }
      } else {
        // For non-multiple choice questions
        if (!editingQuestionData.correctAnswer || !editingQuestionData.correctAnswer.trim()) {
          setError('Correct answer is required');
          setTimeout(() => setError(''), 3000);
          return;
        }
      }

      const question = selectedAssessment.questions[questionIndex];
      let questionId = question._id || editingQuestionData._id;

      // If still no ID, generate one and update the assessment
      if (!questionId) {
        questionId = `question_${Date.now()}_${questionIndex}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Generated new question ID:', questionId);
        
        // Update the question in the assessment with the new ID
        const updatedAssessment = { ...selectedAssessment };
        updatedAssessment.questions[questionIndex]._id = questionId;
        setSelectedAssessment(updatedAssessment);
      }

      // Prepare the data for the backend
      const questionData = {
        _id: questionId,
        question: editingQuestionData.question.trim(),
        type: editingQuestionData.type,
        points: parseInt(editingQuestionData.points) || 1,
        correctAnswer: editingQuestionData.correctAnswer?.trim() || '',
        explanation: editingQuestionData.explanation?.trim() || ''
      };

      // Add options for multiple choice questions
      if (editingQuestionData.type === 'multiple-choice') {
        questionData.options = editingQuestionData.options.filter(option => option.trim());
      }

      console.log('Saving question with data:', questionData);
      console.log('Question ID:', questionId);
      console.log('Assessment ID:', selectedAssessment._id);

      // Try the individual question endpoint first
      let response = await fetch(`/api/instructor/assessments/${selectedAssessment._id}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionData)
      });

      console.log('Individual question update response status:', response.status);

      // If individual question update fails, try updating the entire assessment
      if (!response.ok) {
        console.log('Individual question update failed, trying full assessment update');
        
        // Update the question in the assessment
        const updatedAssessment = { ...selectedAssessment };
        updatedAssessment.questions[questionIndex] = questionData;
        
        // Recalculate total points
        updatedAssessment.totalPoints = updatedAssessment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        
        response = await fetch(`/api/instructor/assessments/${selectedAssessment._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            questions: updatedAssessment.questions,
            totalPoints: updatedAssessment.totalPoints
          })
        });

        console.log('Full assessment update response status:', response.status);
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update question`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      // Update the selected assessment with the new question data
      const updatedAssessment = { ...selectedAssessment };
      
      if (result.data && result.data.question) {
        // Individual question update response
        updatedAssessment.questions[questionIndex] = result.data.question;
        updatedAssessment.totalPoints = result.data.assessment?.totalPoints || updatedAssessment.totalPoints;
      } else if (result.data && result.data.assessment) {
        // Full assessment update response
        updatedAssessment.questions = result.data.assessment.questions;
        updatedAssessment.totalPoints = result.data.assessment.totalPoints;
      } else {
        // Fallback: update with our local data
        updatedAssessment.questions[questionIndex] = questionData;
        updatedAssessment.totalPoints = updatedAssessment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
      }
      
      setSelectedAssessment(updatedAssessment);
      setEditingQuestionId(null);
      setEditingQuestionData({});
      setSuccess('Question updated successfully');
      
      // Refresh assessments list to ensure consistency
      fetchAssessments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save question error:', err);
      setError(err.message || 'Failed to update question');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Cancel editing
  const cancelEditingQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionData({});
  };

  // Handle question data changes
  const handleQuestionDataChange = (field, value) => {
    setEditingQuestionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle option changes for multiple choice
  const handleOptionDataChange = (optionIndex, value) => {
    setEditingQuestionData(prev => ({
      ...prev,
      options: prev.options.map((option, idx) => 
        idx === optionIndex ? value : option
      )
    }));
  };

  // Set correct answer for multiple choice
  const setCorrectAnswerIndex = (index) => {
    setEditingQuestionData(prev => ({
      ...prev,
      correctAnswer: prev.options[index]
    }));
  };

  // Handle true/false selection
  const handleTrueFalseChange = (value) => {
    setEditingQuestionData(prev => ({
      ...prev,
      correctAnswer: value
    }));
  };

  // Add option for multiple choice
  const addOption = () => {
    setEditingQuestionData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  // Remove option for multiple choice
  const removeOption = (index) => {
    if (editingQuestionData.options.length <= 2) return; // Minimum 2 options
    
    setEditingQuestionData(prev => {
      const newOptions = prev.options.filter((_, idx) => idx !== index);
      let newCorrectAnswer = prev.correctAnswer;
      
      // If the correct answer was the removed option, reset it
      if (prev.correctAnswer === prev.options[index]) {
        newCorrectAnswer = '';
      }
      
      return {
        ...prev,
        options: newOptions,
        correctAnswer: newCorrectAnswer
      };
    });
  };

  // Delete question
  const deleteQuestion = async (questionIndex) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const question = selectedAssessment.questions[questionIndex];
      const questionId = question._id;
      
      const response = await fetch(`/api/instructor/assessments/${selectedAssessment._id}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete question');
      }

      const result = await response.json();
      
      // Update the selected assessment by removing the question
      const updatedAssessment = { ...selectedAssessment };
      updatedAssessment.questions.splice(questionIndex, 1);
      updatedAssessment.totalPoints = result.data.assessment.totalPoints;
      
      setSelectedAssessment(updatedAssessment);
      setSuccess('Question deleted successfully');
      
      // Refresh assessments list
      fetchAssessments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete question');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Add new question
  const addNewQuestion = () => {
    const newQuestion = {
      question: '',
      type: 'multiple-choice',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: ''
    };
    
    setEditingQuestionId(selectedAssessment.questions.length);
    setEditingQuestionData(newQuestion);
  };

  // Save new question
  const saveNewQuestion = async () => {
    try {
      // Validate required fields
      if (!editingQuestionData.question || !editingQuestionData.question.trim()) {
        setError('Question text is required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (!editingQuestionData.type) {
        setError('Question type is required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (!editingQuestionData.points || editingQuestionData.points < 1) {
        setError('Points must be at least 1');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Validate type-specific requirements
      if (editingQuestionData.type === 'multiple-choice') {
        if (!editingQuestionData.options || editingQuestionData.options.length < 2) {
          setError('Multiple choice questions must have at least 2 options');
          setTimeout(() => setError(''), 3000);
          return;
        }
        
        const nonEmptyOptions = editingQuestionData.options.filter(option => option.trim());
        if (nonEmptyOptions.length < 2) {
          setError('Please provide at least 2 non-empty options');
          setTimeout(() => setError(''), 3000);
          return;
        }

        if (!editingQuestionData.correctAnswer || !editingQuestionData.correctAnswer.trim()) {
          setError('Please select a correct answer for multiple choice question');
          setTimeout(() => setError(''), 3000);
          return;
        }

        if (!editingQuestionData.options.includes(editingQuestionData.correctAnswer)) {
          setError('Correct answer must be one of the provided options');
          setTimeout(() => setError(''), 3000);
          return;
        }
      } else {
        // For non-multiple choice questions
        if (!editingQuestionData.correctAnswer || !editingQuestionData.correctAnswer.trim()) {
          setError('Correct answer is required');
          setTimeout(() => setError(''), 3000);
          return;
        }
      }

      // Prepare the data for the backend
      const questionData = {
        question: editingQuestionData.question.trim(),
        type: editingQuestionData.type,
        points: parseInt(editingQuestionData.points) || 1,
        correctAnswer: editingQuestionData.correctAnswer?.trim() || '',
        explanation: editingQuestionData.explanation?.trim() || ''
      };

      // Add options for multiple choice questions
      if (editingQuestionData.type === 'multiple-choice') {
        questionData.options = editingQuestionData.options.filter(option => option.trim());
      }

      console.log('Adding new question with data:', questionData); // Debug log
      console.log('Assessment ID:', selectedAssessment._id); // Debug log

      const response = await fetch(`/api/instructor/assessments/${selectedAssessment._id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionData)
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData); // Debug log
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to add question`);
      }

      const result = await response.json();
      console.log('Backend response:', result); // Debug log
      
      // Update the selected assessment with the new question
      const updatedAssessment = { ...selectedAssessment };
      updatedAssessment.questions.push(result.data.question);
      updatedAssessment.totalPoints = result.data.assessment.totalPoints;
      
      setSelectedAssessment(updatedAssessment);
      setEditingQuestionId(null);
      setEditingQuestionData({});
      setSuccess('Question added successfully');
      
      // Refresh assessments list to ensure consistency
      fetchAssessments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Add question error:', err); // Debug log
      setError(err.message || 'Failed to add question');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading assessments...</LoadingSpinner>
      </Container>
    );
  }

  if (!loading && assessments.length === 0) {
    return (
      <Container>
        <Title>Manage Assessments</Title>
        <AddButton onClick={openAddModal}>Create New Assessment</AddButton>
        <EmptyState>
          <h3>No Assessments Found</h3>
          <p>You haven't created any assessments yet.</p>
          <p>Click "Create New Assessment" to get started!</p>
        </EmptyState>
      </Container>
    );
  }

  // Render different views based on mode
  const renderContent = () => {
    if (viewMode === 'assessment' && selectedAssessment) {
      // Find the course information
      const courseInfo = courses.find(course => course._id === selectedAssessment.course) || 
                        selectedAssessment.courseData || 
                        { title: 'Unknown Course', type: 'course' };

  return (
        <AssessmentDetailsView>
          <BackButton onClick={handleBackToGrid}>← Back to Search</BackButton>
          
          <AssessmentCard>
            <CardHeader>
              <AssessmentTitle>{selectedAssessment.title}</AssessmentTitle>
              <StatusBadge status="published">
                Published
              </StatusBadge>
            </CardHeader>
            
            <AssessmentDescription>{selectedAssessment.description}</AssessmentDescription>
            
            <CourseInfo>
              <CourseName>
                Course: {courseInfo.title}
              </CourseName>
              <CourseType>
                Type: {selectedAssessment.type || 'assessment'} • 
                Instructor: {selectedAssessment.instructorName || 'You'}
              </CourseType>
            </CourseInfo>
            
            <AssessmentMeta>
              <MetaItem><strong>Points:</strong> {selectedAssessment.totalPoints || 0}</MetaItem>
              {selectedAssessment.dueDate && (
                <MetaItem><strong>Due:</strong> {new Date(selectedAssessment.dueDate).toLocaleDateString()}</MetaItem>
              )}
            </AssessmentMeta>

            <ActionButtons>
              <ActionButton 
                variant="edit"
                onClick={() => {
                  setEditingAssessmentCreator({
                    ...selectedAssessment,
                    courseId: selectedAssessment.course || selectedAssessment.courseId
                  });
                  setShowAssessmentCreator(true);
                }}
              >
                Edit Assessment
              </ActionButton>
              <ActionButton 
                variant="delete"
                onClick={() => deleteAssessment(selectedAssessment._id)}
              >
                Delete Assessment
              </ActionButton>
            </ActionButtons>
          </AssessmentCard>




        </AssessmentDetailsView>
      );
    }

    if (viewMode === 'course' && selectedCourseAssessments) {
      return (
        <SelectedAssessmentView>
          <BackButton onClick={handleBackToGrid}>← Back to Search</BackButton>
          <SectionTitle>{selectedCourseAssessments.course.title} - All Assessments</SectionTitle>
          <AssessmentList>
            {selectedCourseAssessments.assessments.map((assessment) => (
              <AssessmentCard key={assessment._id} onClick={() => handleAssessmentClick(assessment)}>
                <CardHeader>
                  <AssessmentTitle>{assessment.title}</AssessmentTitle>
                  <StatusBadge status="published">
                    Published
                  </StatusBadge>
                </CardHeader>
                
                <AssessmentDescription>{assessment.description}</AssessmentDescription>
                
                <AssessmentMeta>
                  <MetaItem><strong>Points:</strong> {assessment.totalPoints || 0}</MetaItem>
                  {assessment.dueDate && (
                    <MetaItem><strong>Due:</strong> {new Date(assessment.dueDate).toLocaleDateString()}</MetaItem>
                  )}
                </AssessmentMeta>
          </AssessmentCard>
        ))}
      </AssessmentList>
        </SelectedAssessmentView>
      );
    }

    // Default view - Show all assessments as cards
    const filteredAssessments = assessments;

    if (loading) {
      return <LoadingSpinner>Loading assessments...</LoadingSpinner>;
    }

    if (filteredAssessments.length === 0) {
      return (
        <EmptyState>
          <h3>No Assessments Found</h3>
          <p>
            You haven't created any assessments yet. Create your first assessment to get started.
          </p>
          <AddButton onClick={openAddModal}>Create New Assessment</AddButton>
        </EmptyState>
      );
    }

    return (
      <AssessmentList>
        {filteredAssessments.map((assessment) => (
          <AssessmentCard key={assessment._id} onClick={() => handleAssessmentClick(assessment)}>
            <CardHeader>
              <AssessmentTitle>{assessment.title}</AssessmentTitle>
              <StatusBadge status={assessment.status || 'published'}>
                {assessment.status || 'Published'}
              </StatusBadge>
            </CardHeader>
            
            <AssessmentDescription>{assessment.description || 'No description available'}</AssessmentDescription>
            

            
            <AssessmentMeta>
              <MetaItem><strong>Points:</strong> {assessment.totalPoints || 0}</MetaItem>
              {assessment.dueDate && (
                <MetaItem><strong>Due:</strong> {new Date(assessment.dueDate).toLocaleDateString()}</MetaItem>
              )}
            </AssessmentMeta>

            <ActionButtons>
              <ActionButton 
                variant="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingAssessmentCreator({
                    ...assessment,
                    courseId: assessment.course || assessment.courseId
                  });
                  setShowAssessmentCreator(true);
                }}
              >
                Edit
              </ActionButton>
              <ActionButton 
                variant={assessment.status === 'published' ? 'unpublish' : 'publish'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus(assessment._id, assessment.status);
                }}
              >
                {assessment.status === 'published' ? 'Deactivate' : 'Activate'}
              </ActionButton>
              <ActionButton 
                variant="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAssessment(assessment._id);
                }}
              >
                Delete
              </ActionButton>
            </ActionButtons>
          </AssessmentCard>
        ))}
      </AssessmentList>
    );
  };

  return (
    <Container>
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <HeaderContainer>
        <Title>Manage Assessments</Title>
        <AddButton onClick={openAddModal}>Create New Assessment</AddButton>
      </HeaderContainer>

      {/* Combo Box Search */}
      <SearchBarContainer>
        <ComboBoxContainer className="combo-box-container">
          <ComboBoxInput
            className={showComboDropdown ? 'active' : ''}
            onClick={handleComboBoxClick}
          >
            <span className={!comboBoxValue ? 'placeholder' : ''}>
              {comboBoxValue || 'Search for assessments or courses...'}
            </span>
            <span className="arrow">▼</span>
          </ComboBoxInput>
          {showComboDropdown && (
            <ComboBoxDropdown>
              {getFilteredOptions().map((option) => (
                <ComboBoxOption key={`${option.type}-${option.id}`} onClick={() => handleOptionSelect(option)}>
                  <OptionTitle>{option.title}</OptionTitle>
                  <OptionSubtitle>{option.subtitle}</OptionSubtitle>
                </ComboBoxOption>
              ))}
              {getFilteredOptions().length === 0 && (
                <ComboBoxOption>
                  <OptionTitle>No assessments found</OptionTitle>
                  <OptionSubtitle>Create your first assessment</OptionSubtitle>
                </ComboBoxOption>
              )}
            </ComboBoxDropdown>
          )}
        </ComboBoxContainer>
      </SearchBarContainer>

      {renderContent()}

      <AssessmentCreator
        isOpen={showAssessmentCreator}
        onClose={() => {
          setShowAssessmentCreator(false);
          setEditingAssessmentCreator(null);
        }}
        onSave={handleAssessmentCreatorSave}
        assessment={editingAssessmentCreator}
        isQuiz={false}
      />

      {showBuilder && (
        <ModalOverlay>
          <ModalContent style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <ModalTitle>
              {editingAssessment ? 'Edit Assessment' : 'Create Assessment'}
            </ModalTitle>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <Label>Title *</Label>
                <Input
                  name="title"
                  value={assessmentData.title}
                  onChange={handleBuilderChange}
                  placeholder="Enter assessment title"
                />
              </div>
              
              <div>
                <Label>Course *</Label>
                <Select name="courseId" value={assessmentData.courseId} onChange={handleBuilderChange}>
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </Select>
              </div>
            </div>

            <Label>Description *</Label>
            <TextArea
              name="description"
              value={assessmentData.description}
              onChange={handleBuilderChange}
              placeholder="Enter assessment description"
              rows="3"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <Label>Type</Label>
                <Select name="type" value={assessmentData.type} onChange={handleBuilderChange}>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                </Select>
              </div>
              
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  name="duration"
                  type="number"
                  value={assessmentData.duration}
                  onChange={handleBuilderChange}
                  placeholder="Duration"
                />
              </div>
              
              <div>
                <Label>Total Points</Label>
                <Input
                  name="totalPoints"
                  type="number"
                  value={assessmentData.totalPoints}
                  onChange={handleBuilderChange}
                  placeholder="Points"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <Label>Passing Score</Label>
                <Input
                  name="passingScore"
                  type="number"
                  value={assessmentData.passingScore}
                  onChange={handleBuilderChange}
                  placeholder="Passing score"
                />
              </div>
              
              <div>
                <Label>Due Date</Label>
                <Input
                  name="dueDate"
                  type="datetime-local"
                  value={assessmentData.dueDate}
                  onChange={handleBuilderChange}
                  placeholder="Select due date"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <Label>Questions</Label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <ActionButton onClick={() => handleAddQuestion('multiple-choice')}>
                  Add Multiple Choice
                </ActionButton>
                <ActionButton onClick={() => handleAddQuestion('true-false')}>
                  Add True/False
                </ActionButton>
                <ActionButton onClick={() => handleAddQuestion('short-answer')}>
                  Add Short Answer
                </ActionButton>
                <ActionButton onClick={() => handleAddQuestion('essay')}>
                  Add Essay
                </ActionButton>
              </div>

              {assessmentData.questions.map((question, qIdx) => (
                <QuestionBox key={question._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Label>Question {qIdx + 1} ({question.type})</Label>
                    <ActionButton 
                      color="#6c757d" 
                      onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(qIdx); }}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    >
                      Remove
                    </ActionButton>
                  </div>
                  
                  <TextArea
                    value={question.question}
                    onChange={(e) => { e.stopPropagation(); handleQuestionChange(qIdx, 'question', e.target.value); }}
                    placeholder="Enter question text"
                    rows="2"
                  />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => { e.stopPropagation(); handleQuestionChange(qIdx, 'points', parseInt(e.target.value)); }}
                        placeholder="Points"
                      />
                    </div>
                    
                    {question.type === 'multiple-choice' && (
                      <div>
                        <Label>Correct Answer</Label>
                        <Input
                          value={question.correctAnswer}
                          onChange={(e) => { e.stopPropagation(); handleQuestionChange(qIdx, 'correctAnswer', e.target.value); }}
                          placeholder="Correct answer"
                        />
                      </div>
                    )}
                  </div>

                  {question.type === 'multiple-choice' && (
                    <div>
                      <Label>Options</Label>
                      {question.options.map((option, oIdx) => (
                        <OptionInput
                          key={oIdx}
                          value={option}
                          onChange={(e) => { e.stopPropagation(); handleOptionChange(qIdx, oIdx, e.target.value); }}
                          placeholder={`Option ${oIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {(question.type === 'true-false' || question.type === 'short-answer' || question.type === 'essay') && (
                    <div>
                      <Label>Correct Answer / Sample Answer</Label>
                      <TextArea
                        value={question.correctAnswer}
                        onChange={(e) => { e.stopPropagation(); handleQuestionChange(qIdx, 'correctAnswer', e.target.value); }}
                        placeholder="Enter correct answer or sample answer"
                        rows="2"
                      />
                    </div>
                  )}
                </QuestionBox>
              ))}
            </div>

            <ModalActions>
              <ActionButton onClick={handleSaveBuilder}>
                {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
              </ActionButton>
              <ActionButton color="#6c757d" onClick={closeBuilder}>Cancel</ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {showSubmissionsModal && (
        <ModalOverlay>
          <ModalContent style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <ModalTitle>Assessment Submissions</ModalTitle>
            
            {submissionsLoading ? (
              <LoadingSpinner>Loading submissions...</LoadingSpinner>
            ) : selectedAssessmentSubmissions ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Total Submissions:</strong> {selectedAssessmentSubmissions.submissions?.length || 0}
                </div>
                
                {selectedAssessmentSubmissions.submissions && selectedAssessmentSubmissions.submissions.length > 0 ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {selectedAssessmentSubmissions.submissions.map((submission, idx) => (
                      <div key={submission._id || idx} style={{ 
                        border: '1px solid #eee', 
                        borderRadius: '8px', 
                        padding: '1rem', 
                        marginBottom: '1rem' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0 }}>
                            {submission.student?.firstName} {submission.student?.lastName}
                          </h4>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', 
                            borderRadius: '20px', 
                            fontSize: '0.8rem',
                            backgroundColor: submission.status === 'graded' ? '#28a745' : '#ffc107',
                            color: 'white'
                          }}>
                            {submission.status}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                          <div>Submitted: {new Date(submission.submittedAt).toLocaleString()}</div>
                          {submission.score !== undefined && (
                            <div>Score: {submission.score}/{selectedAssessmentSubmissions.totalPoints || 100}</div>
                          )}
                          {submission.timeSpent && (
                            <div>Time Spent: {submission.timeSpent} minutes</div>
                          )}
                        </div>
                        
                        {submission.feedback && (
                          <div style={{ 
                            background: '#f8f9fa', 
                            padding: '0.5rem', 
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                            <strong>Feedback:</strong> {submission.feedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No submissions found for this assessment.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No submissions data available.
              </div>
            )}

            <ModalActions>
              <ActionButton color="#6c757d" onClick={() => setShowSubmissionsModal(false)}>Close</ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Assessments; 