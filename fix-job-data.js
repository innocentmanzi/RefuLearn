const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

async function fixJobData() {
  try {
    console.log('🔍 Checking all jobs in database...');
    
    const result = await db.find({ selector: { type: 'job' } });
    console.log(`📊 Found ${result.docs.length} jobs total`);
    
    for (const job of result.docs) {
      console.log(`\n📋 Job: "${job.title}" (ID: ${job._id})`);
      console.log(`   Company: "${job.company}"`);
      console.log(`   Application Link: "${job.application_link}"`);
      console.log(`   Employer: ${job.employer}`);
      
      let needsUpdate = false;
      const updates = {};
      
      // Check for placeholder company name
      if (!job.company || job.company === 'Company Name' || job.company.trim() === '') {
        updates.company = 'Tech Solutions Inc'; // Replace with actual company name
        needsUpdate = true;
        console.log(`   ⚠️ Company field needs fixing`);
      }
      
      // Check for placeholder application link
      if (!job.application_link || 
          job.application_link.includes('company.com/apply') || 
          job.application_link.includes('email@con') ||
          job.application_link.trim() === '') {
        updates.application_link = 'careers@techsolutions.com'; // Replace with actual contact
        needsUpdate = true;
        console.log(`   ⚠️ Application link field needs fixing`);
      }
      
      if (needsUpdate) {
        // Update the job with real data
        const updatedJob = { ...job, ...updates, updatedAt: new Date() };
        await db.put(updatedJob);
        console.log(`   ✅ Updated job with: ${JSON.stringify(updates)}`);
      } else {
        console.log(`   ✅ Job data looks good`);
      }
    }
    
    console.log('\n🎉 Job data check complete!');
    
  } catch (error) {
    console.error('❌ Error fixing job data:', error);
  }
}

// Run the fix
fixJobData(); 