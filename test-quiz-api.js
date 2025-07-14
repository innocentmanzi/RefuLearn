const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const ASSESSMENT_ID = 'quiz_175239667689'; // Replace with actual quiz ID from your URL
const COURSE_ID = 'course_175197229806'; // Replace with actual course ID

// Test token - you'll need to get this from your browser's localStorage
// Open browser console and run: localStorage.getItem('token')
const TEST_TOKEN = 'your-token-here'; // Replace with actual token

async function testQuizAPI() {
  console.log('🧪 Testing Quiz API Endpoints\n');
  
  if (TEST_TOKEN === 'your-token-here') {
    console.log('❌ Please update the TEST_TOKEN in this script with a real token from your browser');
    console.log('Open browser console and run: localStorage.getItem("token")');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Direct assessment endpoint
    console.log('🔍 Test 1: Direct assessment endpoint');
    console.log(`URL: ${BASE_URL}/api/assessments/${ASSESSMENT_ID}`);
    
    try {
      const response1 = await axios.get(`${BASE_URL}/api/assessments/${ASSESSMENT_ID}`, { headers });
      console.log('✅ Success - Status:', response1.status);
      console.log('📝 Assessment Data:', JSON.stringify(response1.data, null, 2));
      
      if (response1.data.data?.assessment?.questions) {
        console.log('📋 Questions Found:', response1.data.data.assessment.questions.length);
        response1.data.data.assessment.questions.forEach((q, idx) => {
          console.log(`Question ${idx + 1}:`, {
            text: q.question,
            type: q.type,
            options: q.options,
            optionCount: q.options ? q.options.length : 0
          });
        });
      }
    } catch (error) {
      console.log('❌ Failed - Error:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Course-based assessment endpoint
    console.log('🔍 Test 2: Course-based assessment endpoint');
    console.log(`URL: ${BASE_URL}/api/courses/assessments/${ASSESSMENT_ID}`);
    
    try {
      const response2 = await axios.get(`${BASE_URL}/api/courses/assessments/${ASSESSMENT_ID}`, { headers });
      console.log('✅ Success - Status:', response2.status);
      console.log('📝 Assessment Data:', JSON.stringify(response2.data, null, 2));
    } catch (error) {
      console.log('❌ Failed - Error:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Course endpoint (to see quiz in modules)
    console.log('🔍 Test 3: Course endpoint');
    console.log(`URL: ${BASE_URL}/api/courses/${COURSE_ID}`);
    
    try {
      const response3 = await axios.get(`${BASE_URL}/api/courses/${COURSE_ID}`, { headers });
      console.log('✅ Success - Status:', response3.status);
      console.log('📝 Course Data Keys:', Object.keys(response3.data.data?.course || {}));
      
      const course = response3.data.data?.course;
      if (course?.modules) {
        console.log('📚 Modules Found:', course.modules.length);
        course.modules.forEach((module, idx) => {
          console.log(`Module ${idx + 1}: ${module.title}`);
          if (module.quizzes) {
            console.log(`  Quizzes (${module.quizzes.length}):`);
            module.quizzes.forEach((quiz, qIdx) => {
              console.log(`    Quiz ${qIdx + 1}: ${quiz.title} (ID: ${quiz._id})`);
              if (quiz._id === ASSESSMENT_ID) {
                console.log('    🎯 FOUND MATCHING QUIZ!');
                console.log('    Questions:', quiz.questions?.length || 0);
                if (quiz.questions) {
                  quiz.questions.forEach((q, qNum) => {
                    console.log(`      Q${qNum + 1}: ${q.question} (Type: ${q.type})`);
                  });
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.log('❌ Failed - Error:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Check available assessment endpoints
    console.log('🔍 Test 4: List all assessments');
    console.log(`URL: ${BASE_URL}/api/assessments`);
    
    try {
      const response4 = await axios.get(`${BASE_URL}/api/assessments`, { headers });
      console.log('✅ Success - Status:', response4.status);
      console.log('📝 Assessments:', response4.data.data?.assessments?.length || 0);
    } catch (error) {
      console.log('❌ Failed - Error:', error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ General Error:', error.message);
  }
}

// Instructions for running this test
console.log('📋 Instructions:');
console.log('1. Update TEST_TOKEN with a real token from your browser');
console.log('2. Update ASSESSMENT_ID and COURSE_ID with actual IDs from your quiz URL');
console.log('3. Make sure backend server is running on localhost:5000');
console.log('4. Run: node test-quiz-api.js\n');

if (require.main === module) {
  testQuizAPI();
}

module.exports = { testQuizAPI }; 