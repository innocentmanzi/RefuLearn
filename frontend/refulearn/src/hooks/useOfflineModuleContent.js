import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import offlineModuleContentService from '../services/offlineModuleContentService';

export const useOfflineModuleContent = () => {
  const { courseId, moduleId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize service and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Loading offline module content data...');
        
        // Initialize service
        await offlineModuleContentService.initialize();

        // Load course data
        const course = await offlineModuleContentService.getCourseData(courseId);
        setCourseData(course);

        // Load progress data
        const progress = await offlineModuleContentService.getCourseProgress(courseId, moduleId);
        setProgressData(progress);

        // Load completed items
        const completed = await offlineModuleContentService.getCompletedItems(courseId, moduleId);
        setCompletedItems(completed);

        console.log('✅ Offline module content data loaded:', {
          course: !!course,
          progress: !!progress,
          completedItems: completed.length
        });

      } catch (err) {
        console.error('❌ Error loading offline module content:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId) {
      loadData();
    }
  }, [courseId, moduleId]);

  // Mark item as complete
  const markItemComplete = async (contentType, itemIndex) => {
    try {
      console.log('🎯 Marking item as complete:', { contentType, itemIndex });
      
      const result = await offlineModuleContentService.markItemComplete(
        courseId, 
        moduleId, 
        contentType, 
        itemIndex
      );

      if (result.success) {
        // Refresh completed items
        const updatedCompleted = await offlineModuleContentService.getCompletedItems(courseId, moduleId);
        setCompletedItems(updatedCompleted);
        
        console.log('✅ Item marked as complete:', result);
        return result;
      } else {
        console.error('❌ Failed to mark item as complete:', result);
        return result;
      }
    } catch (err) {
      console.error('❌ Error marking item complete:', err);
      return { success: false, error: err.message };
    }
  };

  // Check if item is completed
  const isItemCompleted = (contentType, itemIndex) => {
    const itemId = `${contentType}-${itemIndex}`;
    return completedItems.includes(itemId);
  };

  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true);
      
      const course = await offlineModuleContentService.getCourseData(courseId);
      const progress = await offlineModuleContentService.getCourseProgress(courseId, moduleId);
      const completed = await offlineModuleContentService.getCompletedItems(courseId, moduleId);
      
      setCourseData(course);
      setProgressData(progress);
      setCompletedItems(completed);
      
      console.log('🔄 Data refreshed successfully');
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    courseData,
    progressData,
    completedItems,
    
    // State
    loading,
    error,
    isOnline,
    
    // Actions
    markItemComplete,
    isItemCompleted,
    refreshData,
    
    // Service
    offlineModuleContentService
  };
}; 