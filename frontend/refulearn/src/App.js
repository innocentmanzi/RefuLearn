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
import PeerLearning from './pages/Refugee/PeerLearning';
import BrowseCourses from './pages/Refugee/BrowseCourses';
import LearningPath from './pages/Refugee/LearningPath';
import Assessments from './pages/Instructor/Assessments';
import RefugeeAssessments from './pages/Refugee/Assessments';
import Certificates from './pages/Refugee/Certificates';
import ManageCourses from './pages/Instructor/ManageCourses';
import FullCoursePage from './pages/Refugee/FullCoursePage';
import CourseQuizPage from './pages/Refugee/CourseQuizPage';
import AssessmentStart from './pages/Refugee/AssessmentStart';
import AssessmentQuizPage from './pages/Refugee/AssessmentQuizPage';
import GroupDetails from './pages/Refugee/GroupDetails';
import MentorGroupDetails from './pages/Mentor/MentorGroupDetails';
import MentorPeerLearning from './pages/Mentor/PeerLearning';
import EmployerJobs from './pages/Employer/Jobs';
import EmployerScholarships from './pages/Employer/Scholarships';
import PostScholarship from './pages/Employer/PostScholarship';
import Help from './pages/Refugee/Help';
import HelpTickets from './pages/Refugee/HelpTickets';
import InstructorHelpManagement from './pages/Instructor/HelpManagement';
import MentorHelpManagement from './pages/Mentor/HelpManagement';
import AdminHelpManagement from './pages/Admin/HelpManagement';

function AppRoutes({ isAuthenticated, setIsAuthenticated, userRole, setUserRole }) {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {!isAuthenticated && (
        <>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
          <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        </>
      )}
      {isAuthenticated && (
        <Route path="*" element={
          <Sidebar role={userRole} onLogout={() => setIsAuthenticated(false)}>
            <Routes>
              {userRole === 'refugee' && (
                <>
                  <Route path="/dashboard" element={<RefugeeDashboard />} />
                  <Route path="/courses" element={<BrowseCourses />} />
                  <Route path="/courses/:id" element={<DetailPage />} />
                  <Route path="/courses/full/:id" element={<FullCoursePage />} />
                  <Route path="/learning-path" element={<LearningPath />} />
                  <Route path="/assessments" element={<RefugeeAssessments />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/peer-learning" element={<PeerLearning />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/help-tickets" element={<HelpTickets />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/detail" element={<DetailPage />} />
                  <Route path="/peer-learning/mentor/:mentorId" element={<MentorDetail />} />
                  <Route path="/courses/quiz/:id" element={<CourseQuizPage />} />
                  <Route path="/assessments/:id" element={<AssessmentStart />} />
                  <Route path="/assessments/:id/quiz" element={<AssessmentQuizPage />} />
                  <Route path="/peer-learning/group/:groupId" element={<GroupDetails />} />
                </>
              )}
              {userRole === 'instructor' && (
                <>
                  <Route path="/dashboard" element={<InstructorDashboard />} />
                  <Route path="/instructor" element={<InstructorDashboard />} />
                  <Route path="/manage-courses" element={<ManageCourses />} />
                  <Route path="/help-management" element={<InstructorHelpManagement />} />
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
                  <Route path="/peer-learning" element={<MentorPeerLearning />} />
                  <Route path="/peer-learning/group/:groupId" element={<MentorGroupDetails />} />
                  <Route path="/help-management" element={<MentorHelpManagement />} />
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/manage-users" element={<ManageUsers />} />
                  <Route path="/help-management" element={<AdminHelpManagement />} />
                </>
              )}
              {userRole === 'employer' && (
                <>
                  <Route path="/dashboard" element={<EmployerDashboard />} />
                  <Route path="/post-jobs" element={<PostJobs />} />
                  <Route path="/post-scholarship" element={<PostScholarship />} />
                  <Route path="/applicants" element={<ViewApplicants />} />
                  <Route path="/jobs" element={<EmployerJobs />} />
                  <Route path="/scholarships" element={<EmployerScholarships />} />
                </>
              )}
              <Route path="/profile" element={<Profile userRole={userRole} />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </Sidebar>
        } />
      )}
      <Route path="*" element={<Landing />} />
    </Routes>
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
