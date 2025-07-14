import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Article, VideoLibrary, AudioFile, AttachFile, Launch } from '@mui/icons-material';

const Container = styled.div`
  background: #f4f8fb;
  min-height: 100vh;
  padding: 2rem;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  &:hover {
    color: #0056b3;
  }
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ContentIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type }) => 
    type === 'article' ? '#e3f2fd' : 
    type === 'video' ? '#fce4ec' : 
    type === 'audio' ? '#f3e5f5' : 
    '#e8f5e8'
  };
  color: ${({ type }) => 
    type === 'article' ? '#1976d2' : 
    type === 'video' ? '#c2185b' : 
    type === 'audio' ? '#7b1fa2' : 
    '#388e3c'
  };
`;

const ContentInfo = styled.div`
  flex: 1;
`;

const ContentTitle = styled.h1`
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
`;

const ContentMeta = styled.div`
  color: #666;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const UrlDisplay = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  word-break: break-all;
  font-family: monospace;
`;

const UrlLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const UrlLink = styled.a`
  color: #007BFF;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  min-height: 400px;
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const IframeContent = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const ExternalLinkButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  
  &:hover {
    background: #0056b3;
  }
`;

const Description = styled.div`
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const FileInfo = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const ContentItemViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, moduleId, itemIndex } = useParams();
  
  // Get data from location.state (if coming from navigate) or fetch from backend (if coming from window.location.href)
  const { contentItem: stateContentItem, module: stateModule, course: stateCourse, returnUrl: stateReturnUrl } = location.state || {};
  
  const [contentItem, setContentItem] = useState(stateContentItem);
  const [module, setModule] = useState(stateModule);
  const [course, setCourse] = useState(stateCourse);
  const [loading, setLoading] = useState(!stateContentItem);
  const [error, setError] = useState('');
  
  // Get return URL from query params or state
  const urlParams = new URLSearchParams(location.search);
  const returnUrl = urlParams.get('return') || stateReturnUrl || `/courses/${courseId}/overview`;

  // Fetch content item data if not provided via state
  useEffect(() => {
    const fetchContentItemData = async () => {
      if (stateContentItem) {
        // Data already available from state
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          const courseInfo = courseData.data.course;
          setCourse(courseInfo);
          
          // Find the specific module and content item
          const targetModule = courseInfo.modules?.find(m => m._id === moduleId);
          if (targetModule) {
            setModule(targetModule);
            
            const targetContentItem = targetModule.contentItems?.[parseInt(itemIndex)];
            if (targetContentItem) {
              setContentItem(targetContentItem);
            } else {
              setError('Content item not found');
            }
          } else {
            setError('Module not found');
          }
        } else {
          setError('Failed to load course data');
        }
      } catch (err) {
        console.error('Error fetching content item data:', err);
        setError('Failed to load content item');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId && itemIndex !== undefined) {
      fetchContentItemData();
    }
  }, [courseId, moduleId, itemIndex, stateContentItem]);

  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowBack style={{ marginRight: 6 }} /> Back
          </BackButton>
          <ContentTitle>Loading content...</ContentTitle>
        </Header>
      </Container>
    );
  }

  if (error || !contentItem) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowBack style={{ marginRight: 6 }} /> Back
          </BackButton>
          <ContentTitle>{error || 'Content not found'}</ContentTitle>
        </Header>
      </Container>
    );
  }

  const handleBack = () => {
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      navigate(-1);
    }
  };

  const renderContentIcon = () => {
    switch (contentItem.type) {
      case 'article':
        return <Article style={{ fontSize: '2rem' }} />;
      case 'video':
        return <VideoLibrary style={{ fontSize: '2rem' }} />;
      case 'audio':
        return <AudioFile style={{ fontSize: '2rem' }} />;
      case 'file':
        return <AttachFile style={{ fontSize: '2rem' }} />;
      default:
        return <Article style={{ fontSize: '2rem' }} />;
    }
  };

  // Function to convert YouTube URL to embeddable format
  const getEmbeddableUrl = (url) => {
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle shortened YouTube URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // For other URLs, return as is
    return url;
  };

  const renderContent = () => {
    // For URLs (articles, videos)
    if (contentItem.url) {
      const embeddableUrl = getEmbeddableUrl(contentItem.url);
      const isYouTube = contentItem.url.includes('youtube.com') || contentItem.url.includes('youtu.be');
      
      return (
        <div>
          {/* Show the original URL that was uploaded */}
          <UrlDisplay>
            <UrlLabel>Uploaded URL:</UrlLabel>
            <UrlLink href={contentItem.url} target="_blank" rel="noopener noreferrer">
              {contentItem.url}
            </UrlLink>
          </UrlDisplay>
          
          <ExternalLinkButton onClick={() => window.open(contentItem.url, '_blank')}>
            <Launch />
            Open in New Tab
          </ExternalLinkButton>
          
          <IframeContainer>
            <IframeContent 
              src={embeddableUrl}
              title={contentItem.title}
              allowFullScreen
              onError={(e) => {
                console.error('Iframe failed to load:', e);
              }}
            />
          </IframeContainer>
        </div>
      );
    }

    // For uploaded files
    if (contentItem.fileName) {
      return (
        <FileInfo>
          <h3>File: {contentItem.fileName}</h3>
          <p>This file was uploaded as part of the course content.</p>
          <ExternalLinkButton onClick={() => {
            // You can implement file download/view logic here
            alert('File viewing functionality can be implemented here');
          }}>
            <AttachFile />
            View File
          </ExternalLinkButton>
        </FileInfo>
      );
    }

    return (
      <div>
        <p>No content available for this item.</p>
      </div>
    );
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowBack style={{ marginRight: 6 }} /> Back to {course?.title || 'Course'}
        </BackButton>
        
        <ContentHeader>
          <ContentIcon type={contentItem.type}>
            {renderContentIcon()}
          </ContentIcon>
          <ContentInfo>
            <ContentTitle>{contentItem.title}</ContentTitle>
            <ContentMeta>
              <span style={{
                background: contentItem.type === 'article' ? '#e3f2fd' : 
                           contentItem.type === 'video' ? '#fce4ec' : 
                           contentItem.type === 'audio' ? '#f3e5f5' : '#e8f5e8',
                color: contentItem.type === 'article' ? '#1976d2' : 
                       contentItem.type === 'video' ? '#c2185b' : 
                       contentItem.type === 'audio' ? '#7b1fa2' : '#388e3c',
                padding: '0.3rem 0.8rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {contentItem.type}
              </span>
              <span>Module: {module?.title}</span>
            </ContentMeta>
          </ContentInfo>
        </ContentHeader>

        {contentItem.description && (
          <Description>{contentItem.description}</Description>
        )}
      </Header>

      <ContentArea>
        {renderContent()}
      </ContentArea>
    </Container>
  );
};

export default ContentItemViewer; 