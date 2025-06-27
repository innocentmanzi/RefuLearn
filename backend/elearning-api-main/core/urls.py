from django.urls import path
from . import views


urlpatterns = [
    path(
        "languages/",
        views.LanguageListCreateView.as_view(),
        name="languages-list-create",
    ),
    path(
        "languages/<int:instance_id>/",
        views.LanguageDetailView.as_view(),
        name="languages-retrieve-update-delete",
    ),
    path(
        "camps/",
        views.CampListCreateView.as_view(),
        name="camps-list-create",
    ),
    path(
        "camps/<int:instance_id>/",
        views.CampDetailView.as_view(),
        name="camps-retrieve-update-delete",
    ),
]
