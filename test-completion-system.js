const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123'
};

let authToken = null;
let testCourseId = null;
let testModuleId = null;

// Helper function to log test results
function logTest(testName, status, details = '') {
  const statusSymbol = status === 'PASS' ? '✅' : '❌';
  console.log(`${statusSymbol} ${testName}${details ? ': ' + details : ''}`);
}

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('\n🔧 Testing Backend Health...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      logTest('Backend Health Check', 'PASS', 'Server is running');
      return true;
    } else {
      logTest('Backend Health Check', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Backend Health Check', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Test 2: User Authentication
async function testAuthentication() {
  console.log('\n🔐 Testing User Authentication...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_USER)
    });
    
    if (response.ok) {
      const data = await response.json();
      authToken = data.token;
      logTest('User Authentication', 'PASS', 'Login successful');
      return true;
    } else {
      const errorData = await response.json();
      logTest('User Authentication', 'FAIL', `Error: ${errorData.message}`);
      return false;
    }
  } catch (error) {
    logTest('User Authentication', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Test 3: Course Access
async function testCourseAccess() {
  console.log('\n📚 Testing Course Access...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const courses = data.data.courses;
      
      if (courses && courses.length > 0) {
        testCourseId = courses[0]._id;
        logTest('Course Access', 'PASS', `Found ${courses.length} courses`);
        return true;
      } else {
        logTest('Course Access', 'FAIL', 'No courses found');
        return false;
      }
    } else {
      logTest('Course Access', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Course Access', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Test 4: Course Enrollment
async function testCourseEnrollment() {
  console.log('\n🎓 Testing Course Enrollment...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/courses/${testCourseId}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok || response.status === 400) {
      // 400 might mean already enrolled, which is fine
      const data = await response.json();
      logTest('Course Enrollment', 'PASS', data.message);
      return true;
    } else {
      logTest('Course Enrollment', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Course Enrollment', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Test 5: Get Course Details and Modules
async function testCourseModules() {
  console.log('\n📋 Testing Course Modules...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/courses/${testCourseId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const course = data.data.course;
      
      if (course.modules && course.modules.length > 0) {
        testModuleId = course.modules[0]._id;
        logTest('Course Modules', 'PASS', `Found ${course.modules.length} modules`);
        console.log('   📖 Module details:', course.modules[0].title);
        return true;
      } else {
        logTest('Course Modules', 'FAIL', 'No modules found');
        return false;
      }
    } else {
      logTest('Course Modules', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Course Modules', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Test 6: Progress Tracking - Initial State
async function testInitialProgress() {
  console.log('\n📊 Testing Initial Progress State...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/courses/${testCourseId}/progress`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Initial Progress', 'PASS', `Progress: ${data.data.progressPercentage}%`);
      console.log('   📈 Completed items:', data.data.allCompletedItems?.length || 0);
      return true;
    } else {
      logTest('Initial Progress', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Initial Progress', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Test 7: Mark Item as Complete
async function testMarkComplete() {
  console.log('\n✅ Testing Mark Item as Complete...');
  
  const completionData = {
    moduleId: testModuleId,
    contentType: 'description',
    itemIndex: 0,
    completionKey: 'description-0',
    completed: true
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/courses/${testCourseId}/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completionData)
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Mark Complete', 'PASS', `New progress: ${data.data.progressPercentage}%`);
      console.log('   📝 Completion data:', data.data.moduleProgress);
      return true;
    } else {
      const errorText = await response.text();
      logTest('Mark Complete', 'FAIL', `Status: ${response.status}, Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    logTest('Mark Complete', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Test 8: Verify Persistence
async function testPersistence() {
  console.log('\n💾 Testing Completion Persistence...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/courses/${testCourseId}/progress`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const hasCompletedItem = data.data.allCompletedItems?.includes('description-0');
      
      if (hasCompletedItem) {
        logTest('Completion Persistence', 'PASS', 'Completion data persisted');
        return true;
      } else {
        logTest('Completion Persistence', 'FAIL', 'Completion data not found');
        console.log('   📊 Available completed items:', data.data.allCompletedItems);
        return false;
      }
    } else {
      logTest('Completion Persistence', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Completion Persistence', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Completion System Tests...');
  console.log('=====================================');
  
  const tests = [
    testBackendHealth,
    testAuthentication,
    testCourseAccess,
    testCourseEnrollment,
    testCourseModules,
    testInitialProgress,
    testMarkComplete,
    testPersistence
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) passedTests++;
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('❌ Test failed with error:', error);
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Completion system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the backend and database.');
  }
}

// Run the tests
runTests().catch(console.error); 