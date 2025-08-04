import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModuleItemContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: ${({ completed }) => completed ? '#f0f9ff' : '#f9fafb'};
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ completed }) => completed ? '#e0f2fe' : '#f3f4f6'};
  }
`;

const ModuleTitle = styled.h3`
  color: #1f2937;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModuleProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #10b981;
  width: ${({ percentage }) => percentage}%;
  transition: width 0.3s ease;
`;

const ExpandIcon = styled.div`
  color: #6b7280;
  transition: transform 0.2s ease;
  transform: ${({ expanded }) => expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ModuleContent = styled.div`
  padding: 0;
  max-height: ${({ expanded }) => expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const ItemList = styled.div`
  padding: 1rem 1.5rem;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f9fafb;
  }
`;

const ItemCheckbox = styled.input`
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:checked {
    background: #10b981;
    border-color: #10b981;
  }
  
  &:hover {
    border-color: #10b981;
  }
`;

const ItemIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type, completed }) => {
    if (completed) return '#10b981';
    switch (type) {
      case 'content': return '#3b82f6';
      case 'video': return '#ef4444';
      case 'file': return '#8b5cf6';
      case 'quiz': return '#f59e0b';
      case 'discussion': return '#06b6d4';
      case 'assessment': return '#84cc16';
      default: return '#6b7280';
    }
  }};
  color: white;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  color: #1f2937;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  text-decoration: ${({ completed }) => completed ? 'line-through' : 'none'};
  opacity: ${({ completed }) => completed ? 0.7 : 1};
`;

const ItemDescription = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const ItemAction = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const CompletionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ completed }) => completed ? '#10b981' : '#6b7280'};
  font-size: 0.75rem;
  font-weight: 500;
`;

const ModuleItemProgress = ({ 
  module, 
  courseId, 
  userProgress, 
  onProgressUpdate,
  isEnrolled = true 
}) => {
  console.log('🎯 ModuleItemProgress - Props received:', {
    moduleId: module._id,
    moduleTitle: module.title,
    userProgress,
    isEnrolled
  });
  const [expanded, setExpanded] = useState(false);
  const [itemProgress, setItemProgress] = useState({});
  const [updating, setUpdating] = useState({});

  // Get module progress for current user
  const moduleProgress = userProgress?.find(p => p.moduleId === module._id);
  const completedItems = moduleProgress?.completedItems || [];

  // Calculate progress percentage
  const totalItems = calculateTotalItems(module);
  const completedCount = completedItems.length;
  const progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const isModuleCompleted = moduleProgress?.completed || false;

  useEffect(() => {
    // Initialize item progress state from existing completion data
    const initialProgress = {};
    completedItems.forEach(key => {
      initialProgress[key] = true;
    });
    setItemProgress(initialProgress);
    
    console.log('🎯 ModuleItemProgress - Initializing progress:', {
      moduleId: module._id,
      moduleTitle: module.title,
      completedItems,
      initialProgress
    });
  }, [completedItems, module._id, module.title]);

  const calculateTotalItems = (module) => {
    let count = 0;
    if (module.description) count++;
    if (module.content) count++;
    if (module.videoUrl) count++;
    if (module.resources) count += module.resources.length;
    if (module.assessments) count += module.assessments.length;
    if (module.quizzes) count += module.quizzes.length;
    if (module.discussions) count += module.discussions.length;
    if (module.contentItems) count += module.contentItems.length;
    return count;
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'content': return '📄';
      case 'video': return '▶️';
      case 'file': return '📎';
      case 'quiz': return '❓';
      case 'discussion': return '💬';
      case 'assessment': return '📝';
      default: return '📄';
    }
  };

  const getItemType = (item, index) => {
    if (item.type) return item.type;
    if (item.url && item.url.includes('youtube')) return 'video';
    if (item.fileName) return 'file';
    if (item.questions) return 'quiz';
    return 'content';
  };

  const handleItemToggle = async (itemType, itemIndex, itemId) => {
    if (!isEnrolled) {
      alert('Please enroll in the course to track your progress');
      return;
    }

    const completionKey = `${itemType}_${itemIndex}`;
    const isCurrentlyCompleted = itemProgress[completionKey] || completedItems.includes(completionKey);
    const newCompleted = !isCurrentlyCompleted;
    
    console.log('🎯 Toggling item completion:', {
      completionKey,
      itemType,
      itemIndex,
      isCurrentlyCompleted,
      newCompleted,
      itemProgress: itemProgress[completionKey],
      completedItems: completedItems.includes(completionKey)
    });
    
    setUpdating(prev => ({ ...prev, [completionKey]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}/modules/${module._id}/items/${itemId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          completed: newCompleted,
          itemType,
          itemIndex
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Item completion updated successfully:', result);
        
        // Update local state
        setItemProgress(prev => ({
          ...prev,
          [completionKey]: newCompleted
        }));
        
        // Update parent component
        if (onProgressUpdate) {
          onProgressUpdate(result.data);
        }
      } else {
        const error = await response.json();
        console.error('❌ Failed to update item completion:', error);
        alert(error.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating item progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [completionKey]: false }));
    }
  };

  const renderModuleItems = () => {
    const items = [];
    let itemIndex = 0;
    
    console.log('🎯 ModuleItemProgress - Rendering items for module:', {
      moduleId: module._id,
      moduleTitle: module.title,
      completedItems,
      itemProgress
    });

    // Module description
    if (module.description) {
      const itemType = 'description';
      const completionKey = `${itemType}_${itemIndex}`;
      const isCompleted = itemProgress[completionKey] || completedItems.includes(completionKey);
      
      items.push(
        <ItemRow key={completionKey}>
          <ItemCheckbox
            type="checkbox"
            checked={isCompleted}
            onChange={() => {
              console.log('🎯 Description checkbox clicked:', { itemType, itemIndex, itemId: 'description' });
              handleItemToggle(itemType, itemIndex, 'description');
            }}
            disabled={updating[completionKey]}
          />
          <ItemIcon type={itemType} completed={isCompleted}>
            📝
          </ItemIcon>
          <ItemInfo>
            <ItemTitle completed={isCompleted}>
              Module Description
            </ItemTitle>
            <ItemDescription>
              Read • Module Overview
            </ItemDescription>
          </ItemInfo>
          <ItemAction>
            <CompletionStatus completed={isCompleted}>
              {isCompleted ? '✓ Completed' : 'Not started'}
            </CompletionStatus>
          </ItemAction>
        </ItemRow>
      );
      itemIndex++;
    }

    // Module content
    if (module.content) {
      const itemType = 'content';
      const completionKey = `${itemType}_${itemIndex}`;
      const isCompleted = itemProgress[completionKey] || completedItems.includes(completionKey);
      
      items.push(
        <ItemRow key={completionKey}>
          <ItemCheckbox
            type="checkbox"
            checked={isCompleted}
            onChange={() => {
              console.log('🎯 Content checkbox clicked:', { itemType, itemIndex, itemId: 'content' });
              handleItemToggle(itemType, itemIndex, 'content');
            }}
            disabled={updating[completionKey]}
          />
          <ItemIcon type={itemType} completed={isCompleted}>
            📄
          </ItemIcon>
          <ItemInfo>
            <ItemTitle completed={isCompleted}>
              Learning Materials
            </ItemTitle>
            <ItemDescription>
              Read • Course Content
            </ItemDescription>
          </ItemInfo>
          <ItemAction>
            <CompletionStatus completed={isCompleted}>
              {isCompleted ? '✓ Completed' : 'Not started'}
            </CompletionStatus>
          </ItemAction>
        </ItemRow>
      );
      itemIndex++;
    }

    // Video content
    if (module.videoUrl) {
      const itemType = 'video';
      const completionKey = `${itemType}_${itemIndex}`;
      const isCompleted = itemProgress[completionKey] || completedItems.includes(completionKey);
      
      items.push(
        <ItemRow key={completionKey}>
          <ItemCheckbox
            type="checkbox"
            checked={isCompleted}
            onChange={() => {
              console.log('🎯 Video checkbox clicked:', { itemType, itemIndex, itemId: 'video' });
              handleItemToggle(itemType, itemIndex, 'video');
            }}
            disabled={updating[completionKey]}
          />
          <ItemIcon type={itemType} completed={isCompleted}>
            ▶️
          </ItemIcon>
          <ItemInfo>
            <ItemTitle completed={isCompleted}>
              {module.videoTitle || 'Video Content'}
            </ItemTitle>
            <ItemDescription>
              Watch • Video Lesson
            </ItemDescription>
          </ItemInfo>
          <ItemAction>
            <CompletionStatus completed={isCompleted}>
              {isCompleted ? '✓ Completed' : 'Not started'}
            </CompletionStatus>
          </ItemAction>
        </ItemRow>
      );
      itemIndex++;
    }

    // Content items
    if (module.contentItems && module.contentItems.length > 0) {
      module.contentItems.forEach((item, idx) => {
        const itemType = getItemType(item, idx);
        // Use array index directly to match ModuleContent and modal
        const completionKey = `${itemType}_${idx}`;
        const isCompleted = itemProgress[completionKey] || completedItems.includes(completionKey);
        
        items.push(
          <ItemRow key={completionKey}>
            <ItemCheckbox
              type="checkbox"
              checked={isCompleted}
              onChange={() => {
                console.log('🎯 Content item checkbox clicked:', { itemType, arrayIndex: idx, itemId: item.id || `item_${idx}` });
                handleItemToggle(itemType, idx, item.id || `item_${idx}`);
              }}
              disabled={updating[completionKey]}
            />
            <ItemIcon type={itemType} completed={isCompleted}>
              {getItemIcon(itemType)}
            </ItemIcon>
            <ItemInfo>
              <ItemTitle completed={isCompleted}>
                {item.title || `Content Item ${idx + 1}`}
              </ItemTitle>
              <ItemDescription>
                {itemType === 'video' ? 'Watch • Video' : 
                 itemType === 'file' ? 'View • File' : 
                 itemType === 'quiz' ? 'Take • Quiz' : 'Read • Article'}
              </ItemDescription>
            </ItemInfo>
            <ItemAction>
              <CompletionStatus completed={isCompleted}>
                {isCompleted ? '✓ Completed' : 'Not started'}
              </CompletionStatus>
            </ItemAction>
          </ItemRow>
        );
        itemIndex++;
      });
    }

    // Quizzes
    if (module.quizzes && module.quizzes.length > 0) {
      module.quizzes.forEach((quiz, idx) => {
        const itemType = 'quiz';
        // Use array index directly to match ModuleContent and modal
        const completionKey = `${itemType}_${idx}`;
        const isCompleted = itemProgress[completionKey] || completedItems.includes(completionKey);
        
        items.push(
          <ItemRow key={completionKey}>
            <ItemCheckbox
              type="checkbox"
              checked={isCompleted}
              onChange={() => {
                console.log('🎯 Quiz checkbox clicked:', { itemType, arrayIndex: idx, quizId: quiz.id || `quiz_${idx}` });
                handleItemToggle(itemType, idx, quiz.id || `quiz_${idx}`);
              }}
              disabled={updating[completionKey]}
            />
            <ItemIcon type={itemType} completed={isCompleted}>
              ❓
            </ItemIcon>
            <ItemInfo>
              <ItemTitle completed={isCompleted}>
                Quiz {idx + 1}: {quiz.title || 'Quiz'}
              </ItemTitle>
              <ItemDescription>
                {quiz.questions?.length || 0} questions • Take Quiz
              </ItemDescription>
            </ItemInfo>
            <ItemAction>
              <CompletionStatus completed={isCompleted}>
                {isCompleted ? '✓ Completed' : 'Not started'}
              </CompletionStatus>
            </ItemAction>
          </ItemRow>
        );
        itemIndex++;
      });
    }

    // Discussions
    if (module.discussions && module.discussions.length > 0) {
      module.discussions.forEach((discussion, idx) => {
        const itemType = 'discussion';
        // Use array index directly to match ModuleContent and modal
        const completionKey = `${itemType}_${idx}`;
        const isCompleted = itemProgress[completionKey] || completedItems.includes(completionKey);
        
        items.push(
          <ItemRow key={completionKey}>
            <ItemCheckbox
              type="checkbox"
              checked={isCompleted}
              onChange={() => {
                console.log('🎯 Discussion checkbox clicked:', { itemType, arrayIndex: idx, discussionId: discussion.id || `discussion_${idx}` });
                handleItemToggle(itemType, idx, discussion.id || `discussion_${idx}`);
              }}
              disabled={updating[completionKey]}
            />
            <ItemIcon type={itemType} completed={isCompleted}>
              💬
            </ItemIcon>
            <ItemInfo>
              <ItemTitle completed={isCompleted}>
                Discussion {idx + 1}: {discussion.title || 'Discussion'}
              </ItemTitle>
              <ItemDescription>
                Participate • Forum Discussion
              </ItemDescription>
            </ItemInfo>
            <ItemAction>
              <CompletionStatus completed={isCompleted}>
                {isCompleted ? '✓ Completed' : 'Not started'}
              </CompletionStatus>
            </ItemAction>
          </ItemRow>
        );
        itemIndex++;
      });
    }

    return items;
  };

  return (
    <ModuleItemContainer>
      <ModuleHeader 
        completed={isModuleCompleted}
        onClick={() => setExpanded(!expanded)}
      >
        <ModuleTitle>
          {module.title}
          {isModuleCompleted && <span style={{ color: '#10b981' }}>✓</span>}
        </ModuleTitle>
        <ModuleProgress>
          <ProgressBar>
            <ProgressFill percentage={progressPercentage} />
          </ProgressBar>
          <span>{completedCount}/{totalItems} items</span>
          <ExpandIcon expanded={expanded}>▼</ExpandIcon>
        </ModuleProgress>
      </ModuleHeader>
      
      <ModuleContent expanded={expanded}>
        <ItemList>
          {renderModuleItems()}
        </ItemList>
      </ModuleContent>
    </ModuleItemContainer>
  );
};

export default ModuleItemProgress; 