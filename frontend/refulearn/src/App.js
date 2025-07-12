import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RefugeeDashboard from './pages/Refugee/Dashboard';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Analytics from './pages/Admin/Analytics';
import ManageUsers from './pages/Admin/ManageUsers';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import PostJobs from './pages/Employer/PostJobs';
import ViewApplicants from './pages/Employer/ViewApplicants';
import Sidebar from './components/Sidebar';
import Profile from './pages/Profile/Profile';
import AccountSettings from './pages/Profile/AccountSettings';
import Jobs from './pages/Refugee/Jobs';
import DetailPage from './pages/Refugee/DetailPage';
import PeerLearning from './pages/Refugee/PeerLearning';
import BrowseCourses from './pages/Refugee/BrowseCourses';
import CategoryCourses from './pages/Refugee/CategoryCourses';
import LearningPath from './pages/Refugee/LearningPath';
import Assessments from './pages/Instructor/Assessments';
import Quizzes from './pages/Instructor/Quizzes';
import Groups from './pages/Instructor/Groups';
import Discussions from './pages/Instructor/Discussions';
import Certificates from './pages/Refugee/Certificates';
import ManageCourses from './pages/Instructor/ManageCourses';
import FullCoursePage from './pages/Refugee/FullCoursePage';
import CourseQuizPage from './pages/Refugee/CourseQuizPage';
import GroupDetails from './pages/Refugee/GroupDetails';
import EmployerJobs from './pages/Employer/Jobs';
import EmployerScholarships from './pages/Employer/Scholarships';
import EditScholarship from './pages/Employer/EditScholarship';
import PostScholarship from './pages/Employer/PostScholarship';
import EditJob from './pages/Employer/EditJob';
import Help from './pages/Refugee/Help';
import HelpTickets from './pages/Refugee/HelpTickets';
import InstructorHelpManagement from './pages/Instructor/HelpManagement';
import AdminHelpManagement from './pages/Admin/HelpManagement';
import CourseContentPage from './pages/Refugee/CourseContentPage';
import CourseBuilder from './pages/Instructor/CourseBuilder';
import CreateModule from './pages/Instructor/CreateModule';
import CourseOverview from './pages/Instructor/CourseOverview';
import ModuleContent from './pages/Instructor/ModuleContent';
import Grades from './pages/Instructor/Grades';
import MyGrades from './pages/Refugee/MyGrades';
import CourseDetail from './pages/Refugee/CourseDetail';
import StudentCourseOverview from './pages/Refugee/StudentCourseOverview';
import SharedModuleContent from './components/ModuleContent';

function AppRoutes() {
  const { isAuthenticated, userRole, logout } = useUser();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {!isAuthenticated && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </>
      )}
      {isAuthenticated && userRole === 'refugee' && (
        <>
          {/* Module content routes - highest priority */}
          <Route path="/courses/:courseId/modules/:moduleId/description" element={
            <Sidebar role={userRole} onLogout={logout}>
              {(() => {
                console.log('🎯 ROUTE MATCHED: Module Description Route');
                console.log('🎯 URL:', window.location.href);
                return <SharedModuleContent />;
              })()}
            </Sidebar>
          } />
          <Route path="/courses/:courseId/modules/:moduleId/content" element={
            <Sidebar role={userRole} onLogout={logout}>
              {(() => {
                console.log('🎯 ROUTE MATCHED: Module Content Route');
                console.log('🎯 URL:', window.location.href);
                return <SharedModuleContent />;
              })()}
            </Sidebar>
          } />
          <Route path="/courses/:courseId/modules/:moduleId/video" element={
            <Sidebar role={userRole} onLogout={logout}>
              <SharedModuleContent />
            </Sidebar>
          } />
          <Route path="/courses/:courseId/modules/:moduleId/resource/:resourceId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <SharedModuleContent />
            </Sidebar>
          } />
          <Route path="/courses/:courseId/modules/:moduleId/assessment/:assessmentId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <SharedModuleContent />
            </Sidebar>
          } />
          <Route path="/courses/:courseId/modules/:moduleId/quiz/:quizId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <SharedModuleContent />
            </Sidebar>
          } />
          <Route path="/courses/:courseId/modules/:moduleId/discussion/:discussionId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <SharedModuleContent />
            </Sidebar>
          } />
          
          {/* Other refugee routes */}
          <Route path="/dashboard" element={
            <Sidebar role={userRole} onLogout={logout}>
              <RefugeeDashboard />
            </Sidebar>
          } />
          <Route path="/courses" element={
            <Sidebar role={userRole} onLogout={logout}>
              <BrowseCourses />
            </Sidebar>
          } />
          <Route path="/courses/category/:categoryName" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CategoryCourses />
            </Sidebar>
          } />
          <Route path="/courses/:id" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CourseDetail />
            </Sidebar>
          } />
          <Route path="/course/:courseId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CourseDetail />
            </Sidebar>
          } />
          <Route path="/courses/full/:id" element={
            <Sidebar role={userRole} onLogout={logout}>
              <FullCoursePage />
            </Sidebar>
          } />
          <Route path="/courses/content/:id" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CourseContentPage />
            </Sidebar>
          } />
          <Route path="/courses/:courseId/overview" element={
            <Sidebar role={userRole} onLogout={logout}>
              <StudentCourseOverview />
            </Sidebar>
          } />
          <Route path="/learning-path" element={
            <Sidebar role={userRole} onLogout={logout}>
              <LearningPath />
            </Sidebar>
          } />
          <Route path="/certificates" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Certificates />
            </Sidebar>
          } />
          <Route path="/peer-learning" element={
            <Sidebar role={userRole} onLogout={logout}>
              <PeerLearning />
            </Sidebar>
          } />
          <Route path="/help" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Help />
            </Sidebar>
          } />
          <Route path="/help-tickets" element={
            <Sidebar role={userRole} onLogout={logout}>
              <HelpTickets />
            </Sidebar>
          } />
          <Route path="/jobs" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Jobs />
            </Sidebar>
          } />
          <Route path="/jobs/detail" element={
            <Sidebar role={userRole} onLogout={logout}>
              <DetailPage />
            </Sidebar>
          } />
          <Route path="/peer-learning/group/:groupId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <GroupDetails />
            </Sidebar>
          } />
          <Route path="/courses/quiz/:id" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CourseQuizPage />
            </Sidebar>
          } />
        </>
      )}
      {isAuthenticated && userRole === 'instructor' && (
        <>
          <Route path="/dashboard" element={
            <Sidebar role={userRole} onLogout={logout}>
              <InstructorDashboard />
            </Sidebar>
          } />
          <Route path="/instructor" element={
            <Sidebar role={userRole} onLogout={logout}>
              <InstructorDashboard />
            </Sidebar>
          } />
          <Route path="/instructor/dashboard" element={
            <Sidebar role={userRole} onLogout={logout}>
              <InstructorDashboard />
            </Sidebar>
          } />
          <Route path="/manage-courses" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ManageCourses />
            </Sidebar>
          } />
          <Route path="/instructor/courses" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ManageCourses />
            </Sidebar>
          } />
          <Route path="/instructor/courses/create" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CourseBuilder />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:id/edit" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CourseBuilder />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/overview" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CourseOverview />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/grades" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Grades />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/modules/:moduleId/content" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ModuleContent />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/modules/:moduleId/video" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ModuleContent />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/modules/:moduleId/resource/:resourceId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ModuleContent />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/modules/:moduleId/assessment/:assessmentId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ModuleContent />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/modules/:moduleId/quiz/:quizId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ModuleContent />
            </Sidebar>
          } />
          <Route path="/instructor/courses/:courseId/modules/:moduleId/discussion/:discussionId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ModuleContent />
            </Sidebar>
          } />
          <Route path="/instructor/courses/create/module" element={
            <Sidebar role={userRole} onLogout={logout}>
              <CreateModule />
            </Sidebar>
          } />
          <Route path="/course/:courseId/grades" element={
            <Sidebar role={userRole} onLogout={logout}>
              <MyGrades />
            </Sidebar>
          } />
          <Route path="/help-management" element={
            <Sidebar role={userRole} onLogout={logout}>
              <InstructorHelpManagement />
            </Sidebar>
          } />
          <Route path="/instructor/help" element={
            <Sidebar role={userRole} onLogout={logout}>
              <InstructorHelpManagement />
            </Sidebar>
          } />
          <Route path="/assessments" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Assessments />
            </Sidebar>
          } />
          <Route path="/instructor/assessments" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Assessments />
            </Sidebar>
          } />
          <Route path="/quizzes" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Quizzes />
            </Sidebar>
          } />
          <Route path="/instructor/quizzes" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Quizzes />
            </Sidebar>
          } />
          <Route path="/groups" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Groups />
            </Sidebar>
          } />
          <Route path="/instructor/groups" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Groups />
            </Sidebar>
          } />
          <Route path="/discussions" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Discussions />
            </Sidebar>
          } />
          <Route path="/instructor/discussions" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Discussions />
            </Sidebar>
          } />
          <Route path="/profile" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Profile userRole={userRole} />
            </Sidebar>
          } />
        </>
      )}
      {isAuthenticated && userRole === 'admin' && (
        <>
          <Route path="/dashboard" element={
            <Sidebar role={userRole} onLogout={logout}>
              <AdminDashboard />
            </Sidebar>
          } />
          <Route path="/admin/dashboard" element={
            <Sidebar role={userRole} onLogout={logout}>
              <AdminDashboard />
            </Sidebar>
          } />
          <Route path="/analytics" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Analytics />
            </Sidebar>
          } />
          <Route path="/admin/analytics" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Analytics />
            </Sidebar>
          } />
          <Route path="/manage-users" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ManageUsers />
            </Sidebar>
          } />
          <Route path="/admin/users" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ManageUsers />
            </Sidebar>
          } />
          <Route path="/help-management" element={
            <Sidebar role={userRole} onLogout={logout}>
              <AdminHelpManagement />
            </Sidebar>
          } />
          <Route path="/admin/help" element={
            <Sidebar role={userRole} onLogout={logout}>
              <AdminHelpManagement />
            </Sidebar>
          } />
          <Route path="/admin/help-management" element={
            <Sidebar role={userRole} onLogout={logout}>
              <AdminHelpManagement />
            </Sidebar>
          } />
        </>
      )}
      {isAuthenticated && userRole === 'employer' && (
        <>
          <Route path="/dashboard" element={
            <Sidebar role={userRole} onLogout={logout}>
              <EmployerDashboard />
            </Sidebar>
          } />
          <Route path="/employer/dashboard" element={
            <Sidebar role={userRole} onLogout={logout}>
              <EmployerDashboard />
            </Sidebar>
          } />
          <Route path="/employer/jobs" element={
            <Sidebar role={userRole} onLogout={logout}>
              <EmployerJobs />
            </Sidebar>
          } />
          <Route path="/employer/jobs/edit/:jobId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <EditJob />
            </Sidebar>
          } />
          <Route path="/post-jobs" element={
            <Sidebar role={userRole} onLogout={logout}>
              <PostJobs />
            </Sidebar>
          } />
          <Route path="/employer/post-scholarship" element={
            <Sidebar role={userRole} onLogout={logout}>
              <PostScholarship />
            </Sidebar>
          } />
          <Route path="/applicants" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ViewApplicants />
            </Sidebar>
          } />
          <Route path="/employer/applicants" element={
            <Sidebar role={userRole} onLogout={logout}>
              <ViewApplicants />
            </Sidebar>
          } />
          <Route path="/jobs" element={
            <Sidebar role={userRole} onLogout={logout}>
              <EmployerJobs />
            </Sidebar>
          } />
          <Route path="/employer/scholarships" element={
            <Sidebar role={userRole} onLogout={logout}>
              <EmployerScholarships />
            </Sidebar>
          } />
          <Route path="/employer/scholarships/edit/:scholarshipId" element={
            <Sidebar role={userRole} onLogout={logout}>
              <EditScholarship />
            </Sidebar>
          } />
        </>
      )}
      {isAuthenticated && (
        <>
          <Route path="/profile" element={
            <Sidebar role={userRole} onLogout={logout}>
              <Profile userRole={userRole} />
            </Sidebar>
          } />
          <Route path="/account-settings" element={
            <Sidebar role={userRole} onLogout={logout}>
              <AccountSettings />
            </Sidebar>
          } />
        </>
      )}
      <Route path="*" element={<div>Page not found</div>} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
