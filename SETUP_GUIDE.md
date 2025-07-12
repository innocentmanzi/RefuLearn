# RefuLearn Setup Guide - CouchDB & PouchDB Offline-First

## Quick Setup

### 1. Install CouchDB

**Windows:**
```bash
# Download from https://couchdb.apache.org/
# Or use Docker:
docker run -d --name couchdb -p 5984:5984 couchdb:latest
```

**macOS:**
```bash
brew install couchdb
```

**Linux (Ubuntu):**
```bash
sudo apt-get install couchdb
```

### 2. Configure CouchDB

1. Access CouchDB admin interface: http://localhost:5984/_utils/
2. Create admin user: `admin` / `password`
3. Create database: `refulearn`

### 3. Backend Setup

```bash
cd backend
npm install
cp env.example .env
npm run couchdb:setup
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend/refulearn
npm install
npm start
```

## Key Features Implemented

### ✅ Offline-First Architecture
- **PouchDB** for local storage (IndexedDB)
- **CouchDB** for remote storage
- **Automatic sync** when online
- **Works offline** with local data

### ✅ Multilingual Support
- **4 Languages**: English, Kinyarwanda, French, Swahili
- **Language switching** on landing page
- **Persistent language preference**
- **Backend i18n** support

### ✅ Real-time Sync
- **Live replication** between local and remote
- **Conflict resolution** handling
- **Offline queue** for changes
- **Automatic retry** on connection restore

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (instructor)
- `GET /api/courses/:id` - Get course details

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job posting
- `GET /api/jobs/:id` - Get job details

## Database Structure

### CouchDB Documents
```javascript
// User document
{
  "_id": "user_123",
  "type": "user",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "refugee",
  "country": "Syria",
  "city": "Damascus"
}

// Course document
{
  "_id": "course_456",
  "type": "course",
  "title": "Data Analysis Fundamentals",
  "description": "Learn data analysis...",
  "category": "Data Science",
  "level": "Beginner",
  "instructor": "user_789"
}
```

### Design Documents
- `_design/users` - User queries by email, role, country
- `_design/courses` - Course queries by category, level, instructor
- `_design/jobs` - Job queries by category, location, employer

## Frontend Usage

### Language Context
```javascript
import { useLanguage } from './contexts/LanguageContext';

const { t, changeLanguage, currentLanguage } = useLanguage();

// Translate text
const title = t('welcome');

// Change language
changeLanguage('rw'); // Kinyarwanda
```

### PouchDB Operations
```javascript
import db from './pouchdb';

// Get document
const user = await db.get('user_123');

// Save document
await db.put({
  _id: 'course_456',
  type: 'course',
  title: 'New Course'
});

// Query documents
const courses = await db.query('courses/byCategory', {
  key: 'Data Science'
});

// Check online status
const isOnline = await db.isOnline();
```

## Environment Variables

### Backend (.env)
```env
COUCHDB_URL=http://localhost:5984
COUCHDB_USERNAME=admin
COUCHDB_PASSWORD=password
COUCHDB_DATABASE=refulearn
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,rw,fr,sw
```

### Frontend (.env)
```env
REACT_APP_COUCHDB_URL=http://localhost:5984
REACT_APP_COUCHDB_DATABASE=refulearn
REACT_APP_COUCHDB_USERNAME=admin
REACT_APP_COUCHDB_PASSWORD=password
```

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:setup
```

### Frontend Tests
```bash
cd frontend/refulearn
npm test
```

## Deployment

### Production Setup
1. Configure production CouchDB instance
2. Set up SSL certificates
3. Configure environment variables
4. Build and deploy frontend
5. Start backend server

### Docker Deployment
```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **CouchDB Connection Failed**
   - Check if CouchDB is running
   - Verify credentials in .env
   - Check firewall settings

2. **Sync Not Working**
   - Verify CORS settings
   - Check network connectivity
   - Review browser console for errors

3. **Language Not Changing**
   - Clear browser cache
   - Check localStorage
   - Verify translation files

4. **Offline Mode Issues**
   - Check IndexedDB support
   - Verify PouchDB adapters
   - Review sync configuration

## Next Steps

1. **Add more translations** for specific features
2. **Implement conflict resolution** strategies
3. **Add data validation** and sanitization
4. **Set up monitoring** and logging
5. **Add user preferences** for sync settings
6. **Implement data compression** for offline storage 