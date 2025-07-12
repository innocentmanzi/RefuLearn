# Backend Setup Instructions

## Current Error Fix: "Unexpected token '<'" 

The error you're seeing indicates the backend server is not running. The frontend is receiving HTML (likely a 404 page) instead of JSON from the API.

### Quick Fix - Start the Backend Server

#### For Windows PowerShell Users:
Since `&&` doesn't work in PowerShell, use these commands instead:

```powershell
# Option 1: Navigate then run
cd backend
npm run dev

# Option 2: Use semicolon separator
cd backend; npm run dev

# Option 3: Use cmd instead
cmd /c "cd backend && npm run dev"
```

#### For Command Prompt Users:
```cmd
cd backend && npm run dev
```

#### For Git Bash Users:
```bash
cd backend && npm run dev
```

### Step-by-Step Solution:

1. **Open a new terminal/command prompt**
2. **Navigate to the backend folder**:
   ```
   cd C:\Project\refulearn\backend
   ```
3. **Install dependencies** (if not done already):
   ```
   npm install
   ```
4. **Start the server**:
   ```
   npm run dev
   ```
5. **Wait for the success message**:
   ```
   🚀 API running at: http://localhost:5000
   ```
6. **Refresh your browser** and try editing the course again

### Verification Steps:

1. **Check if backend is running**: Open http://localhost:5000/health in your browser
   - Should show: `{"status":"OK","message":"RefuLearn API is running"}`
   
2. **Check the terminal**: Look for these messages:
   - `✅ Server started on port 5000`
   - `✅ CouchDB connected successfully` (or warning about database)

### Common Issues & Solutions:

#### Issue: "Port already in use"
```bash
# Kill process on port 5000
npx kill-port 5000
# Then restart
npm run dev
```

#### Issue: "Module not found"
```bash
# Reinstall dependencies
npm install
```

#### Issue: CouchDB connection failed
- The server will still start with fallback mode
- You'll see sample data instead of real course data
- Follow the CouchDB setup instructions below

## CouchDB Connection Issue Fix

The "Failed to load course data" error can also be caused by CouchDB connection issues. Here's how to fix it:

### Option 1: Quick Fix - Use Default CouchDB Setup

1. **Install CouchDB** (if not already installed):
   - Download from: https://couchdb.apache.org/
   - Or use Docker: `docker run -d -p 5984:5984 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password apache/couchdb:latest`

2. **Set up CouchDB with default credentials**:
   - Open http://localhost:5984/_utils in your browser
   - Set up admin user: `admin` / `password`
   - Create database: `refulearn`

3. **Create environment file** (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   COUCHDB_URL=http://localhost:5984
   COUCHDB_USER=admin
   COUCHDB_PASSWORD=password
   COUCHDB_DB_NAME=refulearn
   JWT_SECRET=your-secret-key-here
   ```

### Option 2: Alternative Database Setup

If CouchDB continues to have issues, you can:

1. **Use the fallback mode** - The server will now start even without CouchDB
2. **Check CouchDB service** - Ensure it's running on port 5984
3. **Verify credentials** - Make sure username/password are correct

### Testing the Fix

1. Start the backend server: `npm run dev`
2. Check the logs for "CouchDB connected successfully"
3. Try editing a course - you should no longer see "Failed to load course data"

### Common Issues

- **Port 5984 not accessible**: Check if CouchDB is running
- **Authentication failed**: Verify username/password in CouchDB admin panel
- **Database not found**: Create the `refulearn` database manually

### Fallback Mode

The backend now includes fallback handling:
- Server starts even without CouchDB
- Course editing shows sample data when database is unavailable
- Clear error messages indicate connection status

This allows development to continue while database issues are resolved.

## Current Status Check

After starting the backend, you should see:
1. ✅ Server running on port 5000
2. ✅ Health endpoint accessible
3. ⚠️ CouchDB connection (may show warning but server continues)
4. 🎯 Course editing works (with real or sample data) 