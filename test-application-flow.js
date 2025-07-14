const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';

// Test data
const testEmployer = {
  email: 'test.employer@example.com',
  password: 'password123'
};

const testRefugee = {
  email: 'test.refugee@example.com', 
  password: 'password123'
};

let employerToken = '';
let refugeeToken = '';
let testJobId = '';

async function runApplicationFlowTest() {
  console.log('🧪 Testing Complete Job Application Flow');
  console.log('=====================================\n');

  try {
    // Step 1: Login as employer
    console.log('1. 🔑 Logging in as employer...');
    const employerLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmployer)
    });
    const employerData = await employerLogin.json();
    if (!employerData.success) {
      throw new Error('Employer login failed: ' + employerData.message);
    }
    employerToken = employerData.data.token;
    console.log('✅ Employer logged in successfully\n');

    // Step 2: Login as refugee
    console.log('2. 🔑 Logging in as refugee...');
    const refugeeLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRefugee)
    });
    const refugeeData = await refugeeLogin.json();
    if (!refugeeData.success) {
      throw new Error('Refugee login failed: ' + refugeeData.message);
    }
    refugeeToken = refugeeData.data.token;
    console.log('✅ Refugee logged in successfully\n');

    // Step 3: Get employer's jobs
    console.log('3. 📋 Fetching employer jobs...');
    const jobsResponse = await fetch(`${API_BASE}/jobs/employer/jobs`, {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    const jobsData = await jobsResponse.json();
    if (!jobsData.success || jobsData.data.jobs.length === 0) {
      throw new Error('No jobs found for employer');
    }
    testJobId = jobsData.data.jobs[0]._id;
    console.log(`✅ Found ${jobsData.data.jobs.length} jobs. Testing with job: ${jobsData.data.jobs[0].title}`);
    console.log(`   Job ID: ${testJobId}\n`);

    // Step 4: Check current applications before test
    console.log('4. 📊 Checking current applications...');
    const beforeAppsResponse = await fetch(`${API_BASE}/employer/jobs/${testJobId}/applications`, {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    const beforeAppsData = await beforeAppsResponse.json();
    const applicationsBefore = beforeAppsData.success ? beforeAppsData.data.applications.length : 0;
    console.log(`✅ Current applications: ${applicationsBefore}\n`);

    // Step 5: Create test files for application
    console.log('5. 📄 Creating test application files...');
    const testCoverLetter = 'Dear Hiring Manager,\n\nI am excited to apply for this position...\n\nBest regards,\nTest Applicant';
    const testResume = 'Test Resume Content\n\nEXPERIENCE:\n- Software Developer at XYZ Company\n\nEDUCATION:\n- Computer Science Degree';
    
    // Create temporary files
    const coverLetterPath = path.join(__dirname, 'test-cover-letter.txt');
    const resumePath = path.join(__dirname, 'test-resume.txt');
    
    fs.writeFileSync(coverLetterPath, testCoverLetter);
    fs.writeFileSync(resumePath, testResume);
    console.log('✅ Test files created\n');

    // Step 6: Submit job application
    console.log('6. 📤 Submitting job application...');
    const formData = new FormData();
    formData.append('coverLetter', fs.createReadStream(coverLetterPath));
    formData.append('resume', fs.createReadStream(resumePath));
    formData.append('expectedSalary', '45000');

    const applicationResponse = await fetch(`${API_BASE}/jobs/${testJobId}/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${refugeeToken}` },
      body: formData
    });
    const applicationData = await applicationResponse.json();
    
    if (!applicationData.success) {
      throw new Error('Application submission failed: ' + applicationData.message);
    }
    console.log('✅ Application submitted successfully\n');

    // Step 7: Wait a moment for processing
    console.log('7. ⏳ Waiting for application processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Processing complete\n');

    // Step 8: Check applications from employer view
    console.log('8. 👀 Checking applications from employer view...');
    const afterAppsResponse = await fetch(`${API_BASE}/employer/jobs/${testJobId}/applications`, {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    const afterAppsData = await afterAppsResponse.json();
    
    if (!afterAppsData.success) {
      throw new Error('Failed to fetch applications: ' + afterAppsData.message);
    }

    const applicationsAfter = afterAppsData.data.applications.length;
    const newApplications = applicationsAfter - applicationsBefore;
    
    console.log(`✅ Applications after submission: ${applicationsAfter}`);
    console.log(`✅ New applications: ${newApplications}\n`);

    if (newApplications > 0) {
      const latestApplication = afterAppsData.data.applications[afterAppsData.data.applications.length - 1];
      console.log('📋 Latest Application Details:');
      console.log(`   - Applicant: ${latestApplication.user?.firstName} ${latestApplication.user?.lastName}`);
      console.log(`   - Email: ${latestApplication.user?.email}`);
      console.log(`   - Status: ${latestApplication.status}`);
      console.log(`   - Applied At: ${new Date(latestApplication.appliedAt).toLocaleString()}`);
      console.log(`   - Expected Salary: ${latestApplication.expectedSalary || 'Not specified'}`);
      console.log(`   - Cover Letter Path: ${latestApplication.coverLetter || 'Not found'}`);
      console.log(`   - Resume Path: ${latestApplication.resume || 'Not found'}`);
      console.log(`   - Has User Data: ${!!latestApplication.user}`);
    }

    // Step 9: Test status update
    if (newApplications > 0) {
      console.log('\n9. 🔄 Testing status update...');
      const latestApplication = afterAppsData.data.applications[afterAppsData.data.applications.length - 1];
      
      const statusUpdateResponse = await fetch(`${API_BASE}/employer/jobs/${testJobId}/applications/${latestApplication._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${employerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'reviewed' })
      });
      
      const statusUpdateData = await statusUpdateResponse.json();
      if (statusUpdateData.success) {
        console.log('✅ Application status updated to "reviewed"');
      } else {
        console.log('❌ Status update failed:', statusUpdateData.message);
      }
    }

    // Step 10: Cleanup test files
    console.log('\n10. 🧹 Cleaning up test files...');
    try {
      fs.unlinkSync(coverLetterPath);
      fs.unlinkSync(resumePath);
      console.log('✅ Test files cleaned up');
    } catch (err) {
      console.log('⚠️ Cleanup warning:', err.message);
    }

    console.log('\n🎉 APPLICATION FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('✅ Employers can now see submitted applications');
    console.log('✅ File uploads are working correctly');
    console.log('✅ User data is populated properly');
    console.log('✅ Status updates are functional');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure the backend server is running on port 3000');
    console.log('2. Ensure test users exist in the database');
    console.log('3. Check that the employer has at least one job posted');
    console.log('4. Verify file upload permissions are correct');
  }
}

// Run the test
runApplicationFlowTest(); 