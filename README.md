# 🎓 RefuLearn - Empowering Refugee Education

<div align="center">

![RefuLearn Logo](https://img.shields.io/badge/RefuLearn-Education%20Platform-blue?style=for-the-badge&logo=graduation-cap)
![Offline-First](https://img.shields.io/badge/Offline--First-PWA-brightgreen?style=for-the-badge&logo=pwa)
![Multi-Language](https://img.shields.io/badge/Multi--Language-EN%20%7C%20FR%20%7C%20RW%20%7C%20SW-orange?style=for-the-badge&logo=translate)

**A comprehensive offline-first learning platform designed specifically for refugee communities, providing accessible education, job opportunities, and skill development.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![CouchDB](https://img.shields.io/badge/CouchDB-Database-green?style=flat-square&logo=couchdb)](https://couchdb.apache.org/)
[![PWA](https://img.shields.io/badge/PWA-Installable-brightgreen?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)

</div>

---

## 🌟 Key Features

### 📚 **Comprehensive Learning Management**
- **Course Management**: Create, manage, and deliver structured educational content
- **Module System**: Organized learning modules with multimedia content support
- **Assessment Tools**: Quizzes, assignments, and progress tracking
- **Certificate Generation**: Automated certificate creation upon course completion

### 🔄 **Offline-First Architecture**
- **PWA Support**: Install as a native app on any device
- **Offline Learning**: Access courses and content without internet connection
- **Background Sync**: Automatic data synchronization when connection is restored
- **Local Storage**: PouchDB-powered local database for offline functionality

### 👥 **Multi-Role Platform**
- **Refugee Students**: Access courses, track progress, earn certificates
- **Instructors**: Create courses, manage assessments, monitor student progress
- **Employers**: Post job opportunities and scholarships
- **Administrators**: Platform management and user oversight

### 🌍 **Global Accessibility**
- **Multi-Language Support**: English, French, Kinyarwanda, Swahili
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Low-Bandwidth Optimized**: Efficient data usage for limited connectivity

### 💼 **Career Development**
- **Job Portal**: Browse and apply for employment opportunities
- **Scholarship System**: Access educational funding opportunities
- **Skill Assessment**: Evaluate and track skill development
- **Peer Learning**: Collaborative learning communities

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **CouchDB** (for database)
- **Redis** (for caching, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/refulearn.git
   cd refulearn
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend/refulearn
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment variables
   cd backend
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   NODE_ENV=development
   PORT=5001
   COUCHDB_URL=http://localhost:5984
   COUCHDB_USERNAME=admin
   COUCHDB_PASSWORD=password
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Setup CouchDB
   cd backend
   npm run couchdb:setup
   
   # Setup Supabase (optional)
   npm run supabase:setup
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start backend server
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend application
   cd frontend/refulearn
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - API Documentation: http://localhost:5001/api-docs

---

## 🏗️ Architecture

### Frontend (React + PWA)
```
frontend/refulearn/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── Admin/          # Admin dashboard and management
│   │   ├── Auth/           # Authentication pages
│   │   ├── Employer/       # Employer portal
│   │   ├── Instructor/     # Instructor dashboard
│   │   ├── Refugee/        # Student learning interface
│   │   └── Profile/        # User profile management
│   ├── contexts/           # React contexts for state management
│   ├── services/           # API and offline services
│   ├── utils/              # Utility functions
│   └── locales/            # Internationalization files
```

### Backend (Node.js + Express + TypeScript)
```
backend/
├── src/
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   ├── services/           # Business logic services
│   ├── models/             # Data models
│   └── utils/              # Utility functions
├── scripts/                # Setup and utility scripts
└── tests/                  # Test files
```

---

## 🔧 Available Scripts

### Backend Scripts
```bash
cd backend

# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report

# Database
npm run couchdb:setup    # Setup CouchDB databases
npm run supabase:setup   # Setup Supabase configuration

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
```

### Frontend Scripts
```bash
cd frontend/refulearn

# Development
npm start                # Start development server
npm run build            # Build for production
npm run eject            # Eject from Create React App

# Testing
npm test                 # Run tests
npm run test:coverage    # Generate coverage report
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password recovery
- `POST /api/auth/reset-password` - Password reset

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Assessments
- `GET /api/assessments` - List assessments
- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:id` - Get assessment details
- `POST /api/assessments/:id/submit` - Submit assessment

### Jobs & Scholarships
- `GET /api/jobs` - List job opportunities
- `POST /api/jobs` - Post new job
- `GET /api/scholarships` - List scholarships
- `POST /api/scholarships` - Post new scholarship

### Complete API Documentation
Visit `http://localhost:5001/api-docs` for interactive API documentation.

---

## 🎯 Key Features in Detail

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on any device
- **Offline Capable**: Full functionality without internet
- **Background Sync**: Automatic data synchronization
- **Push Notifications**: Real-time updates and alerts

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permissions for different user types
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security

### 📊 Analytics & Monitoring
- **Progress Tracking**: Detailed learning progress analytics
- **Performance Monitoring**: Real-time system performance
- **Error Logging**: Comprehensive error tracking
- **User Analytics**: Learning behavior insights

### 🌍 Internationalization
- **Multi-Language UI**: English, French, Kinyarwanda, Swahili
- **Dynamic Language Switching**: Real-time language changes
- **Localized Content**: Region-specific educational content
- **RTL Support**: Right-to-left language support

---

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend/refulearn
npm test

# Test coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application workflow testing
- **Offline Tests**: Offline functionality validation

---

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend/refulearn
npm run build

# Build backend
cd backend
npm run build
```

### Environment Variables
Set the following environment variables for production:
```env
NODE_ENV=production
PORT=5001
COUCHDB_URL=your-couchdb-url
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=your-frontend-domain
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker
docker-compose up -d
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **UNHCR** for supporting refugee education initiatives
- **Open Source Community** for the amazing tools and libraries
- **Refugee Communities** for their valuable feedback and insights

---

## 🎥 Demo

### Live Demo
- **🌐 Live Application**: [RefuLearn Demo](YOUR_DEMO_LINK_HERE)
- **📱 PWA Installation**: Install the app directly from your browser for the best experience

### Demo Features to Showcase
- **Offline Learning**: Try accessing courses without internet connection
- **Multi-Language**: Switch between English, French, Kinyarwanda, and Swahili
- **Role-Based Access**: Experience different interfaces for Students, Instructors, Employers, and Admins
- **PWA Installation**: Add to home screen for app-like experience
- **Real-time Sync**: Test background synchronization when connection is restored

### Demo Credentials (if applicable)
```
Student Account:
- Email: student@refulearn.com
- Password: demo123

Instructor Account:
- Email: instructor@refulearn.com
- Password: demo123

Employer Account:
- Email: employer@refulearn.com
- Password: demo123

Admin Account:
- Email: admin@refulearn.com
- Password: demo123
```

---

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/refulearn/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/refulearn/issues)
- **Email**: support@refulearn.org

---

<div align="center">

**Made with ❤️ for refugee communities worldwide**

[![GitHub stars](https://img.shields.io/github/stars/your-username/refulearn?style=social)](https://github.com/your-username/refulearn)
[![GitHub forks](https://img.shields.io/github/forks/your-username/refulearn?style=social)](https://github.com/your-username/refulearn)
[![GitHub issues](https://img.shields.io/github/issues/your-username/refulearn)](https://github.com/your-username/refulearn/issues)

</div>
