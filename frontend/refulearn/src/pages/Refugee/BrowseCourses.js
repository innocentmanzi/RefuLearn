import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContentWrapper from '../../components/ContentWrapper';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem 2.5rem 2rem 2.5rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const HeroSection = styled.div`
  text-align: left;
  margin-bottom: 1rem;
  padding: 0.5rem 0 1rem 0;
`;

const MainTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: 0;
  margin-right: 0;
  line-height: 1.6;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 4rem 1rem 1.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const CategoriesSection = styled.div`
  margin-bottom: 3rem;
`;

const CategoriesTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
`;

const CategoryCard = styled.div`
  background: ${({ bgColor }) => bgColor || 'white'};
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255,255,255,0.3);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const CategoryIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: white;
`;

const CategoryName = styled.h3`
  color: white;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const CourseCount = styled.p`
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0;
  width: 100%;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 600px) {
    max-width: 100%;
    font-size: 0.98rem;
  }
`;

const CourseImage = styled.div`
  height: 160px;
  background: ${({ image }) => image ? `url(${image}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 8px 8px 0 0;
  
  &::before {
    content: ${({ image }) => image ? 'none' : '"📚"'};
    font-size: 3rem;
    opacity: 0.8;
  }
  
  /* Add a loading state */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    opacity: ${({ loading }) => loading ? 1 : 0};
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
`;

const CourseLevel = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ level }) => 
    level === 'Beginner' ? '#4CAF50' :
    level === 'Intermediate' ? '#FFC107' :
    '#F44336'
  };
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const CourseContent = styled.div`
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 180px;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const CourseMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const EnrollButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  width: 100%;
  margin-top: auto;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const BrowseCourses = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);

  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [matchingCategory, setMatchingCategory] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [error, setError] = useState('');

  // Define professional colors for categories
  const getCategoryColor = (index) => {
    const colors = [
      { bg: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', icon: '#2c3e50' }, // Professional dark blue
      { bg: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', icon: '#3498db' }, // Professional blue
      { bg: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', icon: '#27ae60' }, // Professional green
      { bg: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)', icon: '#8e44ad' }, // Professional purple
      { bg: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)', icon: '#e67e22' }, // Professional orange
      { bg: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)', icon: '#16a085' }, // Professional teal
      { bg: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)', icon: '#7f8c8d' }, // Professional gray
      { bg: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)', icon: '#c0392b' }, // Professional red
      { bg: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)', icon: '#d35400' }, // Professional brown-orange
    ];
    return colors[index % colors.length];
  };

  // Fetch courses and categories on component mount with enhanced caching
  // Initialize offline integration service
  useEffect(() => {
    const initializeOfflineService = async () => {
      try {
        console.log('🔧 Initializing offline integration service for BrowseCourses...');
        await offlineIntegrationService.initialize();
        console.log('✅ Offline integration service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize offline integration service:', error);
      }
    };
    
    initializeOfflineService();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        // Check for cached data (10 minutes cache for courses)
        const cachedCourses = localStorage.getItem('courses_cache');
        const cachedCategories = localStorage.getItem('categories_cache');
        const cachedEnrolled = localStorage.getItem('refugee_enrolled_cache');
        const cacheTime = localStorage.getItem('courses_cache_time');
        const now = Date.now();
        
        if (cachedCourses && cachedCategories && cachedEnrolled && cacheTime && (now - parseInt(cacheTime)) < 10 * 60 * 1000) {
          console.log('📱 Using cached courses data');
          setCourses(JSON.parse(cachedCourses));
          setCategories(JSON.parse(cachedCategories));
          setEnrolled(JSON.parse(cachedEnrolled));
          setLoading(false);
          return;
        }

        if (isOnline) {
          try {
            // Fetch courses
            const coursesResponse = await fetch('/api/courses', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            let coursesData, categoriesData, enrolledData;
            
            if (coursesResponse.ok) {
              coursesData = await coursesResponse.json();
              setCourses(coursesData.data?.courses || []);
            }

            // Fetch categories
            const categoriesResponse = await fetch('/api/courses/categories', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (categoriesResponse.ok) {
              categoriesData = await categoriesResponse.json();
              setCategories(categoriesData.data?.categories || []);
            }

            // Fetch enrolled courses
            const enrolledResponse = await fetch('/api/courses/enrolled/courses', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (enrolledResponse.ok) {
              enrolledData = await enrolledResponse.json();
              setEnrolled(enrolledData.data?.courses || []);
              
              // Fetch completion status for enrolled courses
              if (enrolledData.data?.courses && enrolledData.data.courses.length > 0) {
                try {
                  const completionPromises = enrolledData.data.courses.map(async (courseId) => {
                    try {
                      const response = await fetch(`/api/courses/${courseId}/progress`, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        const progressPercentage = data.data?.progressPercentage || 0;
                        const isCompleted = progressPercentage >= 100;
                        console.log(`📊 Course ${courseId} progress: ${progressPercentage}% - ${isCompleted ? '✅ Completed' : '⭕ In Progress'}`);
                        return { courseId, isCompleted, progressPercentage };
                      }
                      return { courseId, isCompleted: false, progressPercentage: 0 };
                    } catch (error) {
                      console.warn(`⚠️ Could not fetch progress for course ${courseId}:`, error);
                      return { courseId, isCompleted: false, progressPercentage: 0 };
                    }
                  });
                  
                  const completionResults = await Promise.all(completionPromises);
                  const newCompletedCourses = completionResults.filter(result => result.isCompleted).map(result => result.courseId);
                  
                  console.log('🔄 Updated completion status:', {
                    totalEnrolled: enrolledData.data.courses.length,
                    completed: newCompletedCourses.length,
                    completionResults: completionResults
                  });
                  
                  setCompletedCourses(newCompletedCourses);
                  localStorage.setItem('refugee_completed_cache', JSON.stringify(newCompletedCourses));
                  
                } catch (error) {
                  console.error('❌ Error fetching completion status:', error);
                }
              }
            }


            
            // Cache the fetched data for 10 minutes
            if (coursesData && categoriesData && enrolledData) {
              localStorage.setItem('courses_cache', JSON.stringify(coursesData.data?.courses || []));
              localStorage.setItem('categories_cache', JSON.stringify(categoriesData.data?.categories || []));
              localStorage.setItem('refugee_enrolled_cache', JSON.stringify(enrolledData.data?.courses || []));
              localStorage.setItem('courses_cache_time', Date.now().toString());
              
              // Store in offline integration service for better offline access
              try {
                await offlineIntegrationService.storeCourses(coursesData.data?.courses || []);
                await offlineIntegrationService.storeCategories(categoriesData.data?.categories || []);
                await offlineIntegrationService.storeEnrolledCourses(enrolledData.data?.courses || []);
                
                // Pre-cache individual course data for offline access
                console.log('🔄 Pre-caching individual course data for offline access...');
                const coursesToCache = coursesData.data?.courses || [];
                
                for (const course of coursesToCache) {
                  try {
                    // Fetch full course data including modules, content, etc.
                    const courseDetailResponse = await fetch(`/api/courses/${course._id}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (courseDetailResponse.ok) {
                      const courseDetailData = await courseDetailResponse.json();
                      if (courseDetailData.success && courseDetailData.data && courseDetailData.data.course) {
                        await offlineIntegrationService.storeCourseData(course._id, courseDetailData.data.course);
                        console.log(`✅ Pre-cached course: ${course.title}`);
                      }
                    }
                  } catch (courseError) {
                    console.warn(`⚠️ Failed to pre-cache course ${course._id}:`, courseError);
                  }
                }
                
                console.log(`✅ Pre-cached ${coursesToCache.length} courses for offline access`);
              } catch (offlineError) {
                console.warn('⚠️ Failed to store data in offline service:', offlineError);
              }
            }

          } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            });
            setError(`Failed to load courses and categories: ${error.message}`);
          }
        } else {
          // Offline mode - load from offline integration service first, then localStorage fallback
          console.log('📱 Offline mode - loading cached data from offline service');
          
          try {
            // Try offline integration service first
            const cachedCourses = await offlineIntegrationService.getCourses();
            const cachedCategories = await offlineIntegrationService.getCategories();
            const cachedEnrolled = await offlineIntegrationService.getEnrolledCourses();
            
            if (cachedCourses && cachedCourses.length > 0) {
              setCourses(cachedCourses);
              console.log('📦 Loaded courses from offline service:', cachedCourses.length);
            }
            
            if (cachedCategories && cachedCategories.length > 0) {
              setCategories(cachedCategories);
              console.log('📦 Loaded categories from offline service:', cachedCategories.length);
            }
            
            if (cachedEnrolled && cachedEnrolled.length > 0) {
              setEnrolled(cachedEnrolled);
              console.log('📦 Loaded enrolled courses from offline service:', cachedEnrolled.length);
            }
            
            // Check if we got data from offline service
            if ((!cachedCourses || cachedCourses.length === 0) && 
                (!cachedCategories || cachedCategories.length === 0) && 
                (!cachedEnrolled || cachedEnrolled.length === 0)) {
              console.log('⚠️ No data from offline service, trying localStorage fallback...');
              
              // Fallback to localStorage
              const localStorageCourses = localStorage.getItem('courses_cache');
              const localStorageCategories = localStorage.getItem('categories_cache');
              const localStorageEnrolled = localStorage.getItem('refugee_enrolled_cache');
              const localStorageCompleted = localStorage.getItem('refugee_completed_cache');

              if (localStorageCourses) {
                setCourses(JSON.parse(localStorageCourses));
              }
              if (localStorageCategories) {
                setCategories(JSON.parse(localStorageCategories));
              }
              if (localStorageEnrolled) {
                setEnrolled(JSON.parse(localStorageEnrolled));
              }
              // Skip loading cached completion data to force fresh fetch
              // if (localStorageCompleted) {
              //   setCompletedCourses(JSON.parse(localStorageCompleted));
              // }
            }
            
          } catch (offlineError) {
            console.error('❌ Error loading from offline service:', offlineError);
            
            // Fallback to localStorage if offline service fails
            const cachedCourses = localStorage.getItem('courses_cache');
            const cachedCategories = localStorage.getItem('categories_cache');
            const cachedEnrolled = localStorage.getItem('refugee_enrolled_cache');
            const cachedCompleted = localStorage.getItem('refugee_completed_cache');

            if (cachedCourses) {
              setCourses(JSON.parse(cachedCourses));
            }
            if (cachedCategories) {
              setCategories(JSON.parse(cachedCategories));
            }
            if (cachedEnrolled) {
              setEnrolled(JSON.parse(cachedEnrolled));
            }
            // Skip loading cached completion data to force fresh fetch
            // if (cachedCompleted) {
            //   setCompletedCourses(JSON.parse(cachedCompleted));
            // }
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Force refresh completion data on mount to ensure correct status
    const forceRefreshCompletionData = async () => {
      console.log('🔄 Force refreshing completion data on mount...');
      try {
        const token = localStorage.getItem('token');
        if (token && navigator.onLine) {
          const enrolledResponse = await fetch('/api/courses/enrolled', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (enrolledResponse.ok) {
            const enrolledData = await enrolledResponse.json();
            
            if (enrolledData.data?.courses && enrolledData.data.courses.length > 0) {
              const completionPromises = enrolledData.data.courses.map(async (courseId) => {
                try {
                  const response = await fetch(`/api/courses/${courseId}/progress`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    const progressPercentage = data.data?.progressPercentage || 0;
                    const isCompleted = progressPercentage >= 100;
                    console.log(`📊 Course ${courseId} progress: ${progressPercentage}% - ${isCompleted ? '✅ Completed' : '⭕ In Progress'}`);
                    return { courseId, isCompleted, progressPercentage };
                  }
                  return { courseId, isCompleted: false, progressPercentage: 0 };
                } catch (error) {
                  console.warn(`⚠️ Could not fetch progress for course ${courseId}:`, error);
                  return { courseId, isCompleted: false, progressPercentage: 0 };
                }
              });
              
              const completionResults = await Promise.all(completionPromises);
              const newCompletedCourses = completionResults.filter(result => result.isCompleted).map(result => result.courseId);
              
              console.log('🔄 Mount completion status:', {
                totalEnrolled: enrolledData.data.courses.length,
                completed: newCompletedCourses.length,
                completionResults: completionResults
              });
              
              setCompletedCourses(newCompletedCourses);
              localStorage.setItem('refugee_completed_cache', JSON.stringify(newCompletedCourses));
            }
          }
        }
      } catch (error) {
        console.error('❌ Error refreshing completion data on mount:', error);
      }
    };
    
    // TEMPORARILY DISABLED: Force refresh completion data on mount to ensure correct status
    // setTimeout(forceRefreshCompletionData, 1000);
    console.log('🚫 Disabled forceRefreshCompletionData - keeping completedCourses empty');
  }, []);



  // Search courses when search term changes
  useEffect(() => {
    const searchCourses = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let searchResults = [];

        if (isOnline) {
          try {
            // Try online search first (preserving existing behavior)
            console.log('🌐 Online search for:', search);
            const response = await fetch(`/api/courses?search=${encodeURIComponent(search)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              // Backend returns: { success: true, data: { courses: [...] } }
              searchResults = data.data?.courses || [];
              
              // Store search results for offline use
              try {
                await offlineIntegrationService.storeSearchResults(search, searchResults);
              } catch (storeError) {
                console.warn('⚠️ Failed to store search results offline:', storeError);
              }
            } else {
              console.error('Search failed:', response.status);
              // Fall back to offline search
              searchResults = await performOfflineSearch(search);
            }
          } catch (error) {
            console.error('Online search error:', error);
            // Fall back to offline search
            searchResults = await performOfflineSearch(search);
          }
        } else {
          // Offline search
          console.log('📴 Offline search for:', search);
          searchResults = await performOfflineSearch(search);
        }

        setSearchResults(searchResults);
      } catch (err) {
        console.error('Error searching courses:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    // Helper function for offline search
    const performOfflineSearch = async (searchTerm) => {
      try {
        const offlineCourses = await offlineIntegrationService.getCourses() || [];
        const searchLower = searchTerm.toLowerCase();
        
        return offlineCourses.filter(course => 
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.category?.toLowerCase().includes(searchLower)
        );
      } catch (error) {
        console.error('❌ Offline search failed:', error);
        return [];
      }
    };

    const timeoutId = setTimeout(searchCourses, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Preload course images when courses are loaded
  useEffect(() => {
    if (courses && courses.length > 0) {
      console.log('🖼️ Preloading course images...');
      courses.forEach(course => {
        const courseImage = course.course_profile_picture || course.image;
        if (courseImage) {
          setImageLoadingStates(prev => ({ ...prev, [course._id]: true }));
          const validatedUrl = validateCourseImageUrl(courseImage);
          if (validatedUrl) {
            preloadImage(validatedUrl)
              .then(() => {
                console.log(`✅ Image preloaded for course: ${course.title}`);
                setImageLoadingStates(prev => ({ ...prev, [course._id]: false }));
              })
              .catch(error => {
                console.error(`❌ Failed to preload image for course: ${course.title}`, error);
                setImageLoadingStates(prev => ({ ...prev, [course._id]: false }));
              });
          }
        }
      });
    }
  }, [courses]);

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEnrolled(prev => [...prev, courseId]);
        alert('Successfully enrolled in course!');
      } else {
        const errorData = await response.json();
        // Check if user is already enrolled
        if (errorData.message && errorData.message.includes('Already enrolled')) {
          // Update local state to reflect enrollment status
          setEnrolled(prev => [...prev, courseId]);
          alert('You are already enrolled in this course!');
        } else {
          alert(errorData.message || 'Failed to enroll in course');
        }
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in course');
    }
  };

  // Calculate course counts for each category
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: courses.filter(course => course.category === category.name).length
  }));

  // Debug: Log summary of data and counts
  console.log('🔢 Data Summary:', {
    totalCourses: courses.length,
    totalCategories: categories.length,
    firstCourse: courses[0]?.title || 'None',
    firstCategory: categories[0]?.name || 'None',
    categoriesWithCourses: categoriesWithCounts.filter(cat => cat.count > 0).length
  });
  
  if (courses.length > 0 && categories.length > 0) {
    console.log('📊 Category Counts:', categoriesWithCounts.map(cat => `${cat.name}: ${cat.count}`));
  }

  // Find matching category if no course matches
  const foundMatchingCategory = categories.find(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handler for viewing more details about a course
  const handleViewMore = (course) => {
    navigate(`/courses/${course._id}/overview`, { state: course });
  };

  // Manual test function to check completion status
  window.testCompletionStatus = async () => {
    console.log('🧪 Manual completion status test');
    const token = localStorage.getItem('token');
    const enrolledCourses = enrolled;
    
            console.log('🔍 Current enrolled courses:', enrolledCourses);
    
    for (const courseId of enrolledCourses) {
      try {
        console.log(`🔍 Testing completion for course: ${courseId}`);
        const response = await fetch(`/api/courses/${courseId}/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 Course ${courseId} progress:`, data);
          const progressPercentage = data.data?.progressPercentage || 0;
          const isCompleted = progressPercentage >= 100; // Changed from 95 to 100
          console.log(`✅ Course ${courseId} - Progress: ${progressPercentage}%, Completed: ${isCompleted}`);
        } else {
          console.error(`❌ Failed to fetch progress for course ${courseId}:`, response.status);
        }
      } catch (error) {
        console.error(`❌ Error testing course ${courseId}:`, error);
      }
    }
  };

  // Manual refresh function to re-fetch completion status
  window.refreshCompletionStatus = async () => {
    console.log('🔄 Manual refresh of completion status');
    const token = localStorage.getItem('token');
    const enrolledCourses = enrolled;
    
    if (enrolledCourses.length === 0) {
      console.log('❌ No enrolled courses to check');
      return;
    }
    
    try {
      const completionPromises = enrolledCourses.map(async (courseId) => {
        try {
          const response = await fetch(`/api/courses/${courseId}/progress`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const progressPercentage = data.data?.progressPercentage || 0;
            const isCompleted = progressPercentage >= 100; // Changed from 95 to 100
            return { courseId, isCompleted, progressPercentage };
          }
          return { courseId, isCompleted: false, progressPercentage: 0 };
        } catch (error) {
          console.warn(`⚠️ Could not fetch progress for course ${courseId}:`, error);
          return { courseId, isCompleted: false, progressPercentage: 0 };
        }
      });
      
      const completionResults = await Promise.all(completionPromises);

      
      console.log('✅ Completion status refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing completion status:', error);
    }
  };

  // Test function to check course images
  window.testCourseImages = () => {
    console.log('🖼️ Testing course images...');
    const courseCards = document.querySelectorAll('.CourseImage');
    courseCards.forEach((card, index) => {
      const style = window.getComputedStyle(card);
      const backgroundImage = style.backgroundImage;
      console.log(`🖼️ Course card ${index + 1}:`, {
        backgroundImage,
        hasImage: backgroundImage !== 'none' && !backgroundImage.includes('linear-gradient')
      });
    });
  };

  // Debug function to test course image URLs
  window.debugCourseImages = async () => {
    console.log('🔍 Debugging course images...');
    if (courses && courses.length > 0) {
      courses.forEach((course, index) => {
        const courseImage = course.course_profile_picture || course.image;
        const validatedUrl = validateCourseImageUrl(courseImage);
        console.log(`🔍 Course ${index + 1} (${course.title}):`, {
          originalImage: courseImage,
          validatedUrl,
          hasImage: !!courseImage,
          isSupabaseUrl: courseImage && courseImage.includes('supabase.co')
        });
        
        // Test if the image URL is accessible
        if (validatedUrl) {
          fetch(validatedUrl, { method: 'HEAD' })
            .then(response => {
              console.log(`✅ Image ${index + 1} accessible:`, response.status, response.statusText);
            })
            .catch(error => {
              console.error(`❌ Image ${index + 1} not accessible:`, error.message);
            });
        }
      });
    } else {
      console.log('❌ No courses available for debugging');
    }
  };



  // Function to validate and fix course image URLs
  const validateCourseImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path, try to construct the full URL
    if (imageUrl.startsWith('/')) {
      // This might be a local path, try to construct the full URL
      const baseUrl = window.location.origin;
      return `${baseUrl}${imageUrl}`;
    }
    
    // If it's a Supabase URL without protocol, add https
    if (imageUrl.includes('supabase.co') && !imageUrl.startsWith('http')) {
      return `https://${imageUrl}`;
    }
    
    return imageUrl;
  };

  // Function to get a reliable course image URL with fallbacks
  const getCourseImageUrl = (course) => {
    const courseImage = course.course_profile_picture || course.image;
    const validatedUrl = validateCourseImageUrl(courseImage);
    
    // Default fallback images based on category
    const fallbackImages = {
      'Business': 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Technology': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'default': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    };
    
    const fallbackImage = fallbackImages[course.category] || fallbackImages.default;
    
    return validatedUrl || fallbackImage;
  };

  // Function to preload and validate image
  const preloadImage = (imageUrl) => {
    return new Promise((resolve, reject) => {
      if (!imageUrl) {
        reject(new Error('No image URL provided'));
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(imageUrl);
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });
  };

  if (loading) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>{t('courses.loading', 'Loading courses...')}</div>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            <div>{error}</div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Container>
        <HeroSection>
                  <MainTitle>{t('courses.whatToLearn', 'What do you want to learn?')}</MainTitle>
        <Subtitle>{t('courses.growSkills', 'Grow your skills with the most reliable online courses and certifications')}</Subtitle>
          <SearchContainer>
            <SearchInput
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
                              placeholder={t('courses.searchPlaceholder', 'Search for courses, skills, or topics...')}
            />
          </SearchContainer>
          

          

        </HeroSection>



        {search.trim() ? (
          <>
            {searchLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div>{t('courses.searching', 'Searching courses...')}</div>
              </div>
            ) : searchResults.length > 0 ? (
              <CourseGrid>
                {searchResults.map(course => {
                  // Get reliable course image URL with fallbacks
                  const imageUrl = getCourseImageUrl(course);
                  
                  // Add cache-busting parameter to force image reload
                  const finalImageUrl = `${imageUrl}?t=${Date.now()}`;
                  
                  console.log('🎨 Course image data:', {
                    courseId: course._id,
                    courseTitle: course.title,
                    course_profile_picture: course.course_profile_picture,
                    course_image: course.image,
                    finalImage: finalImageUrl
                  });
                  
                  return (
                    <CourseCard key={course._id}>
                      <CourseImage 
                        image={finalImageUrl}
                        loading={imageLoadingStates[course._id] || false}
                        onError={(e) => {
                          console.error('❌ BrowseCourses image failed to load:', finalImageUrl);
                          e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                          setImageLoadingStates(prev => ({ ...prev, [course._id]: false }));
                        }}
                        onLoad={(e) => {
                          console.log('✅ BrowseCourses image loaded successfully:', finalImageUrl);
                          setImageLoadingStates(prev => ({ ...prev, [course._id]: false }));
                        }}
                      >
                        <CourseLevel level={course.level || course.difficult_level}>{course.level || course.difficult_level}</CourseLevel>
                      </CourseImage>
                      <CourseContent>
                        <CourseTitle>{course.title}</CourseTitle>
                        <CourseDescription>
                          {course.description || course.overview || `Learn ${course.category || 'new skills'} in this comprehensive course designed for ${course.level || 'beginner'} level students.`}
                        </CourseDescription>
                        <CourseMeta>
                          <span>{course.duration}</span>
                          <span>{course.students || 0}+ students</span>
                        </CourseMeta>
                        <div style={{ margin: '0.5rem 0', color: '#888', fontSize: '0.95rem' }}>
                          Category: <b>{course.category}</b>
                        </div>
                        {(() => {
                          const isEnrolled = enrolled.includes(course._id);
                          console.log(`🔍 Course "${course.title}" (${course._id}):`, {
                            isEnrolled,
                            enrolledCourses: enrolled
                          });
                          return null;
                        })()}
                        {enrolled.includes(course._id) ? (
                          (() => {
                            // Check if course is completed
                            const isCompleted = completedCourses.includes(course._id);
                            console.log(`🎯 Course "${course.title}" (${course._id}) completion check:`, {
                              isCompleted: isCompleted,
                              completedCourses: completedCourses,
                              courseId: course._id,
                              isInCompletedArray: isCompleted
                            });
                            
                            return (
                              <EnrollButton 
                                style={{ background: isCompleted ? '#10b981' : '#27ae60' }} 
                                onClick={() => handleViewMore(course)}
                              >
                                {isCompleted ? '✅ Course Completed' : 'Continue Learning'}
                              </EnrollButton>
                            );
                          })()
                        ) : (
                          <EnrollButton onClick={() => handleEnroll(course._id)}>
                            Enroll Now
                          </EnrollButton>
                        )}
                      </CourseContent>
                    </CourseCard>
                  );
                })}
              </CourseGrid>
            ) : foundMatchingCategory ? (
              <div style={{ margin: '2rem 0', color: '#666', fontSize: '1.1rem' }}>
                No course found, but you can explore the <b>{foundMatchingCategory.name}</b> category.
                <br />
                <button
                  style={{
                    marginTop: '1rem',
                    background: '#3498db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                  onClick={() => navigate(`/courses/category/${encodeURIComponent(foundMatchingCategory.name)}`)}
                >
                  Go to {foundMatchingCategory.name}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>{t('courses.noSearchResults', 'No courses or categories found matching your search.')}</p>
              </div>
            )}
          </>
        ) : (
          <CategoriesSection>
            <CategoriesTitle>{t('courses.chooseCategories', 'Choose Categories')}</CategoriesTitle>
            <CategoriesGrid>
              {categoriesWithCounts
                .filter(category => category.count > 0) // Only show categories with courses
                .map((category, index) => {
                const categoryColors = getCategoryColor(index);
                return (
                  <CategoryCard 
                    key={index} 
                    onClick={() => navigate(`/courses/category/${encodeURIComponent(category.name)}`)}
                    bgColor={categoryColors.bg}
                  >
                    <CategoryIcon color={categoryColors.icon}>
                      {category.icon}
                    </CategoryIcon>
                    <CategoryName>{category.name}</CategoryName>
                    <CourseCount>{category.count} {t('courses.courseCount', 'courses')}</CourseCount>
                  </CategoryCard>
                );
              })}
            </CategoriesGrid>
            {categoriesWithCounts.filter(cat => cat.count > 0).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>{t('courses.noCoursesAvailable', 'No courses available yet. Check back later!')}</p>
              </div>
            )}
          </CategoriesSection>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default BrowseCourses;
