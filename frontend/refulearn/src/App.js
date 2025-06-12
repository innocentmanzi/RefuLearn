import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RefugeeDashboard from './pages/Refugee/Dashboard';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import MentorDashboard from './pages/Mentor/MentorDashboard';
import SessionManagement from './pages/Mentor/SessionManagement';
import MenteeProfiles from './pages/Mentor/MenteeProfiles';
import ResourceManagement from './pages/Mentor/ResourceManagement';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Analytics from './pages/Admin/Analytics';
import ManageUsers from './pages/Admin/ManageUsers';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import PostJobs from './pages/Employer/PostJobs';
import ViewApplicants from './pages/Employer/ViewApplicants';
import Sidebar from './components/Sidebar';
import Profile from './pages/Profile/Profile';
import Jobs from './pages/Refugee/Jobs';
import DetailPage from './pages/Refugee/DetailPage';
import MentorDetail from './pages/Refugee/MentorDetail';
import PeerLearning from './pages/Mentor/PeerLearning';
import BrowseCourses from './pages/Refugee/BrowseCourses';
import LearningPath from './pages/Refugee/LearningPath';
import Assessments from './pages/Instructor/Assessments';
import Certificates from './pages/Refugee/Certificates';
import ManageCourses from './pages/Instructor/ManageCourses';

function AppRoutes({ isAuthenticated, setIsAuthenticated, userRole, setUserRole }) {
  return !isAuthenticated ? (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
      <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
    </Routes>
  ) : (
    <Sidebar role={userRole} onLogout={() => setIsAuthenticated(false)}>
      <Routes>
        {userRole === 'refugee' && (
          <>
            <Route path="/dashboard" element={<RefugeeDashboard />} />
            <Route path="/courses" element={<BrowseCourses />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/peer-learning" element={<PeerLearning />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/detail" element={<DetailPage />} />
            <Route path="/peer-learning/mentor/:mentorId" element={<MentorDetail />} />
          </>
        )}
        {userRole === 'instructor' && (
          <>
            <Route path="/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/manage-courses" element={<ManageCourses />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/profile" element={<Profile userRole={userRole} />} />
          </>
        )}
        {userRole === 'mentor' && (
          <>
            <Route path="/dashboard" element={<MentorDashboard />} />
            <Route path="/sessions" element={<SessionManagement />} />
            <Route path="/mentees" element={<MenteeProfiles />} />
            <Route path="/resources" element={<ResourceManagement />} />
            <Route path="/peer-learning" element={<PeerLearning />} />
          </>
        )}
        {userRole === 'admin' && (
          <>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/manage-users" element={<ManageUsers />} />
          </>
        )}
        {userRole === 'employer' && (
          <>
            <Route path="/dashboard" element={<EmployerDashboard />} />
            <Route path="/post-jobs" element={<PostJobs />} />
            <Route path="/applicants" element={<ViewApplicants />} />
          </>
        )}
        <Route path="/profile" element={<Profile userRole={userRole} />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Sidebar>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'refugee';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('userRole', userRole);
  }, [isAuthenticated, userRole]);

  return (
    <Router>
      <AppRoutes 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
        userRole={userRole}
        setUserRole={setUserRole}
      />
    </Router>
  );
}

export default App;
