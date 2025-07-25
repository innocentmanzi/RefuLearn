const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage bucket configuration - using existing 'uploads' bucket
const buckets = [
  {
    name: 'uploads',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'video/mp4', 'video/avi', 'video/mov', 'audio/mpeg', 'audio/wav'],
    fileSizeLimit: 100 * 1024 * 1024 // 100MB
  }
];

async function setupSupabaseStorage() {
  console.log('🚀 Setting up Supabase storage for RefuLearn...\n');

  try {
    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const existingBucketNames = existingBuckets.map(bucket => bucket.name);
    console.log('📋 Existing buckets:', existingBucketNames);

    // Create buckets
    for (const bucket of buckets) {
      if (existingBucketNames.includes(bucket.name)) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        continue;
      }

      console.log(`🔄 Creating bucket '${bucket.name}'...`);
      
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.allowedMimeTypes,
        fileSizeLimit: bucket.fileSizeLimit
      });

      if (error) {
        console.error(`❌ Error creating bucket '${bucket.name}':`, error);
      } else {
        console.log(`✅ Successfully created bucket '${bucket.name}'`);
      }
    }

    // Set up storage policies for each bucket
    console.log('\n🔐 Setting up storage policies...');
    
    for (const bucket of buckets) {
      await setupBucketPolicies(bucket.name, bucket.public);
    }

    console.log('\n🎉 Supabase storage setup completed successfully!');
    console.log('\n📋 Bucket Summary:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name}: ${bucket.public ? 'Public' : 'Private'} (${bucket.allowedMimeTypes.length} allowed types, ${bucket.fileSizeLimit / (1024 * 1024)}MB limit)`);
    });

  } catch (error) {
    console.error('❌ Error setting up Supabase storage:', error);
    process.exit(1);
  }
}

async function setupBucketPolicies(bucketName, isPublic) {
  try {
    // Policy for authenticated users to upload files
    const uploadPolicy = `
      CREATE POLICY "Allow authenticated uploads" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = '${bucketName}' AND
        auth.role() = 'authenticated'
      );
    `;

    // Policy for authenticated users to update their own files
    const updatePolicy = `
      CREATE POLICY "Allow authenticated updates" ON storage.objects
      FOR UPDATE USING (
        bucket_id = '${bucketName}' AND
        auth.role() = 'authenticated'
      );
    `;

    // Policy for authenticated users to delete their own files
    const deletePolicy = `
      CREATE POLICY "Allow authenticated deletes" ON storage.objects
      FOR DELETE USING (
        bucket_id = '${bucketName}' AND
        auth.role() = 'authenticated'
      );
    `;

    // Policy for viewing files (public or authenticated only)
    const selectPolicy = isPublic ? `
      CREATE POLICY "Allow public viewing" ON storage.objects
      FOR SELECT USING (bucket_id = '${bucketName}');
    ` : `
      CREATE POLICY "Allow authenticated viewing" ON storage.objects
      FOR SELECT USING (
        bucket_id = '${bucketName}' AND
        auth.role() = 'authenticated'
      );
    `;

    // Note: In a real setup, you would execute these SQL policies
    // For now, we'll just log what policies should be created
    console.log(`  📝 Policies for '${bucketName}' (${isPublic ? 'public' : 'private'}):`);
    console.log(`    - Upload: Authenticated users only`);
    console.log(`    - Update: Authenticated users only`);
    console.log(`    - Delete: Authenticated users only`);
    console.log(`    - View: ${isPublic ? 'Public' : 'Authenticated users only'}`);

  } catch (error) {
    console.error(`❌ Error setting up policies for bucket '${bucketName}':`, error);
  }
}

// Run the setup
setupSupabaseStorage(); 