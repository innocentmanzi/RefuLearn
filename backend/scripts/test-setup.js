// Test script to verify backend setup

// Test script to verify backend setup
async function testSetup() {
  console.log('🧪 Testing RefuLearn Backend Setup...\n');

  // Test 1: Check Node.js version
  console.log('1. Checking Node.js version...');
  const nodeVersion = process.version;
  const requiredVersion = 'v18.0.0';
  
  if (nodeVersion >= requiredVersion) {
    console.log(`✅ Node.js version: ${nodeVersion} (>= ${requiredVersion})`);
  } else {
    console.log(`❌ Node.js version: ${nodeVersion} (required >= ${requiredVersion})`);
    return false;
  }

  // Test 2: Check if TypeScript can compile
  console.log('\n2. Testing TypeScript compilation...');
  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.log('❌ TypeScript compilation failed');
    console.log('   Error:', error.message);
    return false;
  }

  // Test 3: Check dependencies
  console.log('\n3. Checking dependencies...');
  try {
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredDeps = [
      'express', 'nano', 'pouchdb', 'bcryptjs', 'jsonwebtoken', 
      'cors', 'helmet', 'dotenv', 'express-validator'
    ];
    
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      console.log('✅ All required dependencies found');
    } else {
      console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking dependencies:', error.message);
    return false;
  }

  // Test 4: Check environment file
  console.log('\n4. Checking environment configuration...');
  try {
    const fs = require('fs');
    if (fs.existsSync('.env')) {
      console.log('✅ .env file found');
    } else if (fs.existsSync('env.example')) {
      console.log('⚠️  .env file not found, but env.example exists');
      console.log('   Please copy env.example to .env and configure it');
    } else {
      console.log('❌ No environment configuration files found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking environment files:', error.message);
    return false;
  }

  // Test 5: Check source files structure
  console.log('\n5. Checking source files structure...');
  try {
    const fs = require('fs');
    const requiredFiles = [
      'src/index.ts',
      'src/routes/auth.routes.ts',
      'src/middleware/auth.ts',
      'src/config/couchdb.ts'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length === 0) {
      console.log('✅ All required source files found');
    } else {
      console.log(`❌ Missing files: ${missingFiles.join(', ')}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking source files:', error.message);
    return false;
  }

  // Test 6: Test CouchDB connection (optional)
  console.log('\n6. Testing CouchDB connection...');
  
  try {
    const nano = require('nano');
    const couchUrl = process.env.COUCHDB_URL || 'http://localhost:5984';
    const couchUser = process.env.COUCHDB_USER || 'admin';
    const couchPass = process.env.COUCHDB_PASSWORD || 'password';
    
    const couch = nano(couchUrl);
    await couch.auth(couchUser, couchPass);
    
    console.log('✅ CouchDB connection successful');
  } catch (error) {
    console.log('⚠️  CouchDB connection test skipped (requires CouchDB)');
    console.log('   Error:', error.message);
  }

  console.log('\n🎉 Backend setup test completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Copy env.example to .env and configure your environment variables');
  console.log('   2. Install dependencies: npm install');
  console.log('   3. Start CouchDB and Redis services');
  console.log('   4. Run the development server: npm run dev');
  console.log('   5. Test the API endpoints');
  
  return true;
}

// Run the test
testSetup().catch(console.error); 