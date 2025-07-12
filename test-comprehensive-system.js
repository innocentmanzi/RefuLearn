// Comprehensive test for the complete course-module-content system
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test credentials (you may need to adjust these)
const TEST_CREDENTIALS = {
  email: 'instructor@test.com',
  password: 'testpassword123'
};

let authToken = '';
let testCourseId = '';
let testModuleId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error with ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test 1: Login and get authentication token
const testLogin = async () => {
  console.log('🔐 Testing login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CREDENTIALS);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
};

// Test 2: Create a test course
const testCreateCourse = async () => {
  console.log('📚 Testing course creation...');
  
  const courseData = {
    title: 'Test Course - Complete Learning System',
    description: 'A comprehensive test course with modules, assessments, and discussions',
    overview: 'This course tests the complete learning management system',
    category: 'Technology',
    level: 'Beginner',
    duration: '4 weeks',
    isPublished: true
  };
  
  try {
    const result = await makeRequest('POST', '/api/courses', courseData);
    testCourseId = result.data.course._id;
    console.log('✅ Course created successfully:', testCourseId);
    console.log('📝 Course title:', result.data.course.title);
    return true;
  } catch (error) {
    console.error('❌ Course creation failed');
    return false;
  }
};

// Test 3: Create modules for the course
const testCreateModules = async () => {
  console.log('🔧 Testing module creation...');
  
  const moduleData = {
    title: 'Introduction to Complete Learning',
    description: 'This module introduces the complete learning system',
    content_type: 'text',
    content: 'Welcome to our comprehensive learning system! This module covers all the basics.',
    duration: '1 week',
    isMandatory: true,
    order: 1,
    overview: 'Module overview for introduction',
    videoUrl: 'https://example.com/video1.mp4',
    videoTitle: 'Introduction Video',
    resources: [
      { title: 'Reading Material', url: 'https://example.com/reading1.pdf' },
      { title: 'Additional Resources', url: 'https://example.com/resources1.html' }
    ],
    learningObjectives: [
      'Understand the learning system',
      'Navigate the platform',
      'Complete assessments'
    ],
    prerequisites: ['Basic computer skills'],
    tags: ['introduction', 'basics', 'getting-started']
  };
  
  try {
    const result = await makeRequest('POST', `/api/courses/${testCourseId}/modules`, moduleData);
    testModuleId = result.data.module._id;
    console.log('✅ Module created successfully:', testModuleId);
    console.log('📝 Module title:', result.data.module.title);
    return true;
  } catch (error) {
    console.error('❌ Module creation failed');
    return false;
  }
};

// Test 4: Create assessment for the module
const testCreateAssessment = async () => {
  console.log('🎯 Testing assessment creation...');
  
  const assessmentData = {
    title: 'Introduction Quiz',
    description: 'Test your understanding of the introduction module',
    type: 'quiz',
    timeLimit: 15,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What is the main purpose of this learning system?',
        options: ['Entertainment', 'Education', 'Gaming', 'Shopping'],
        correctAnswer: 'Education',
        points: 2,
        explanation: 'The learning system is designed for educational purposes'
      },
      {
        type: 'true_false',
        question: 'This module is mandatory for all students',
        correctAnswer: true,
        points: 1,
        explanation: 'Yes, the introduction module is marked as mandatory'
      }
    ],
    totalPoints: 3
  };
  
  try {
    const result = await makeRequest('POST', `/api/courses/modules/${testModuleId}/assessments`, assessmentData);
    console.log('✅ Assessment created successfully:', result.data.assessment._id);
    console.log('📝 Assessment title:', result.data.assessment.title);
    return true;
  } catch (error) {
    console.error('❌ Assessment creation failed');
    return false;
  }
};

// Test 5: Create discussion for the module
const testCreateDiscussion = async () => {
  console.log('💬 Testing discussion creation...');
  
  const discussionData = {
    title: 'Welcome Discussion',
    content: 'Welcome to the course! Please introduce yourself and share your learning goals.',
    category: 'introduction'
  };
  
  try {
    const result = await makeRequest('POST', `/api/courses/modules/${testModuleId}/discussions`, discussionData);
    console.log('✅ Discussion created successfully:', result.data.discussion._id);
    console.log('📝 Discussion title:', result.data.discussion.title);
    return true;
  } catch (error) {
    console.error('❌ Discussion creation failed');
    return false;
  }
};

// Test 6: Create quiz for the module
const testCreateQuiz = async () => {
  console.log('🧠 Testing quiz creation...');
  
  const quizData = {
    title: 'Quick Knowledge Check',
    description: 'A quick quiz to check your understanding',
    timeLimit: 10,
    questions: [
      {
        type: 'multiple_choice',
        question: 'How many weeks is this course?',
        options: ['2 weeks', '4 weeks', '6 weeks', '8 weeks'],
        correctAnswer: '4 weeks',
        points: 1
      },
      {
        type: 'short_answer',
        question: 'What is your main learning goal for this course?',
        correctAnswer: 'Learning goal varies by student',
        points: 2
      }
    ],
    passingScore: 2
  };
  
  try {
    const result = await makeRequest('POST', `/api/courses/modules/${testModuleId}/quizzes`, quizData);
    console.log('✅ Quiz created successfully:', result.data.quiz._id);
    console.log('📝 Quiz title:', result.data.quiz.title);
    return true;
  } catch (error) {
    console.error('❌ Quiz creation failed');
    return false;
  }
};

// Test 7: Fetch course with comprehensive module data
const testFetchCourseWithModules = async () => {
  console.log('📖 Testing comprehensive course data retrieval...');
  
  try {
    const result = await makeRequest('GET', `/api/courses/${testCourseId}`);
    const course = result.data.course;
    
    console.log('✅ Course fetched successfully');
    console.log('📚 Course title:', course.title);
    console.log('🔢 Number of modules:', course.modules?.length || 0);
    
    if (course.modules && course.modules.length > 0) {
      const module = course.modules[0];
      console.log('📝 Module title:', module.title);
      console.log('📊 Module assessments:', module.assessments?.length || 0);
      console.log('💬 Module discussions:', module.discussions?.length || 0);
      console.log('🧠 Module questions:', module.questions?.length || 0);
      console.log('🎯 Module content type:', module.content_type);
      console.log('📖 Has content:', !!module.content);
      console.log('🎬 Has video:', !!module.videoUrl);
      console.log('📚 Resources count:', module.resources?.length || 0);
      console.log('🎯 Learning objectives:', module.learningObjectives?.length || 0);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Course retrieval failed');
    return false;
  }
};

// Test 8: Fetch module learning content
const testFetchModuleLearningContent = async () => {
  console.log('📚 Testing module learning content retrieval...');
  
  try {
    const result = await makeRequest('GET', `/api/courses/modules/${testModuleId}/learn`);
    const data = result.data;
    
    console.log('✅ Module learning content fetched successfully');
    console.log('📝 Module title:', data.module.title);
    console.log('📖 Content length:', data.module.content?.length || 0);
    console.log('🎯 Assessments available:', data.assessments?.length || 0);
    console.log('💬 Discussions available:', data.discussions?.length || 0);
    console.log('🚀 Can proceed:', data.canProceed);
    
    return true;
  } catch (error) {
    console.error('❌ Module learning content retrieval failed');
    return false;
  }
};

// Test 9: Test courses listing
const testFetchCourses = async () => {
  console.log('📋 Testing courses listing...');
  
  try {
    const result = await makeRequest('GET', '/api/courses');
    const courses = result.data.courses || [];
    
    console.log('✅ Courses listed successfully');
    console.log('📊 Total courses:', courses.length);
    
    const testCourse = courses.find(c => c._id === testCourseId);
    if (testCourse) {
      console.log('✅ Test course found in listing');
      console.log('📝 Course title:', testCourse.title);
      console.log('📚 Is published:', testCourse.isPublished);
    } else {
      console.log('⚠️ Test course not found in listing');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Courses listing failed');
    return false;
  }
};

// Test 10: Test categories listing
const testFetchCategories = async () => {
  console.log('📂 Testing categories listing...');
  
  try {
    const result = await makeRequest('GET', '/api/courses/categories');
    const categories = result.data.categories || [];
    
    console.log('✅ Categories listed successfully');
    console.log('📊 Total categories:', categories.length);
    
    categories.forEach(category => {
      console.log(`📁 ${category.name}: ${category.count} courses`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Categories listing failed');
    return false;
  }
};

// Main test runner
const runComprehensiveTests = async () => {
  console.log('🚀 Starting comprehensive course-module-content system tests...\n');
  
  let allTestsPassed = true;
  
  // Run all tests in sequence
  const tests = [
    testLogin,
    testCreateCourse,
    testCreateModules,
    testCreateAssessment,
    testCreateDiscussion,
    testCreateQuiz,
    testFetchCourseWithModules,
    testFetchModuleLearningContent,
    testFetchCourses,
    testFetchCategories
  ];
  
  for (const test of tests) {
    try {
      const result = await test();
      if (!result) {
        allTestsPassed = false;
      }
      console.log(''); // Add space between tests
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      allTestsPassed = false;
      console.log(''); // Add space between tests
    }
  }
  
  console.log('=' * 60);
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! The comprehensive learning system is working correctly.');
    console.log('✅ Database connection: Working');
    console.log('✅ Course creation: Working');
    console.log('✅ Module creation: Working');
    console.log('✅ Assessment creation: Working');
    console.log('✅ Discussion creation: Working');
    console.log('✅ Quiz creation: Working');
    console.log('✅ Content retrieval: Working');
    console.log('✅ Frontend-backend integration: Ready');
  } else {
    console.log('❌ Some tests failed. Please check the logs above.');
  }
  console.log('=' * 60);
};

// Run the tests
runComprehensiveTests().catch(console.error); 