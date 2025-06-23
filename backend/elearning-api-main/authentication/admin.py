from django.contrib import admin
from .models import User, UserProfile, OneTimePassword
from utils import logging_config

logger = logging_config.setup_logging()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing User model in Django Admin interface.

    Displays key user information such as email, full name, and various user
    permissions like superuser, staff, and active status. Allows searching
    and filtering users by different criteria for efficient admin operations.
    """

    list_display = [
        "id",
        "email",
        "username",
        "full_name",
        "role",
        "is_superuser",
        "is_staff",
        "is_verified",
    ]

    list_display_links = ["id", "email", "username", "full_name"]
    search_fields = ["email", "username", "full_name", "role"]
    list_filter = ["role", "is_superuser", "is_staff", "is_verified"]
    readonly_fields = ["date"]
    ordering = ["-date"]

    def __init__(self, *args, **kwargs):
        """
        Constructor to log when the UserAdmin class is initialized.
        """
        super().__init__(*args, **kwargs)

    def changelist_view(self, request, extra_context=None):
        """
        Overrides the default change list view to add logging for every access.
        Logs an info message whenever the list of users is accessed in the admin panel.
        """
        return super().changelist_view(request, extra_context)

    def save_model(self, request, obj, form, change):
        """
        Overrides the save model function to log every save action on User objects.
        Logs whether the object is being created or updated.
        """
        if change:
            logger.info(f"User '{obj.email}' was updated by {request.user.email}")

        else:
            logger.info(f"New user '{obj.email}' was created by {request.user.email}")

        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        """
        Overrides the delete model function to log every deletion of User objects.
        Logs the email of the user being deleted and who performed the action.
        """
        logger.warning(f"User '{obj.email}' was deleted by {request.user.email}")
        super().delete_model(request, obj)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing UserProfile model in Django Admin interface.
    """

    list_display = [
        "id",
        "user",
        "phone_number",
        "dob",
        "language_preference",
        "gender",
        "education_level",
        "camp",
    ]

    list_display_links = ["id", "user", "phone_number"]
    search_fields = ["education_level", "camp"]
    list_filter = ["education_level", "camp", "language_preference"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def __init__(self, *args, **kwargs):
        """
        Constructor to log when the UserProfileAdmin class is initialized.
        """
        super().__init__(*args, **kwargs)

    def changelist_view(self, request, extra_context=None):
        """
        Overrides the default change list view to add logging for every access.
        Logs an info message whenever the list of UserProfiles is accessed in the admin panel.
        """
        return super().changelist_view(request, extra_context)

    def save_model(self, request, obj, form, change):
        """
        Overrides the save model function to log every save action on UserProfile objects.
        Logs whether the object is being created or updated.
        """
        if change:
            logger.info(
                f"User '{obj.email}' profile was updated by {request.user.email}"
            )

        else:
            logger.info(
                f"New user '{obj.email}' profile was created by {request.user.email}"
            )

        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        """
        Overrides the delete model function to log every deletion of UserProfile objects.
        Logs the email of the user being deleted and who performed the action.
        """
        logger.warning(
            f"User '{obj.email}' profile was deleted by {request.user.email}"
        )
        super().delete_model(request, obj)


@admin.register(OneTimePassword)
class OneTimePasswordAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "code", "created_at", "updated_at"]
    list_display_links = ["id", "user", "code"]
    search_fields = ["code"]
    ordering = ["-id"]
