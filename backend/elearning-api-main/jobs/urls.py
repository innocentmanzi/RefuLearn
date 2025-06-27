from django.urls import path
from . import views


urlpatterns = [
    path(
        "",
        views.JobOpportunityListCreateView.as_view(),
        name="job-opportunity-list-create",
    ),
    path(
        "<int:instance_id>/",
        views.JobOpportunityRetrieveUpdateDeleteView.as_view(),
        name="job-opportunity-retrieve-update-delete",
    ),
    path(
        "applications/",
        views.JobApplicationListCreateView.as_view(),
        name="job-application-list-create",
    ),
    path(
        "applications/<int:instance_id>/",
        views.JobApplicationRetrieveUpdateDeleteView.as_view(),
        name="job-application-retrieve-update-delete",
    ),
]
