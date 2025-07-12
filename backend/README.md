# RefuLearn Backend API

A comprehensive Node.js/TypeScript backend API for the RefuLearn platform, designed to support refugee education and skill development.

## Features

- **Multi-role Authentication**: Support for refugee, instructor, admin, and employer roles
- **Course Management**: Complete CRUD operations for courses with enrollment tracking
- **Job Portal**: Job posting, application, and management system
- **Assessment System**: Quiz creation, submission, and grading
- **Certificate Management**: Digital certificate issuance and verification
- **Help Desk**: Support ticket system with assignment and tracking
- **Peer Learning**: Group-based collaborative learning features
- **Scholarship Management**: Scholarship posting and application system
- **Real-time Notifications**: Real-time notifications
- **File Upload**: Secure file upload with AWS S3 integration
- **Caching**: Redis-based caching for improved performance
- **Comprehensive Logging**: Winston-based logging system
- **Multi-language Support**: Support for multiple languages (EN, FR, RW, SW)

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: CouchDB with PouchDB client
- **Cache**: Redis
- **Authentication**: JWT
- **File Upload**: Multer + AWS S3
- **Real-time**: Socket.IO
- **Validation**: Express-validator
- **Logging**: Winston
- **Testing**: Jest

## Prerequisites

- Node.js 18+ 
- CouchDB 3+
- Redis 6+
- AWS S3 bucket (for file uploads)
- SMTP server (for email notifications)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd refulearn/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   COUCHDB_URL=http://localhost:5984
   COUCHDB_USER=admin
   COUCHDB_PASSWORD=password
   COUCHDB_DB_NAME=refulearn
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=refulearn-uploads
   
   # Redis Configuration
   REDIS_URL=redis://localhost:6379
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "refugee",
  "country": "Syria",
  "city": "Damascus"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### GET `/api/auth/me`
Get current user profile

#### POST `/api/auth/logout`
Logout user

#### POST `/api/auth/forgot-password`
Request password reset
```json
{
  "email": "john@example.com"
}
```

### User Management

#### GET `/api/users/profile`
Get user profile

#### PUT `/api/users/profile`
Update user profile

#### GET `/api/users/:userId`
Get user by ID (admin only)

#### PUT `/api/users/:userId`
Update user (admin or self)

#### DELETE `/api/users/:userId`
Delete user (admin only)

### Course Management

#### GET `/api/courses`
Get all courses (with filtering)
```
Query params: page, limit, category, level, search, instructor
```

#### GET `/api/courses/:id`
Get course details

#### POST `/api/courses`
Create course (instructor only)

#### PUT `/api/courses/:id`
Update course (instructor only)

#### DELETE `/api/courses/:id`
Delete course (instructor only)

#### POST `/api/courses/:id/enroll`
Enroll in course (refugee only)

#### GET `/api/courses/:id/progress`
Get course progress (enrolled users)

#### PUT `/api/courses/:id/progress`
Update course progress

### Job Management

#### GET `/api/jobs`
Get all jobs (with filtering)

#### GET `/api/jobs/:id`
Get job details

#### POST `/api/jobs`
Create job posting (employer only)

#### PUT `/api/jobs/:id`
Update job posting (employer only)

#### DELETE `/api/jobs/:id`
Delete job posting (employer only)

#### POST `/api/jobs/:id/apply`
Apply for job (refugee only)

#### GET `/api/jobs/:id/applications`
Get job applications (employer only)

### Assessment System

#### GET `/api/assessments`
Get assessments (with filtering)

#### GET `/api/assessments/:id`
Get assessment details

#### POST `/api/assessments`
Create assessment (instructor only)

#### PUT `/api/assessments/:id`
Update assessment (instructor only)

#### POST `/api/assessments/:id/submit`
Submit assessment (refugee only)

#### GET `/api/assessments/:id/results`
Get assessment results

### Certificate Management

#### GET `/api/certificates`
Get user certificates

#### POST `/api/certificates`
Issue certificate (instructor only)

#### GET `/api/certificates/:id`
Get certificate details

#### GET `/api/certificates/verify/:id`
Verify certificate (public)

### Help Desk

#### GET `/api/help/tickets`
Get help tickets

#### POST `/api/help/tickets`
Create help ticket

#### GET `/api/help/tickets/:id`
Get ticket details

#### PUT `/api/help/tickets/:id`
Update ticket

#### POST `/api/help/tickets/:id/messages`
Add message to ticket

### Scholarship Management

#### GET `/api/scholarships`
Get all scholarships (with filtering)

#### GET `/api/scholarships/:id`
Get scholarship details

#### POST `/api/scholarships`
Create scholarship (employer only)

#### PUT `/api/scholarships/:id`
Update scholarship (employer only)

#### POST `/api/scholarships/:id/apply`
Apply for scholarship (refugee only)

### Peer Learning

#### GET `/api/peer-learning/groups`
Get peer learning groups

#### POST `/api/peer-learning/groups`
Create group (refugee only)

#### GET `/api/peer-learning/groups/:id`
Get group details

#### POST `/api/peer-learning/groups/:id/join`
Join group

#### POST `/api/peer-learning/groups/:id/posts`
Create post in group

#### GET `/api/peer-learning/posts/:id`
Get post details

### Admin Endpoints

#### GET `/api/admin/analytics`
Get platform analytics (admin only)

#### GET `/api/admin/users`
Get all users (admin only)

#### PUT `/api/admin/users/:id`
Update user (admin only)

#### DELETE `/api/admin/users/:id`
Delete user (admin only)

#### GET `/api/admin/courses`
Get all courses (admin only)

#### GET `/api/admin/jobs`
Get all jobs (admin only)

#### GET `/api/admin/help-tickets`
Get all help tickets (admin only)

## Data Models

### User Model
```typescript
interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'refugee' | 'instructor' | 'admin' | 'employer';
  profilePic?: string;
  country: string;
  city: string;
  languages: string[];
  skills: string[];
  interests: string[];
  education: Education[];
  experiences: Experience[];
  certificates: Certificate[];
  social: SocialLinks;
  isEmailVerified: boolean;
  isActive: boolean;
}
```

### Course Model
```typescript
interface ICourse {
  title: string;
  description: string;
  overview: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
  instructor: ObjectId;
  modules: Module[];
  learningObjectives: string[];
  resources: Resources;
  image: string;
  isActive: boolean;
  enrollments: Enrollment[];
}
```

### Job Model
```typescript
interface IJob {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  category: string;
  employer: ObjectId;
  isActive: boolean;
  applications: Application[];
}
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP
- Configurable via environment variables

## File Upload

File uploads are handled via Multer with AWS S3 integration:
- Supported formats: images, documents, videos
- Max file size: 10MB
- Automatic file type validation

## Real-time Features

Socket.IO is used for real-time features:
- Real-time notifications
- Live updates in peer learning groups

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production CouchDB URI
- Configure production AWS credentials
- Set up production Redis instance
- Configure production SMTP settings

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Monitoring and Logging

- Winston logger for structured logging
- Request/response logging with Morgan
- Error tracking and monitoring
- Performance metrics

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Password hashing with bcrypt
- JWT token expiration
- Rate limiting
- File upload validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details 