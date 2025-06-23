from django.urls import path
from . import views


urlpatterns = [
    path(
        "categories/",
        views.CourseCategoryListCreateView.as_view(),
        name="category-list-create",
    ),
    path(
        "category/<int:instance_id>/",
        views.CourseCategoryRetrieveUpdateDeleteView.as_view(),
        name="category-retrieve-update-delete",
    ),
    path("modules/", views.ModuleListCreateView.as_view(), name="module-list-create"),
    path(
        "module/<uuid:instance_id>/",
        views.ModuleRetrieveUpdateDeleteView.as_view(),
        name="module-retrieve-update-delete",
    ),
    path(
        "enrollments/",
        views.EnrollmentListCreateView.as_view(),
        name="enrollment-list-create",
    ),
    path(
        "enrollment/<int:instance_id>/",
        views.EnrollmentRetrieveUpdateDeleteView.as_view(),
        name="enrollment-retrieve-update-delete",
    ),
    path(
        "user-progress/",
        views.UserProgressListCreateView.as_view(),
        name="user-progress-list-create",
    ),
    path(
        "user-progress/<int:instance_id>/",
        views.UserProgressRetrieveUpdateDeleteView.as_view(),
        name="user-progress-retrieve-update-delete",
    ),
    path(
        "assessments/",
        views.AssessmentListCreateView.as_view(),
        name="assessment-list-create",
    ),
    path(
        "assessments/<int:instance_id>/",
        views.AssessmentRetrieveUpdateDeleteView.as_view(),
        name="assessment-retrieve-update-delete",
    ),
    path(
        "questions/",
        views.QuestionListCreateView.as_view(),
        name="question-list-create",
    ),
    path(
        "questions/<int:instance_id>/",
        views.QuestionRetrieveUpdateDeleteView.as_view(),
        name="question-retrieve-update-delete",
    ),
    path("", views.CourseListCreateView.as_view(), name="course-list-create"),
    path(
        "<uuid:instance_id>/",
        views.CourseRetrieveUpdateDeleteView.as_view(),
        name="course-retrieve-update-delete",
    ),
]
