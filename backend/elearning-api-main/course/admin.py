from django.contrib import admin
from .models import (
    CourseCategory,
    Course,
    Module,
    Enrollment,
    UserProgress,
    Assessment,
    Question,
    UserAssessment,
    Certification,
    Discussion,
    DiscussionReply,
)
from utils import logging_config

logger = logging_config.setup_logging()


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing CourseCategory model in Django Admin interface.
    """

    list_display = ["id", "name"]

    list_display_links = ["id", "name"]
    search_fields = ["name"]
    readonly_fields = ["id"]
    ordering = ["id"]

    def __init__(self, *args, **kwargs):
        """
        Constructor to log when the CourseCategory class is initialized.
        """
        super().__init__(*args, **kwargs)

    def changelist_view(self, request, extra_context=None):
        """
        Overrides the default change list view to add logging for every access.
        Logs an info message whenever the list of CourseCategories is accessed in the admin panel.
        """
        return super().changelist_view(request, extra_context)

    def save_model(self, request, obj, form, change):
        """
        Overrides the save model function to log every save action on CourseCategory objects.
        Logs whether the object is being created or updated.
        """
        if change:
            logger.info(
                f"CourseCategory '{obj.email}' was updated by {request.user.email}"
            )

        else:
            logger.info(
                f"New CourseCategory '{obj.email}' was created by {request.user.email}"
            )

        super().save_model(request, obj, form, change)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing Course model in Django Admin interface.
    """

    list_display = [
        "id",
        "title",
        "language",
        "instructor",
        "category",
        "duration",
        "difficult_level",
        "is_active",
    ]

    list_display_links = ["id", "title", "language"]
    list_filter = ["language", "instructor", "category", "difficult_level", "is_active"]
    search_fields = ["title", "category", "difficult_level"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing Module model in Django Admin interface.
    """

    list_display = [
        "id",
        "course",
        "title",
        "order",
        "content_type",
        "duration",
        "is_mandatory",
    ]

    list_display_links = ["id", "course", "title", "order"]
    list_filter = ["course", "content_type", "is_mandatory"]
    search_fields = ["title", "course", "content_type"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing Enrollment model in Django Admin interface.
    """

    list_display = ["id", "user", "course", "status", "enrolled_at"]

    list_display_links = ["id", "user", "course"]
    list_filter = ["course", "status"]
    search_fields = ["course", "user"]
    readonly_fields = ["id"]
    ordering = ["-id"]


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing UserProgress model in Django Admin interface.
    """

    list_display = [
        "id",
        "user",
        "course",
        "current_module",
        "progress_percentage",
        "is_active",
    ]

    list_display_links = ["id", "user", "course"]
    list_filter = ["course", "is_active"]
    search_fields = ["course", "user"]
    readonly_fields = ["id"]
    ordering = ["-id"]


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing Assessment model in Django Admin interface.
    """

    list_display = [
        "id",
        "module",
        "title",
        "assessment_type",
        "max_attempts",
        "passing_score",
        "is_active",
    ]

    list_display_links = ["id", "module", "title"]
    list_filter = ["assessment_type", "is_active"]
    search_fields = ["module", "title"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-id"]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing Question model in Django Admin interface.
    """

    list_display = [
        "id",
        "assessment",
        "question_type",
        "correct_answer",
        "points",
        "order",
    ]

    list_display_links = ["id", "assessment", "question_type"]
    list_filter = ["assessment", "question_type"]
    search_fields = ["assessment"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-id"]


@admin.register(UserAssessment)
class UserAssessmentAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing UserAssessment model in Django Admin interface.
    """

    list_display = [
        "id",
        "user",
        "assessment",
        "attempt_number",
        "score",
        "passed",
        "started_at",
        "completed_at",
        "time_taken",
    ]

    list_display_links = ["id", "assessment", "user"]
    list_filter = ["assessment", "attempt_number"]
    search_fields = ["assessment", "user"]
    readonly_fields = ["id"]
    ordering = ["-id"]


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing Certification model in Django Admin interface.
    """

    list_display = [
        "id",
        "user",
        "course",
        "certificate_type",
        "title",
        "issued_at",
        "verification_code",
        "is_verified",
    ]

    list_display_links = ["id", "user", "course", "certificate_type"]
    list_filter = ["certificate_type", "is_verified"]
    search_fields = ["course", "user", "certificate_type", "title", "verification_code"]
    readonly_fields = ["id", "verification_code"]
    ordering = ["-id"]


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing Discussion model in Django Admin interface.
    """

    list_display = ["id", "title", "author", "category", "course", "status"]

    list_display_links = ["id", "title", "author", "category"]
    list_filter = ["category", "status"]
    search_fields = [
        "title",
        "author",
        "category",
        "course",
    ]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-id"]


@admin.register(DiscussionReply)
class DiscussionReplyAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing DiscussionReply model in Django Admin interface.
    """

    list_display = ["id", "discussion", "author", "parent_reply", "is_solution"]

    list_display_links = ["id", "discussion", "author"]
    list_filter = ["is_solution"]
    search_fields = ["discussion", "author"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-id"]
