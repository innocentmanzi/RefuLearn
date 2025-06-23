import React, { useState, useEffect } from 'react';
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

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const HelpHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const AskHelpButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const SearchInput = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 200px;
  }
`;

const FilterSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
`;

const HelpRequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HelpCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const HelpCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const HelpTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-size: 1.2rem;
`;

const HelpMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const HelpContent = styled.p`
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const HelpTags = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
`;

const HelpStats = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
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
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
`;

const Button = styled.button`
  background: ${({ theme, variant }) => variant === 'secondary' ? '#6c757d' : theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme, variant }) => variant === 'secondary' ? '#5a6268' : theme.colors.secondary};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const AnswersSection = styled.div`
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
`;

const AnswerCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const AnswerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AnswerAuthor = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const AnswerDate = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const AnswerContent = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const VoteButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const VoteButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #f0f0f0;
  }
  
  &.voted {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const NoHelpRequests = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const HelpTypeBadge = styled.span`
  background: ${({ type }) => {
    switch(type) {
      case 'instructor': return '#3498db';
      case 'mentor': return '#27ae60';
      case 'admin': return '#e74c3c';
      case 'students': return '#f39c12';
      default: return '#95a5a6';
    }
  }};
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const Help = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAskModal, setShowAskModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [newHelp, setNewHelp] = useState({
    title: '',
    content: '',
    helpType: '',
    category: '',
    tags: '',
    course: ''
  });

  // Sample data - in real app, this would come from PouchDB
  useEffect(() => {
    const sampleHelpRequests = [
      {
        id: 1,
        title: "I need help understanding JavaScript functions",
        content: "I'm struggling with how functions work in JavaScript. Can someone explain the concept of scope and closures?",
        author: "Ahmed Hassan",
        date: "2024-01-15",
        helpType: "instructor",
        category: "programming",
        tags: ["javascript", "functions", "beginner"],
        answers: [
          {
            id: 1,
            author: "Instructor Sarah",
            date: "2024-01-15",
            content: "Functions are reusable blocks of code. Scope determines where variables are accessible. Let me explain with examples...",
            votes: 8
          },
          {
            id: 2,
            author: "Mentor David",
            date: "2024-01-16",
            content: "Think of functions like recipes. They take ingredients (parameters) and produce a result. Scope is like kitchen rules!",
            votes: 5
          }
        ],
        votes: 12,
        views: 67
      },
      {
        id: 2,
        title: "How to prepare for a job interview?",
        content: "I have my first tech interview next week. What should I prepare and how should I present myself?",
        author: "Fatima Al-Zahra",
        date: "2024-01-14",
        helpType: "mentor",
        category: "career",
        tags: ["interview", "career", "preparation"],
        answers: [
          {
            id: 3,
            author: "Career Mentor Lisa",
            date: "2024-01-14",
            content: "Practice coding problems, prepare your portfolio, research the company, and practice your elevator pitch!",
            votes: 15
          }
        ],
        votes: 18,
        views: 89
      },
      {
        id: 3,
        title: "Technical issue with course platform",
        content: "I can't access the video lectures. The page keeps loading but never plays the content.",
        author: "Omar Khalil",
        date: "2024-01-13",
        helpType: "admin",
        category: "technical",
        tags: ["platform", "video", "technical"],
        answers: [
          {
            id: 4,
            author: "Admin Support",
            date: "2024-01-13",
            content: "This is a known issue. Please try clearing your browser cache or use a different browser. If the problem persists, contact us directly.",
            votes: 3
          }
        ],
        votes: 7,
        views: 45
      }
    ];
    
    setHelpRequests(sampleHelpRequests);
    setFilteredRequests(sampleHelpRequests);
  }, []);

  useEffect(() => {
    let filtered = helpRequests;
    
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(h => h.helpType === filterType);
    }
    
    setFilteredRequests(filtered);
  }, [helpRequests, searchTerm, filterType]);

  const handleAskHelp = () => {
    setShowAskModal(true);
  };

  const handleSubmitHelp = () => {
    if (!newHelp.title || !newHelp.content || !newHelp.helpType) return;
    
    // Create a ticket instead of a help request
    const ticket = {
      id: Date.now(), // Simple ID generation
      title: newHelp.title,
      content: newHelp.content,
      author: "Current User", // In real app, get from auth
      email: "user@example.com", // In real app, get from auth
      date: new Date().toISOString().split('T')[0],
      status: "open",
      priority: "medium", // Could be determined by category or user selection
      category: newHelp.category,
      tags: newHelp.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      assignedTo: newHelp.helpType, // This determines who gets the ticket
      course: newHelp.course || null
    };
    
    // In real app, this would save to PouchDB
    console.log('Creating ticket:', ticket);
    
    // Show success message
    alert(`Your help request has been submitted and assigned to ${newHelp.helpType}. You will receive an email notification when it's resolved.`);
    
    setNewHelp({ title: '', content: '', helpType: '', category: '', tags: '', course: '' });
    setShowAskModal(false);
  };

  const handleHelpClick = (help) => {
    setSelectedHelp(help);
    setShowHelpModal(true);
  };

  const handleVote = (helpId, answerId = null) => {
    // In real app, this would update PouchDB
    console.log('Vote registered:', { helpId, answerId });
  };

  return (
    <Container>
      <Title>Help Center</Title>
      <Subtitle>
        Get help from instructors, mentors, administrators, or fellow students
      </Subtitle>

      <HelpHeader>
        <AskHelpButton onClick={handleAskHelp}>
          + Ask for Help
        </AskHelpButton>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <SearchInput
            placeholder="Search help requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Help Types</option>
            <option value="instructor">Instructor Help</option>
            <option value="mentor">Mentor Help</option>
            <option value="admin">Admin Support</option>
            <option value="students">Student Help</option>
          </FilterSelect>
        </div>
      </HelpHeader>

      <HelpRequestsList>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(help => (
            <HelpCard key={help.id} onClick={() => handleHelpClick(help)}>
              <HelpCardHeader>
                <HelpTitle>{help.title}</HelpTitle>
                <HelpTypeBadge type={help.helpType}>
                  {help.helpType.charAt(0).toUpperCase() + help.helpType.slice(1)}
                </HelpTypeBadge>
              </HelpCardHeader>
              
              <HelpMeta>
                <span>By {help.author}</span>
                <span>• {help.date}</span>
                <span>• {help.category}</span>
              </HelpMeta>
              
              <HelpContent>
                {help.content.length > 150 
                  ? `${help.content.substring(0, 150)}...` 
                  : help.content
                }
              </HelpContent>
              
              <HelpTags>
                {help.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </HelpTags>
              
              <HelpStats>
                <Stat>
                  <span>👁️</span>
                  <span>{help.views} views</span>
                </Stat>
                <Stat>
                  <span>💬</span>
                  <span>{help.answers.length} answers</span>
                </Stat>
                <Stat>
                  <span>👍</span>
                  <span>{help.votes} votes</span>
                </Stat>
              </HelpStats>
            </HelpCard>
          ))
        ) : (
          <NoHelpRequests>
            <h3>No help requests found</h3>
            <p>Be the first to ask for help or try adjusting your search filters.</p>
          </NoHelpRequests>
        )}
      </HelpRequestsList>

      {/* Ask Help Modal */}
      {showAskModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Ask for Help</ModalTitle>
            
            <Input
              placeholder="Help request title"
              value={newHelp.title}
              onChange={(e) => setNewHelp({...newHelp, title: e.target.value})}
            />
            
            <TextArea
              placeholder="Describe your problem or question in detail..."
              value={newHelp.content}
              onChange={(e) => setNewHelp({...newHelp, content: e.target.value})}
            />
            
            <FilterSelect
              value={newHelp.helpType}
              onChange={(e) => setNewHelp({...newHelp, helpType: e.target.value})}
            >
              <option value="">Who should help you?</option>
              <option value="instructor">Instructor (Course-specific questions)</option>
              <option value="mentor">Mentor (Career guidance, advice)</option>
              <option value="admin">Admin (Technical issues, platform problems)</option>
              <option value="students">Students (Peer support, study groups)</option>
            </FilterSelect>
            
            {newHelp.helpType === 'instructor' && (
              <FilterSelect
                value={newHelp.course}
                onChange={(e) => setNewHelp({...newHelp, course: e.target.value})}
              >
                <option value="">Select Course (Optional)</option>
                <option value="Basic English Communication">Basic English Communication</option>
                <option value="Digital Skills Fundamentals">Digital Skills Fundamentals</option>
                <option value="Job Search Strategies">Job Search Strategies</option>
                <option value="Programming Basics">Programming Basics</option>
                <option value="Web Development">Web Development</option>
              </FilterSelect>
            )}
            
            <FilterSelect
              value={newHelp.category}
              onChange={(e) => setNewHelp({...newHelp, category: e.target.value})}
            >
              <option value="">Select Category</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="career">Career</option>
              <option value="technical">Technical</option>
              <option value="language">Language</option>
              <option value="other">Other</option>
            </FilterSelect>
            
            <Input
              placeholder="Tags (comma separated)"
              value={newHelp.tags}
              onChange={(e) => setNewHelp({...newHelp, tags: e.target.value})}
            />
            
            <div>
              <Button onClick={handleSubmitHelp} disabled={!newHelp.title || !newHelp.content || !newHelp.helpType}>
                Submit Help Request
              </Button>
              <Button variant="secondary" onClick={() => setShowAskModal(false)}>
                Cancel
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Help Detail Modal */}
      {showHelpModal && selectedHelp && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{selectedHelp.title}</ModalTitle>
            
            <HelpMeta>
              <span>By {selectedHelp.author}</span>
              <span>• {selectedHelp.date}</span>
              <span>• {selectedHelp.category}</span>
              <HelpTypeBadge type={selectedHelp.helpType}>
                {selectedHelp.helpType.charAt(0).toUpperCase() + selectedHelp.helpType.slice(1)}
              </HelpTypeBadge>
            </HelpMeta>
            
            <HelpContent>{selectedHelp.content}</HelpContent>
            
            <HelpTags>
              {selectedHelp.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </HelpTags>
            
            <AnswersSection>
              <h3>Answers ({selectedHelp.answers.length})</h3>
              
              {selectedHelp.answers.length > 0 ? (
                selectedHelp.answers.map(answer => (
                  <AnswerCard key={answer.id}>
                    <AnswerHeader>
                      <AnswerAuthor>{answer.author}</AnswerAuthor>
                      <AnswerDate>{answer.date}</AnswerDate>
                    </AnswerHeader>
                    
                    <AnswerContent>{answer.content}</AnswerContent>
                    
                    <VoteButtons>
                      <VoteButton onClick={() => handleVote(selectedHelp.id, answer.id)}>
                        👍 {answer.votes}
                      </VoteButton>
                    </VoteButtons>
                  </AnswerCard>
                ))
              ) : (
                <p>No answers yet. Be the first to help!</p>
              )}
            </AnswersSection>
            
            <div>
              <Button variant="secondary" onClick={() => setShowHelpModal(false)}>
                Close
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Help; 