from django.urls import path
from . import views


urlpatterns = [
    path(
        "languages/",
        views.LanguageListCreateView.as_view(),
        name="language_list_create",
    ),
    path(
        "language/<uuid:instance_id>/",
        views.LanguageDetailView.as_view(),
        name="language_retrieve_update_delete",
    ),
    path(
        "camps/",
        views.CampListCreateView.as_view(),
        name="camp_list_create",
    ),
    path(
        "camp/<uuid:instance_id>/",
        views.CampDetailView.as_view(),
        name="camp_retrieve_update_delete",
    ),
]
