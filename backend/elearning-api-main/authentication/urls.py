from django.urls import path
from . import views


urlpatterns = [
    path("register/", views.RegisterUserView.as_view(), name="register_user"),
    path("verify-email/", views.VerifyEmail.as_view(), name="verify-email"),
    path("login/", views.LoginView.as_view(), name="login"),
    path(
        "password/change/", views.ChangePasswordView.as_view(), name="change-password"
    ),
    path(
        "password/reset/",
        views.PasswordResetRequestView.as_view(),
        name="reset-password-request",
    ),
    path(
        "password/reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="reset-password-confirm",
    ),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("users/", views.UserListView.as_view(), name="user_list"),
    path("user/", views.UserDataView.as_view(), name="user_data"),
    path(
        "profile/<int:user_id>/",
        views.UserProfileView.as_view(),
        name="user_profile",
    ),
    path(
        "admin/dashboard/", views.AdminDashboardView.as_view(), name="admin_dashboard"
    ),
]
