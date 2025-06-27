from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# ======== Admin site URLs ========
urlpatterns = [
    path("admin/", admin.site.urls),
]

# ======== Local Apps based routes ========
urlpatterns += [
    path("auth/", include("authentication.urls")),
    path("core/", include("core.urls")),
    path("courses/", include("course.urls")),
    path("jobs/", include("jobs.urls")),
]

# ======== Django Rest Framework authentication views ========
urlpatterns += [
    path("api/", include("rest_framework.urls")),
]

# ======== URLs for JWT token management ========
urlpatterns += [
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
]

# ======== Documentation and API Schema views ========
urlpatterns += [
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Optional UI:
    path("", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
