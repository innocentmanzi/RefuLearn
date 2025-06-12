from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'courses', views.CourseViewSet)
router.register(r'lessons', views.LessonViewSet)
router.register(r'progress', views.UserProgressViewSet, basename='progress')

app_name = 'refulearn'

role_patterns = [
    path('refugee/register/', views.RoleRegistrationView.as_view(role='refugee'), name='refugee-register'),
    path('instructor/register/', views.RoleRegistrationView.as_view(role='instructor'), name='instructor-register'),
    path('employer/register/', views.RoleRegistrationView.as_view(role='employer'), name='employer-register'),
    path('mentor/register/', views.RoleRegistrationView.as_view(role='mentor'), name='mentor-register'),
    path('admin/register/', views.RoleRegistrationView.as_view(role='admin'), name='admin-register'),
    path('ngo-partner/register/', views.RoleRegistrationView.as_view(role='ngo_partner'), name='ngo-partner-register'),

    path('refugee/login/', views.RoleLoginView.as_view(role='refugee'), name='refugee-login'),
    path('instructor/login/', views.RoleLoginView.as_view(role='instructor'), name='instructor-login'),
    path('employer/login/', views.RoleLoginView.as_view(role='employer'), name='employer-login'),
    path('mentor/login/', views.RoleLoginView.as_view(role='mentor'), name='mentor-login'),
    path('admin/login/', views.RoleLoginView.as_view(role='admin'), name='admin-login'),
    path('ngo-partner/login/', views.RoleLoginView.as_view(role='ngo_partner'), name='ngo-partner-login'),
]

role_user_patterns = [
    path('refugee/users/', views.RoleUserListView.as_view(role='refugee'), name='refugee-user-list'),
    path('refugee/users/<str:user_id>/', views.RoleUserDetailView.as_view(role='refugee'), name='refugee-user-detail'),
    path('instructor/users/', views.RoleUserListView.as_view(role='instructor'), name='instructor-user-list'),
    path('instructor/users/<str:user_id>/', views.RoleUserDetailView.as_view(role='instructor'), name='instructor-user-detail'),
    path('employer/users/', views.RoleUserListView.as_view(role='employer'), name='employer-user-list'),
    path('employer/users/<str:user_id>/', views.RoleUserDetailView.as_view(role='employer'), name='employer-user-detail'),
    path('mentor/users/', views.RoleUserListView.as_view(role='mentor'), name='mentor-user-list'),
    path('mentor/users/<str:user_id>/', views.RoleUserDetailView.as_view(role='mentor'), name='mentor-user-detail'),
    path('admin/users/', views.RoleUserListView.as_view(role='admin'), name='admin-user-list'),
    path('admin/users/<str:user_id>/', views.RoleUserDetailView.as_view(role='admin'), name='admin-user-detail'),
    path('ngo-partner/users/', views.RoleUserListView.as_view(role='ngo_partner'), name='ngo-partner-user-list'),
    path('ngo-partner/users/<str:user_id>/', views.RoleUserDetailView.as_view(role='ngo_partner'), name='ngo-partner-user-detail'),
]

role_course_patterns = [
    path('instructor/courses/', views.InstructorCourseListView.as_view(), name='instructor-course-list'),
    path('instructor/courses/<str:course_id>/', views.InstructorCourseDetailView.as_view(), name='instructor-course-detail'),
    path('refugee/courses/', views.RefugeeCourseListView.as_view(), name='refugee-course-list'),
    path('refugee/courses/<str:course_id>/', views.RefugeeCourseDetailView.as_view(), name='refugee-course-detail'),
    path('admin/courses/', views.AdminCourseListView.as_view(), name='admin-course-list'),
    path('admin/courses/<str:course_id>/', views.AdminCourseDetailView.as_view(), name='admin-course-detail'),
]

shared_patterns = [
    path('languages/', views.LanguageListView.as_view(), name='language-list'),
    path('languages/<str:language_id>/', views.LanguageDetailView.as_view(), name='language-detail'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<str:category_id>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('camps/', views.CampListView.as_view(), name='camp-list'),
    path('camps/<str:camp_id>/', views.CampDetailView.as_view(), name='camp-detail'),
]

urlpatterns = shared_patterns + role_patterns + role_user_patterns + role_course_patterns + [
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<str:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/by-role/<str:role>/', views.UserListByRoleView.as_view(), name='user-list-by-role'),
    path('', views.api_root, name='api-root'),
    path('', include(router.urls)),
    # Employer job endpoints
    path('api/employer/jobs/', views.EmployerJobListView.as_view(), name='employer-job-list'),
    path('api/employer/jobs/<str:job_id>/', views.EmployerJobDetailView.as_view(), name='employer-job-detail'),

    # NGO Partner job endpoints
    path('api/ngo-partner/jobs/', views.NGOPartnerJobListCreateView.as_view(), name='ngo-partner-job-list-create'),
    path('api/ngo-partner/jobs/<str:job_id>/', views.NGOPartnerJobDetailView.as_view(), name='ngo-partner-job-detail'),

    # Refugee job endpoints
    path('api/refugee/jobs/', views.RefugeeJobListView.as_view(), name='refugee-job-list'),
    path('api/refugee/jobs/<str:job_id>/apply/', views.RefugeeJobApplyView.as_view(), name='refugee-job-apply'),

    # Admin job endpoints
    path('api/admin/jobs/', views.AdminJobListView.as_view(), name='admin-job-list'),
    path('api/admin/jobs/<str:job_id>/', views.AdminJobDetailView.as_view(), name='admin-job-detail'),

    # Refugee job application endpoints
    path('api/refugee/applications/', views.RefugeeJobApplicationListView.as_view(), name='refugee-application-list'),
    path('api/refugee/jobs/<str:job_id>/apply/', views.RefugeeJobApplicationListView.as_view(), name='refugee-job-apply'),

    # Employer job application endpoints
    path('api/employer/jobs/<str:job_id>/applications/', views.EmployerJobApplicationListView.as_view(), name='employer-application-list'),
    path('api/employer/jobs/<str:job_id>/applications/<str:application_id>/', views.EmployerJobApplicationDetailView.as_view(), name='employer-application-detail'),

    # Admin job application endpoints
    path('api/admin/applications/', views.AdminJobApplicationListView.as_view(), name='admin-application-list'),
    path('api/admin/applications/<str:application_id>/', views.AdminJobApplicationDetailView.as_view(), name='admin-application-detail'),

    # Instructor assessment endpoints
    path('api/instructor/assessments/', views.InstructorAssessmentListView.as_view(), name='instructor-assessment-list'),
    path('api/instructor/assessments/<str:assessment_id>/', views.InstructorAssessmentDetailView.as_view(), name='instructor-assessment-detail'),

    # Refugee assessment endpoints
    path('api/refugee/assessments/', views.RefugeeAssessmentListView.as_view(), name='refugee-assessment-list'),
    path('api/refugee/assessments/<str:assessment_id>/', views.RefugeeUserAssessmentView.as_view(), name='refugee-assessment-detail'),
    path('api/refugee/my-assessments/', views.RefugeeUserAssessmentView.as_view(), name='refugee-my-assessments'),

    # Admin assessment endpoints
    path('api/admin/assessments/', views.AdminAssessmentListView.as_view(), name='admin-assessment-list'),
    path('api/admin/assessments/<str:assessment_id>/', views.AdminAssessmentDetailView.as_view(), name='admin-assessment-detail'),

    # Refugee certificate endpoints
    path('api/refugee/certificates/', views.RefugeeCertificateListView.as_view(), name='refugee-certificate-list'),
    path('api/refugee/certificates/<str:certificate_id>/', views.RefugeeCertificateDetailView.as_view(), name='refugee-certificate-detail'),

    # Instructor certificate endpoints
    path('api/instructor/certificates/', views.InstructorCertificateListView.as_view(), name='instructor-certificate-list'),
    path('api/instructor/certificates/<str:certificate_id>/', views.InstructorCertificateDetailView.as_view(), name='instructor-certificate-detail'),

    # Admin certificate endpoints
    path('api/admin/certificates/', views.AdminCertificateListView.as_view(), name='admin-certificate-list'),
    path('api/admin/certificates/<str:certificate_id>/', views.AdminCertificateDetailView.as_view(), name='admin-certificate-detail'),

    # Public certificate verification endpoint
    path('verify/<str:certificate_number>/', views.CertificateVerificationView.as_view(), name='certificate-verify'),

    # Refugee discussion endpoints
    path('api/refugee/discussions/', views.RefugeeDiscussionListView.as_view(), name='refugee-discussion-list'),
    path('api/refugee/discussions/<str:discussion_id>/', views.RefugeeDiscussionDetailView.as_view(), name='refugee-discussion-detail'),
    path('api/refugee/discussions/<str:discussion_id>/replies/', views.RefugeeDiscussionReplyView.as_view(), name='refugee-discussion-reply'),
    path('api/refugee/discussions/<str:discussion_id>/replies/<str:reply_id>/', views.RefugeeDiscussionReplyView.as_view(), name='refugee-discussion-reply-detail'),

    # Instructor discussion endpoints
    path('api/instructor/discussions/', views.InstructorDiscussionListView.as_view(), name='instructor-discussion-list'),
    path('api/instructor/discussions/<str:discussion_id>/', views.InstructorDiscussionDetailView.as_view(), name='instructor-discussion-detail'),

    # Admin discussion endpoints
    path('api/admin/discussions/', views.AdminDiscussionListView.as_view(), name='admin-discussion-list'),
    path('api/admin/discussions/<str:discussion_id>/', views.AdminDiscussionDetailView.as_view(), name='admin-discussion-detail'),

    # Peer learning endpoints
    path('api/refugee/peer-learning/', views.RefugeePeerLearningSessionView.as_view(), name='refugee-peer-learning'),
    path('api/instructor/peer-learning/', views.InstructorPeerLearningSessionView.as_view(), name='instructor-peer-learning'),
    path('api/mentor/peer-learning/', views.MentorPeerLearningSessionView.as_view(), name='mentor-peer-learning'),

    # NGO partner endpoints
    path('api/ngo-partner/courses/', views.NGOPartnerCourseListCreateView.as_view(), name='ngo-partner-course-list-create'),

    # Admin analytics endpoint
    path('api/admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
] 