const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

// Test data for the new assessment submission
const testSubmission = {
  assessment: 1,
  attempt_number: 1,
  answers: [
    {
      question: "What is the capital of France?",
      answer: "Paris"
    },
    {
      question: "What is 2 + 2?",
      answer: "4"
    }
  ],
  time_taken: 300 // 5 minutes in seconds
};

async function testAssessmentEndpoints() {
  console.log('🧪 Testing Assessment Submission Endpoints\n');

  try {
    // Test 1: Create assessment submission
    console.log('1. Testing POST /api/assessments/user-submissions');
    const createResponse = await axios.post(
      `${BASE_URL}/api/assessments/user-submissions`,
      testSubmission,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Create submission response:', createResponse.status);
    console.log('Response data:', JSON.stringify(createResponse.data, null, 2));

    const submissionId = createResponse.data.data.submission._id;

    // Test 2: Get all submissions
    console.log('\n2. Testing GET /api/assessments/user-submissions');
    const getResponse = await axios.get(
      `${BASE_URL}/api/assessments/user-submissions`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    console.log('✅ Get submissions response:', getResponse.status);
    console.log('Response data:', JSON.stringify(getResponse.data, null, 2));

    // Test 3: Get specific submission
    console.log('\n3. Testing GET /api/assessments/user-submissions/:id');
    const getSpecificResponse = await axios.get(
      `${BASE_URL}/api/assessments/user-submissions/${submissionId}`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    console.log('✅ Get specific submission response:', getSpecificResponse.status);
    console.log('Response data:', JSON.stringify(getSpecificResponse.data, null, 2));

    // Test 4: Update submission
    console.log('\n4. Testing PUT /api/assessments/user-submissions/:id');
    const updateData = {
      score: 85,
      passed: true
    };
    const updateResponse = await axios.put(
      `${BASE_URL}/api/assessments/user-submissions/${submissionId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Update submission response:', updateResponse.status);
    console.log('Response data:', JSON.stringify(updateResponse.data, null, 2));

    // Test 5: Delete submission
    console.log('\n5. Testing DELETE /api/assessments/user-submissions/:id');
    const deleteResponse = await axios.delete(
      `${BASE_URL}/api/assessments/user-submissions/${submissionId}`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    console.log('✅ Delete submission response:', deleteResponse.status);
    console.log('Response data:', JSON.stringify(deleteResponse.data, null, 2));

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the tests
testAssessmentEndpoints(); 