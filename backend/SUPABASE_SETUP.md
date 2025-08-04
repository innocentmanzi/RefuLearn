# Supabase Storage Setup Guide

This guide will help you set up Supabase storage for file uploads in RefuLearn.

## Prerequisites

1. A Supabase account and project
2. Node.js and npm installed
3. Access to your Supabase project dashboard

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note down your project URL and API keys

## Step 2: Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### How to get your Supabase credentials:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: Use this as `SUPABASE_URL`
   - **anon public**: Use this as `SUPABASE_ANON_KEY`
   - **service_role secret**: Use this as `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

## Step 4: Set Up Storage Buckets

Run the Supabase setup script to create the required storage buckets:

```bash
npm run supabase:setup
```

This will create the following buckets:
- `profiles` - For user profile pictures (public)
- `courses` - For course images (public)
- `documents` - For PDFs and documents (private)
- `certificates` - For certificates (public)
- `resources` - For course resources (private)
- `general` - For general files (private)

## Step 5: Configure Storage Policies

After running the setup script, you'll need to configure storage policies in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Storage > Policies
3. For each bucket, create the following policies:

### For Public Buckets (profiles, courses, certificates):

```sql
-- Allow public viewing
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'bucket-name');

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated updates
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);
```

### For Private Buckets (documents, resources, general):

```sql
-- Allow authenticated viewing
CREATE POLICY "Allow authenticated viewing" ON storage.objects
FOR SELECT USING (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated updates
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);
```

## Step 6: Test the Integration

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Test file uploads through your application

## File Types and Size Limits

The system supports the following file types and size limits:

### Images (profiles, courses)
- **Types**: JPEG, JPG, PNG, GIF, WebP
- **Size Limit**: 5MB
- **Buckets**: profiles, courses

### Documents
- **Types**: PDF, DOC, DOCX, TXT, RTF
- **Size Limit**: 10MB
- **Buckets**: documents

### Videos
- **Types**: MP4, AVI, MOV, WMV, FLV, WebM
- **Size Limit**: 100MB
- **Buckets**: resources

### Audio
- **Types**: MP3, WAV, OGG, AAC
- **Size Limit**: 20MB
- **Buckets**: resources

## Migration from Local Storage

If you're migrating from local file storage:

1. Your existing upload endpoints will continue to work
2. Files will now be stored in Supabase instead of local directories
3. File URLs will point to Supabase storage
4. No changes needed in your frontend code

## Troubleshooting

### Common Issues:

1. **"Missing Supabase configuration"**
   - Ensure all environment variables are set correctly
   - Check that your `.env` file is in the backend directory

2. **"Bucket not found"**
   - Run `npm run supabase:setup` to create buckets
   - Check that bucket names match exactly

3. **"Permission denied"**
   - Ensure storage policies are configured correctly
   - Check that your API keys have the correct permissions

4. **"File type not allowed"**
   - Check that the file type is in the allowed list
   - Verify the file's MIME type

### Getting Help:

- Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review the storage logs in your Supabase dashboard
- Check the backend console for error messages

## Security Notes

- Never commit your `.env` file to version control
- Keep your service role key secure - it has admin privileges
- Use the anon key for public operations only
- Regularly rotate your API keys 